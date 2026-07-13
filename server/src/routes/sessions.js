const prisma = require("../configs/prisma");
const route = require("express").Router();
const AppError = require("../helpers/AppError");

// Check-in session
route.post("/checkin", async (req, res) => {
  const { userId, roomId, customerName, durationMinutes } = req.body;
  const start = new Date();
  const end = new Date(start.getTime() + durationMinutes * 60000);

  const session = await prisma.session.create({
    data: {
      userId,
      roomId,
      customerName,
      start,
      end,
      durationMinutes,
      extendMinutes: 0,
      freeMinutes: 0,
    },
  });
  res.json({
    success: true,
    session,
  });
});

module.exports = route;
