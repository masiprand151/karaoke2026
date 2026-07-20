const prisma = require("../configs/prisma");
const route = require("express").Router();
const AppError = require("../helpers/AppError");

route.get("/", async (req, res, next) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        sessions: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    res.status(200).json({
      success: true,
      rooms,
    });
  } catch (error) {
    next(error);
  }
});

route.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const room = await prisma.room.findUnique({
      where: {
        id,
      },
      include: {
        pricings: true,
      },
    });

    res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    next(error);
  }
});

route.post("/move", async (req, res, next) => {
  try {
    const { sessionId, newRoomId } = req.body;

    const result = await prisma.$transaction(async (trx) => {
      // Ambil session + room lama
      const session = await trx.session.findUnique({
        where: { id: Number(sessionId) },
        include: { room: true, transaction: true },
      });
      if (!session) throw new AppError(404, "Session tidak ditemukan");

      // Validasi room baru
      const newRoom = await trx.room.findUnique({
        where: { id: Number(newRoomId) },
      });
      if (!newRoom) throw new AppError(404, "Room baru tidak ditemukan");
      if (newRoom.status !== "standby")
        throw new AppError(400, "Room baru tidak tersedia");

      // Update room lama jadi standby
      await trx.room.update({
        where: { id: session.roomId },
        data: { status: "standby" },
      });

      // Update session ke room baru
      const updatedSession = await trx.session.update({
        where: { id: session.id },
        data: { roomId: newRoomId },
      });

      // Update room baru jadi used
      await trx.room.update({
        where: { id: newRoomId },
        data: { status: "used" },
      });

      // Jika pricing per room berbeda, update transaction pricing
      if (session.transaction) {
        const pricing = await trx.pricing.findFirst({
          where: { roomId: newRoomId },
        });
        if (pricing) {
          await trx.transaction.update({
            where: { id: session.transaction.id },
            data: { pricingId: pricing.id },
          });
        }
      }

      return { session: updatedSession, newRoom };
    });

    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
});

module.exports = route;
