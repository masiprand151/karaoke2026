const prisma = require("../configs/prisma");
const route = require("express").Router();
const AppError = require("../helpers/AppError");

// Check-in session
route.post("/checkin", async (req, res, next) => {
  try {
    const { roomId, pricingId, customerName, userId, durationMinutes } =
      req.body;

    const result = await prisma.$transaction(async (tx) => {
      //------------------------------------------
      // ROOM VALIDATION
      //------------------------------------------
      const room = await tx.room.findUnique({ where: { id: roomId } });
      if (!room) throw new AppError(404, "Room tidak ditemukan");
      if (room.status === "used" || room.status === "maintenent")
        throw new AppError(400, "Room sedang digunakan");
      if (room.status === "offline")
        throw new AppError(400, "Room sedang offline");

      //------------------------------------------
      // PRICING
      //------------------------------------------
      const pricing = await tx.pricing.findUnique({ where: { id: pricingId } });
      if (!pricing) throw new AppError(400, "Pricing tidak ditemukan");

      //------------------------------------------
      // WAKTU
      //------------------------------------------
      const start = new Date();
      const end = new Date(start.getTime() + durationMinutes * 60000);

      //------------------------------------------
      // ROOM PRICE
      //------------------------------------------
      let roomPrice = (Number(pricing.baseRate) / 60) * durationMinutes;

      //------------------------------------------
      // SESSION
      //------------------------------------------
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

      //------------------------------------------
      // TRANSACTION (dibuat saat check-in)
      //------------------------------------------
      const taxAmount = (roomPrice * Number(pricing.taxRate)) / 100;
      const serviceAmount = (roomPrice * Number(pricing.serviceCharge)) / 100;
      const grandTotal = roomPrice + taxAmount + serviceAmount;

      const transaction = await tx.transaction.create({
        data: {
          number: `TRX-${Date.now()}`, // nomor unik
          sessionId: session.id,
          pricingId,
          amount: roomPrice,
          taxAmount,
          serviceAmount,
          grandTotal,
          paymentMethod: "cash", // default atau kosong dulu
          status: "pending",
        },
      });

      // Update room status jadi used
      await tx.room.update({
        where: { id: roomId },
        data: { status: "used" },
      });

      return { session, pricing, transaction };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});
// Preview transaksi untuk sebuah session
route.get("/preview/:sessionId", async (req, res, next) => {
  const { sessionId } = req.params;

  try {
    const session = await prisma.session.findUnique({
      where: { id: parseInt(sessionId), closed: false },
      include: {
        room: true,
        transaction: true,
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
      pricing: trcn ? trcn.pricingId : null,
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
});

// Checkout Session
route.post("/checkout/:sessionId", async (req, res, next) => {
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

      if (!session.transaction || session.transaction.status !== "paid") {
        throw new AppError(400, "Transaksi belum lunas, tidak bisa checkout");
      }

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
});

// Create Payment untuk Transaction
route.post("/payment/:transactionId", async (req, res, next) => {
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

    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
});
route.post("/discount", async (req, res, next) => {
  try {
    const { transactionId, discount } = req.body;

    const result = await prisma.$transaction(async (trx) => {
      const trcn = await trx.transaction.findUnique({
        where: { id: Number(transactionId) },
        include: {
          pricing: true,
          session: {
            include: {
              sessionFnbs: { include: { fnb: true } },
              sessionLadies: { include: { lady: true } },
            },
          },
        },
      });

      if (!trcn) throw new AppError(404, "Transaction tidak ditemukan");

      // --- Hitung Room ---
      const baseAmount = Number(trcn.amount);
      const taxRate = Number(trcn.pricing.taxRate);
      const serviceRate = Number(trcn.pricing.serviceCharge);

      let roomTax = (baseAmount * taxRate) / 100;
      let roomService = (baseAmount * serviceRate) / 100;
      let roomTotal = baseAmount + roomTax + roomService;

      // --- Diskon Room ---
      const discountRate = Number(discount);
      const discountAmount = (roomTotal * discountRate) / 100;
      roomTotal -= discountAmount;

      // Kalau diskon 100%, roomTotal = 0 → tax & service ikut nol
      if (discountRate === 100) {
        roomTax = 0;
        roomService = 0;
      }

      // --- Hitung F&B ---
      let fnbSubtotal = 0;
      let fnbTax = 0;
      let fnbService = 0;
      trcn.session.sessionFnbs.forEach((sf) => {
        const sub = Number(sf.unitPrice) * sf.quantity;
        fnbSubtotal += sub;
        fnbTax += (sub * Number(sf.fnb.taxRate)) / 100;
        fnbService += (sub * Number(sf.fnb.serviceCharge)) / 100;
      });

      // --- Hitung Lady ---
      let ladyTotal = 0;
      trcn.session.sessionLadies.forEach((sl) => {
        ladyTotal += Number(sl.totalAmount);
      });

      // --- Total Akhir ---
      const totalAmount = baseAmount; // tetap simpan base room rate
      const totalTax = roomTax + fnbTax;
      const totalService = roomService + fnbService;
      const grandTotal =
        roomTotal + fnbSubtotal + ladyTotal + totalTax + totalService;

      // --- Update Transaction ---
      const newTrcn = await trx.transaction.update({
        where: { id: trcn.id },
        data: {
          roomDis: discountRate,
          roomDisAmount: discountAmount,
          amount: totalAmount,
          taxAmount: totalTax,
          serviceAmount: totalService,
          grandTotal,
        },
      });

      return newTrcn;
    });

    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
});

module.exports = route;
