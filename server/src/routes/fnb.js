const prisma = require("../configs/prisma");
const route = require("express").Router();
const AppError = require("../helpers/AppError");

// Ambil daftar F&B
route.get("/", async (req, res, next) => {
  try {
    const fnbs = await prisma.fnb.findMany();
    res.status(200).json({
      success: true,
      fnbs,
    });
  } catch (error) {
    next(error);
  }
});

route.post("/order", async (req, res, next) => {
  try {
    const { sessionId, fnbId, quantity } = req.body;
    const result = await prisma.$transaction(async (trx) => {
      const fnb = await trx.fnb.findUnique({
        where: {
          id: Number(fnbId),
        },
      });

      if (!fnb) {
        throw new AppError(404, "F&B tidak di temukan");
      }

      if (fnb.stock < Number(quantity)) {
        throw new AppError(400, "Stock fnb tidak cukup");
      }

      const unitPrice = Number(fnb.basePrice);
      const subtotal = unitPrice * Number(quantity);
      // Hitung tax & service
      const taxAmount = (subtotal * Number(fnb.taxRate)) / 100;
      const serviceAmount = (subtotal * Number(fnb.serviceCharge)) / 100;
      const totalAmount = subtotal + taxAmount + serviceAmount;

      const sessionFnb = await trx.sessionFnb.create({
        data: {
          sessionId: Number(sessionId),
          fnbId: fnb.id,
          quantity: Number(quantity),
          unitPrice,
          totalAmount,
        },
      });

      // update stock
      if (fnb.isStock) {
        const newStock = Number(fnb.stock) - Number(quantity);

        await trx.fnb.update({
          where: {
            id: fnb.id,
          },
          data: {
            stock: newStock,
          },
        });
      }

      return {
        sessionFnb,
        breakdown: {
          subtotal,
          taxAmount,
          serviceAmount,
          totalAmount,
        },
      };
    });

    res.status(201).json({
      success: true,
      result,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = route;
