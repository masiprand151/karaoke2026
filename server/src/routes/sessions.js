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

module.exports = route;
