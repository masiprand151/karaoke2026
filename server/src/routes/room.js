const prisma = require("../configs/prisma");
const route = require("express").Router();
const AppError = require("../helpers/AppError");

route.get("/", async (req, res, next) => {
  try {
    const rooms = await prisma.room.findMany();
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
    });

    res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = route;
