const prisma = require("../configs/prisma");
const AppError = require("../helpers/AppError");
const recalculateTransaction = require("../helpers/recalculateTransaction");
const { getIo } = require("../routes/socket.io");

const checkin = async (req, res, next) => {
  try {
    const { roomId, pricingId, customerName, userId, durationMinutes } =
      req.body;

    const result = await prisma.$transaction(async (tx) => {
      // ROOM VALIDATION
      const room = await tx.room.findUnique({ where: { id: roomId } });
      if (!room) throw new AppError(404, "Room tidak ditemukan");
      if (["used", "maintenent", "offline"].includes(room.status)) {
        throw new AppError(400, `Room sedang ${room.status}`);
      }

      // PRICING
      const pricing = await tx.pricing.findUnique({
        where: { id: pricingId },
        include: {
          pricingFnbs: { include: { fnb: true } },
          pricingLadies: true,
        },
      });
      if (!pricing) throw new AppError(400, "Pricing tidak ditemukan");

      // checkin package
      if (pricing.isPackage) {
        const start = new Date();
        const end = new Date(start.getTime() + pricing.durationMinutes * 60000);

        const session = await tx.session.create({
          data: {
            roomId,
            customerName,
            userId: Number(userId),
            start,
            end,
            durationMinutes: Number(pricing.durationMinutes),
            extendMinutes: 0,
            freeMinutes: 0,
          },
        });

        // update room status
        await tx.room.update({
          where: { id: roomId },
          data: { status: "used" },
        });

        // buat transaction
        const baseRate = Number(pricing.baseRate);
        const taxAmount = (baseRate * Number(pricing.taxRate)) / 100;
        const serviceAmount = (baseRate * Number(pricing.serviceCharge)) / 100;
        const grandTotal = baseRate + taxAmount + serviceAmount;

        const transaction = await tx.transaction.create({
          data: {
            number: `INV-${Date.now()}`,
            sessionId: session.id,
            pricingId,
            amount: baseRate,
            taxAmount,
            serviceAmount,
            grandTotal,
            paymentMethod: "cash",
            status: "pending",
          },
        });

        // auto insert FnB dari paket
        for (const pf of pricing.pricingFnbs) {
          await tx.sessionFnb.create({
            data: {
              sessionId: session.id,
              fnbId: pf.fnbId,
              quantity: pf.quantity,
              unitPrice: 0, // gratis
              totalAmount: 0, // gratis
            },
          });

          await tx.fnb.update({
            where: { id: pf.fnbId },
            data: { stock: { decrement: pf.quantity } },
          });
        }

        // TODO: kalau ada ladyQty → insert ke sessionLady

        // log checkin
        await tx.sessionLog.create({
          data: {
            sessionId: session.id,
            transactionId: transaction.id,
            type: "checkin",
            action: "create",
            role: "system",
            userId,
            newValue: { customerName, roomId, pricingId },
          },
        });

        return { session, transaction };
      }

      // checkin regular
      const start = new Date();
      const end = new Date(start.getTime() + durationMinutes * 60000);
      const roomPrice = (Number(pricing.baseRate) / 60) * durationMinutes;

      const session = await tx.session.create({
        data: {
          roomId,
          userId,
          customerName,
          start,
          end,
          durationMinutes,
          extendMinutes: 0,
          freeMinutes: 0,
        },
      });

      const taxAmount = (roomPrice * Number(pricing.taxRate)) / 100;
      const serviceAmount = (roomPrice * Number(pricing.serviceCharge)) / 100;
      const grandTotal = roomPrice + taxAmount + serviceAmount;

      const transaction = await tx.transaction.create({
        data: {
          number: `INV-${Date.now()}`,
          sessionId: session.id,
          pricingId,
          amount: roomPrice,
          taxAmount,
          serviceAmount,
          grandTotal,
          paymentMethod: "cash",
          status: "pending",
        },
      });

      const roomUpdate = await tx.room.update({
        where: { id: roomId },
        data: { status: "used" },
      });

      return { transaction, session, room: roomUpdate };
    });

    const io = getIo();

    io.to(result.room.name).emit("checkin", result);

    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const freeMinute = async (req, res, next) => {
  try {
    const { sessionId, addMinutes } = req.body;

    // Validasi: hanya boleh 1–30 menit
    if (addMinutes < 1 || addMinutes > 30) {
      throw new AppError(400, "Penambahan waktu maksimal 30 menit");
    }

    const session = await prisma.session.findUnique({
      where: { id: Number(sessionId), closed: false },
    });

    if (!session) {
      throw new AppError(404, "Session tidak ditemukan");
    }

    const now = Date.now();

    const startTime = new Date(session.start).getTime();
    const endTime = new Date(session.end).getTime();

    const totalDuration = endTime - startTime;
    const remaining = Math.max(endTime - now, 0);

    if (session.freeMinutes > 30) {
      throw new AppError(400, "Penambahan waktu maksimal 30 menit");
    }

    if (remaining <= 0) {
      throw new AppError(
        401,
        "Waktu awal sudah berakhir tidak bisa tambah waktu",
      );
    }

    // Hitung end baru
    const newEnd = new Date(session.end.getTime() + addMinutes * 60000);

    // Update session
    const updated = await prisma.session.update({
      where: { id: session.id },
      data: {
        end: newEnd,
        freeMinutes: session.freeMinutes + addMinutes, // simpan total extend
      },
    });

    res.json({ success: true, updated });
  } catch (error) {
    next(error);
  }
};

const editDuration = async (req, res, next) => {
  try {
    const { sessionId, durationMinutes } = req.body;

    if (durationMinutes < 1 || durationMinutes > 540) {
      throw new AppError(400, "Durasi maksimal 9 jam");
    }

    // Ambil session
    const session = await prisma.session.findUnique({
      where: { id: Number(sessionId), closed: false },
      include: { transaction: { include: { pricing: true } } },
    });
    if (!session) throw new AppError(404, "Session tidak ditemukan");

    // jika pengurangan harus admin
    if (
      Number(durationMinutes) < session.durationMinutes &&
      req.user.role !== "admin"
    ) {
      throw new AppError(401, "Akses di tolak");
    }

    // Hitung end baru dari start + durationMinutes
    const newEnd = new Date(
      new Date(session.start).getTime() + durationMinutes * 60000,
    );

    // Hitung ulang Room amount
    const baseRate = Number(session.transaction.pricing.baseRate);
    const amount = (baseRate / 60) * durationMinutes;

    // Update session + transaction
    const updatedSession = await prisma.session.update({
      where: { id: session.id },
      data: {
        end: newEnd,
        durationMinutes, // simpan durasi baru
        transaction: {
          update: { amount },
        },
      },
      include: { transaction: true },
    });

    // Recalculate transaction (Room, F&B, Lady, diskon)
    const updatedTransaction = await recalculateTransaction(sessionId, prisma);

    // Simpan log perubahan
    await prisma.sessionLog.create({
      data: {
        sessionId: session.id,
        transactionId: session.transaction.id,
        type: "duration",
        targetId: session.id,
        action: "update",
        oldValue: session,
        newValue: updatedSession,
        role: req.user.role,
        userId: req.user.id,
      },
    });

    res.json({ success: true, updatedSession, updatedTransaction });
  } catch (error) {
    next(error);
  }
};

const extendDuration = async (req, res, next) => {
  try {
    const { sessionId, extendMinutes } = req.body;
    // extendMinutes = total menit extend yang diinginkan

    if (extendMinutes < 0 || extendMinutes > 540) {
      throw new AppError(400, "Extend maksimal 9 jam");
    }

    const session = await prisma.session.findUnique({
      where: { id: Number(sessionId), closed: false },
      include: { transaction: { include: { pricing: true } } },
    });
    if (!session) throw new AppError(404, "Session tidak ditemukan");

    const now = Date.now();
    const endTime = new Date(session.end).getTime();
    if (endTime <= now) {
      throw new AppError(400, "Session sudah berakhir, tidak bisa extend");
    }
    // jika pengurangan harus admin
    if (
      Number(extendMinutes) < session.extendMinutes &&
      req.user.role !== "admin"
    ) {
      throw new AppError(401, "Akses di tolak");
    }

    // Hitung durasi baru = durasi awal + extendMinutes
    const durationMinutes =
      Number(session.durationMinutes) + Number(extendMinutes);

    // End baru = start + durasi total
    const newEnd = new Date(
      new Date(session.start).getTime() + durationMinutes * 60000,
    );

    // Hitung ulang Room amount
    const baseRate = Number(session.transaction.pricing.baseRate);
    const amount = (baseRate / 60) * durationMinutes;

    // Update session
    const updatedSession = await prisma.session.update({
      where: { id: session.id },
      data: {
        end: newEnd,
        extendMinutes, // simpan total extend baru
        transaction: {
          update: { amount },
        },
      },
      include: { transaction: true },
    });

    // Recalculate transaction
    const updatedTransaction = await recalculateTransaction(sessionId, prisma);
    // Simpan log perubahan
    await prisma.sessionLog.create({
      data: {
        sessionId: session.id,
        transactionId: session.transaction.id,
        type: "duration",
        targetId: session.id,
        action: "update",
        oldValue: session,
        newValue: updatedSession,
        role: req.user.role,
        userId: req.user.id,
      },
    });

    res.json({ success: true, updatedSession, updatedTransaction });
  } catch (error) {
    next(error);
  }
};

const preview = async (req, res, next) => {
  const { sessionId } = req.params;

  try {
    const session = await prisma.session.findUnique({
      where: { id: parseInt(sessionId), closed: false },
      include: {
        room: true,
        transaction: {
          include: {
            pricing: true,
          },
        },
        sessionFnbs: { include: { fnb: true } },
        sessionLadies: { include: { lady: true } },
      },
    });

    if (!session) return res.status(404).json({ error: "Session not found" });

    // Ambil langsung dari transaction (jangan hitung ulang)
    const trcn = session.transaction;
    // Hitung F&B
    let fnbSubtotal = 0;
    let fnbTax = 0;
    let fnbService = 0;

    session.sessionFnbs.forEach((sf) => {
      const subtotal = Number(sf.unitPrice) * sf.quantity;
      fnbSubtotal += subtotal;

      fnbTax += (subtotal * Number(sf.fnb.taxRate)) / 100;
      fnbService += (subtotal * Number(sf.fnb.serviceCharge)) / 100;
    });

    // Hitung Lady
    let ladyTotal = 0;
    session.sessionLadies.forEach((sl) => {
      ladyTotal += Number(sl.totalAmount);
    });

    res.json({
      ...session,
      pricing: trcn ? trcn.pricing : null,
      amount: trcn ? trcn.amount : 0,
      fnbSubtotal,
      ladyTotal: ladyTotal,
      taxAmount: trcn ? trcn.taxAmount : 0,
      serviceAmount: trcn ? trcn.serviceAmount : 0,
      roomDis: trcn ? trcn.roomDis : 0,
      roomDisAmount: trcn ? trcn.roomDisAmount : 0,
      grandTotal: trcn ? trcn.grandTotal : 0,
      status: trcn ? trcn.status : "pending",
    });
  } catch (err) {
    next(err);
  }
};

const checkout = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const result = await prisma.$transaction(async (trx) => {
      const session = await trx.session.findUnique({
        where: { id: Number(sessionId) },
        include: {
          transaction: true,
          sessionLadies: { include: { lady: true } },
        },
      });
      if (!session) throw new AppError(404, "Session tidak ditemukan");

      // Reset room status ke standby
      await trx.room.update({
        where: { id: session.roomId },
        data: { status: "standby" },
      });

      // Reset semua Lady yang masih isJob = true
      for (const sl of session.sessionLadies) {
        if (sl.lady.isJob) {
          await trx.lady.update({
            where: { id: sl.ladyId },
            data: { isJob: false },
          });
        }
      }

      await trx.session.update({
        where: {
          id: Number(session.id),
        },
        data: {
          closed: true,
        },
      });
      return { transaction: session.transaction };
    });

    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

const payment = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const { method, amount } = req.body;

    const result = await prisma.$transaction(async (trx) => {
      const transaction = await trx.transaction.findUnique({
        where: { id: Number(transactionId) },
      });
      if (!transaction) throw new AppError(404, "Transaction tidak ditemukan");

      // Buat record Payment
      const payment = await trx.payment.create({
        data: {
          transactionId: transaction.id,
          method,
          amount: Number(amount),
          paidAt: new Date(),
        },
      });

      // Update status Transaction
      let newStatus = transaction.status;
      if (Number(amount) >= Number(transaction.grandTotal)) {
        newStatus = "paid";
      }

      const updatedTransaction = await trx.transaction.update({
        where: { id: transaction.id },
        data: { status: newStatus, paymentMethod: method },
      });

      return { payment, transaction: updatedTransaction };
    });

    res.status(200).json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

const discountRoom = async (req, res, next) => {
  try {
    const { transactionId, discount } = req.body;
    const { role } = req.user;
    if (role !== "admin") {
      throw new AppError(400, "Akses di tolak");
    }

    const result = await prisma.$transaction(async (trx) => {
      // ambil sessionId dari transaction
      const trcn = await trx.transaction.findUnique({
        where: { id: Number(transactionId) },
      });
      if (!trcn) throw new AppError(404, "Transaction tidak ditemukan");

      // panggil helper dengan diskon
      const updatedTransaction = await recalculateTransaction(
        trcn.sessionId,
        trx,
        Number(discount),
      );

      return updatedTransaction;
    });

    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkin,
  freeMinute,
  editDuration,
  extendDuration,
  preview,
  checkout,
  payment,
  discountRoom,
};
