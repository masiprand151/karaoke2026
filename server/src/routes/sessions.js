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
      let roomPrice = Number(pricing.baseRate);
      if (pricing.name.toUpperCase() === "REGULAR") {
        roomPrice = (roomPrice / 60) * durationMinutes;
      }

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
route.get("/preview/:sessionId", async (req, res) => {
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

    // Ambil pricing
    let pricing = null;
    if (session.transaction) {
      pricing = await prisma.pricing.findUnique({
        where: { id: session.transaction.pricingId },
      });
    } else {
      pricing = await prisma.pricing.findFirst({
        where: { roomId: session.roomId },
      });
    }
    if (!pricing) return res.status(400).json({ error: "Pricing not found" });

    // Hitung Room
    const amount = Number(pricing.baseRate);
    let taxAmount = (amount * Number(pricing.taxRate)) / 100;
    let serviceAmount = (amount * Number(pricing.serviceCharge)) / 100;

    // Hitung F&B (subtotal saja, tax/service ditambahkan ke variabel global)
    let fnbSubtotal = 0;
    session.sessionFnbs.forEach((sf) => {
      const subtotal = Number(sf.unitPrice) * sf.quantity;
      fnbSubtotal += subtotal;
      taxAmount += (subtotal * Number(sf.fnb.taxRate)) / 100;
      serviceAmount += (subtotal * Number(sf.fnb.serviceCharge)) / 100;
    });

    // Hitung Lady (tanpa tax/service)
    let ladyTotal = 0;
    session.sessionLadies.forEach((sl) => {
      ladyTotal += Number(sl.totalAmount);
    });

    // Grand total
    const grandTotal =
      amount + fnbSubtotal + ladyTotal + taxAmount + serviceAmount;

    res.json({
      ...session,
      pricing: pricing.name,
      amount,
      fnbSubtotal,
      ladyTotal,
      taxAmount,
      serviceAmount,
      grandTotal,
      status: session.transaction ? session.transaction.status : "pending",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Billing preview error" });
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

module.exports = route;
