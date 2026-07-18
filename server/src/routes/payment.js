const prisma = require("../configs/prisma");
const route = require("express").Router();
const AppError = require("../helpers/AppError");

route.post("/payment/:sessionId", async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { method, amountPaid } = req.body; // misalnya: "cash", "transfer", "ewallet"

    const session = await prisma.session.findUnique({
      where: {
        id: Number(sessionId),
      },
      include: {
        room: true,
        sessionFnbs: { include: { fnb: true } },
        sessionLadies: { include: { lady: true } },
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = route;
