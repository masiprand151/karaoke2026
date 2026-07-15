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
      // ROOM
      //------------------------------------------

      const room = await tx.room.findUnique({
        where: {
          id: roomId,
        },
      });

      if (!room) {
        throw new AppError("Room tidak ditemukan", 404);
      }

      //------------------------------------------
      // ROOM MASIH DIPAKAI?
      //------------------------------------------

      if (room.status === "used" || room.status === "maintenent") {
        throw new AppError("Room sedang digunakan", 400);
      }
      // room off
      if (room.status === "offline") {
        throw new AppError("Room sedang offline", 400);
      }

      //------------------------------------------
      // PRICING
      //------------------------------------------

      const pricing = await tx.pricing.findUnique({
        where: {
          id: pricingId,
        },
      });

      if (!pricing) {
        throw new AppError("Pricing tidak ditemukan", 404);
      }

      //------------------------------------------
      // WAKTU
      //------------------------------------------

      const start = new Date();

      const end = new Date(start.getTime() + durationMinutes * 60000);

      //------------------------------------------
      // ROOM PRICE
      //------------------------------------------

      let roomPrice = Number(pricing.baseRate);

      // jika regular dihitung per jam

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

      await tx.room.update({
        where: {
          id: roomId,
        },
        data: {
          status: "used",
        },
      });

      return {
        session,
        pricing,
        roomPrice,
      };
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Preview transaksi untuk sebuah session
route.get("/preview/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await prisma.session.findUnique({
      where: { id: parseInt(sessionId) },
      include: {
        room: true,
        transaction: true,
        sessionFnbs: { include: { fnb: true } },
        sessionLadies: { include: { lady: true } },
      },
    });

    if (!session) return res.status(404).json({ error: "Session not found" });

    // Ambil pricing dari transaksi atau default room pricing
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

    // Hitung base amount
    const amount = Number(pricing.baseRate);
    const taxAmount = (amount * Number(pricing.taxRate)) / 100;
    const serviceAmount = (amount * Number(pricing.serviceCharge)) / 100;

    // Hitung F&B
    let fnbTotal = 0;
    session.sessionFnbs.forEach((sf) => {
      fnbTotal += Number(sf.totalAmount);
    });

    // Hitung Lady
    let ladyTotal = 0;
    session.sessionLadies.forEach((sl) => {
      ladyTotal += Number(sl.totalAmount);
    });

    const grandTotal =
      amount + taxAmount + serviceAmount + fnbTotal + ladyTotal;

    res.json({
      ...session,
      amount,
      taxAmount,
      serviceAmount,
      fnbTotal,

      pricing: pricing.name,
      ladyTotal,
      grandTotal,
      status: session.transaction ? session.transaction.status : "pending",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Billing preview error" });
  }
});

module.exports = route;
