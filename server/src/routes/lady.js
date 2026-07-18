const prisma = require("../configs/prisma");
const route = require("express").Router();
const AppError = require("../helpers/AppError");

// get all
route.get("/", async (req, res, next) => {
  try {
    const lady = await prisma.lady.findMany();

    res.status(200).json({
      success: true,
      ladies: lady,
    });
  } catch (error) {
    next(error);
  }
});

// Order Lady untuk session (tanpa tax & service)
route.post("/order", async (req, res, next) => {
  const { sessionId, ladyId, quantity } = req.body;

  try {
    const lady = await prisma.lady.findUnique({
      where: { id: Number(ladyId) },
    });
    if (!lady) throw new AppError(404, "Lady tidak ditemukan");

    if (lady.isJob) {
      throw new AppError(400, `Lady ${lady.name} sedang di dalam room`);
    }

    const unitPrice = Number(lady.basePrice);
    const totalAmount = unitPrice * Number(quantity);

    //------------------------------------------
    // WAKTU
    //------------------------------------------

    const start = new Date();

    const end = new Date(start.getTime() + Number(quantity) * 3600000);

    const sessionLady = await prisma.sessionLady.create({
      data: {
        sessionId: Number(sessionId),
        ladyId: Number(ladyId),
        quantity: Number(quantity),
        unitPrice,
        start,
        end,
        totalAmount,
      },
    });

    await prisma.lady.update({
      where: {
        id: ladyId,
      },
      data: {
        isJob: true,
      },
    });

    res.json({
      success: true,
      sessionLady,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = route;
