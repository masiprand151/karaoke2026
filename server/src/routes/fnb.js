const prisma = require("../configs/prisma");
const route = require("express").Router();
const AppError = require("../helpers/AppError");
const recalculateTransaction = require("../helpers/recalculateTransaction");

// Ambil daftar F&B
route.get("/", async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const fnbs = await prisma.fnb.findMany({
      where: {
        name: {
          contains: search,
        },
      },
    });
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
      //------------------------------------------
      // VALIDASI F&B
      //------------------------------------------
      const fnb = await trx.fnb.findUnique({ where: { id: Number(fnbId) } });
      if (!fnb) throw new AppError(404, "F&B tidak ditemukan");
      if (fnb.isStock && fnb.stock < Number(quantity)) {
        throw new AppError(400, "Stock F&B tidak cukup");
      }

      //------------------------------------------
      // HITUNG SUBTOTAL (tanpa tax/service)
      //------------------------------------------
      const unitPrice = Number(fnb.basePrice);
      const subtotal = unitPrice * Number(quantity);

      //------------------------------------------
      // SIMPAN SESSION FNB
      //------------------------------------------
      const sessionFnb = await trx.sessionFnb.create({
        data: {
          sessionId: Number(sessionId),
          fnbId: fnb.id,
          quantity: Number(quantity),
          unitPrice,
          totalAmount: subtotal, // hanya subtotal
        },
      });

      //------------------------------------------
      // UPDATE STOCK
      //------------------------------------------
      if (fnb.isStock) {
        await trx.fnb.update({
          where: { id: fnb.id },
          data: { stock: fnb.stock - Number(quantity) },
        });
      }

      //------------------------------------------
      // UPDATE TRANSACTION (pakai helper)
      //------------------------------------------
      const updatedTransaction = await recalculateTransaction(sessionId, trx);

      return { sessionFnb, transaction: updatedTransaction };
    });

    res.status(201).json({ success: true, result });
  } catch (error) {
    next(error);
  }
});

route.put("/order/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const result = await prisma.$transaction(async (trx) => {
      const sessionFnb = await trx.sessionFnb.findUnique({
        where: { id: Number(id) },
        include: {
          fnb: true,
          session: true,
        },
      });

      if (!sessionFnb) {
        throw new AppError(404, "Order tidak ditemukan");
      }

      const oldQty = sessionFnb.quantity;
      const newQty = Number(quantity);
      const diff = newQty - oldQty;

      if (sessionFnb.fnb.isStock && sessionFnb.fnb.stock < diff) {
        throw new AppError(400, "Stock F&B tidak cukup");
      }

      const updatedSessionFnb = await trx.sessionFnb.update({
        where: {
          id: sessionFnb.id,
        },
        data: {
          quantity: newQty,
          totalAmount: Number(sessionFnb.unitPrice) * newQty,
        },
      });

      if (sessionFnb.fnb.isStock) {
        await trx.fnb.update({
          where: {
            id: sessionFnb.fnb.id,
          },
          data: {
            stock: {
              decrement: diff,
            },
          },
        });
      }

      const updatedTransaction = await recalculateTransaction(
        sessionFnb.sessionId,
        trx,
      );

      return {
        sessionFnb: updatedSessionFnb,
        transaction: updatedTransaction,
      };
    });

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = route;
