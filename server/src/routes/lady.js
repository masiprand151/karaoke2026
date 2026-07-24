const prisma = require("../configs/prisma");
const route = require("express").Router();
const AppError = require("../helpers/AppError");
const recalculateTransaction = require("../helpers/recalculateTransaction");

// get all
route.get("/", async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const lady = await prisma.lady.findMany({
      where: {
        name: {
          contains: search,
        },
      },
    });

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
  try {
    const { sessionId, ladyId, quantity } = req.body;

    const result = await prisma.$transaction(async (trx) => {
      //------------------------------------------
      // VALIDASI LADY
      //------------------------------------------
      const lady = await trx.lady.findUnique({ where: { id: Number(ladyId) } });
      if (!lady) throw new AppError(404, "Lady tidak ditemukan");
      if (lady.isJob)
        throw new AppError(400, `Lady ${lady.name} sedang di dalam room`);

      //------------------------------------------
      // HITUNG HARGA & WAKTU
      //------------------------------------------
      const unitPrice = Number(lady.basePrice);
      const totalAmount = unitPrice * Number(quantity);

      const start = new Date();
      const end = new Date(start.getTime() + Number(quantity) * 3600000);

      //------------------------------------------
      // SIMPAN SESSION LADY
      //------------------------------------------
      const sessionLady = await trx.sessionLady.create({
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

      // Update status Lady jadi sedang kerja
      await trx.lady.update({
        where: { id: ladyId },
        data: { isJob: true },
      });

      //------------------------------------------
      // UPDATE TRANSACTION (pakai helper)
      //------------------------------------------
      const updatedTransaction = await recalculateTransaction(sessionId, trx);

      // log
      await trx.sessionLog.create({
        data: {
          sessionId: sessionLady.sessionId,
          transactionId: updatedTransaction.id,
          type: "lady",
          targetId: sessionLady.id,
          action: "create",
          oldValue: {},
          newValue: sessionLady,
          role: req.user.role,
          userId: req.user.id,
        },
      });

      return { sessionLady, transaction: updatedTransaction };
    });

    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
});

route.patch("/:ladyId/off", async (req, res, next) => {
  try {
    const { ladyId } = req.params;

    const lady = await prisma.lady.findUnique({
      where: {
        id: Number(ladyId),
      },
    });

    if (!lady) {
      throw new AppError(404, "Lady tidak di temukan");
    }

    if (!lady.isJob) {
      throw new AppError(401, "Lady sedang tidak job");
    }

    await prisma.lady.update({
      where: {
        id: lady.id,
        isJob: true,
      },
      data: {
        isJob: false,
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

route.put("/order/:id", async (req, res, next) => {
  try {
    const { id } = req.params; // id sessionLady
    const { quantity } = req.body;
    const { role } = req.user;
    const result = await prisma.$transaction(async (trx) => {
      //------------------------------------------
      // VALIDASI SESSION LADY
      //------------------------------------------
      const sessionLady = await trx.sessionLady.findUnique({
        where: { id: Number(id) },
        include: { lady: true },
      });
      if (!sessionLady) throw new AppError(404, "Order Lady tidak ditemukan");
      // validasi jika quantity lebih kecil dari sebelumnya
      if (Number(quantity) < Number(sessionLady.quantity) && role !== "admin") {
        throw new AppError(400, "Akses di tolak!");
      }

      //------------------------------------------
      // HITUNG ULANG HARGA & WAKTU
      //------------------------------------------
      const unitPrice = Number(sessionLady.unitPrice);
      const totalAmount = unitPrice * Number(quantity);

      // gunakan start existing dari DB
      const start = new Date(sessionLady.start);
      const end = new Date(start.getTime() + Number(quantity) * 3600000);

      //------------------------------------------
      // UPDATE SESSION LADY
      //------------------------------------------
      const updatedLadyOrder = await trx.sessionLady.update({
        where: { id: sessionLady.id },
        data: {
          quantity: Number(quantity),
          unitPrice,
          totalAmount,
          start, // tetap pakai start lama
          end, // end dihitung ulang dari start lama
        },
      });

      //------------------------------------------
      // UPDATE TRANSACTION (pakai helper)
      //------------------------------------------
      const updatedTransaction = await recalculateTransaction(
        sessionLady.sessionId,
        trx,
      );

      // log
      await trx.sessionLog.create({
        data: {
          sessionId: sessionLady.sessionId,
          transactionId: updatedTransaction.id,
          type: "lady",
          targetId: sessionLady.id,
          action: "update",
          oldValue: sessionLady,
          newValue: updatedLadyOrder,
          role,
          userId: req.user.id,
        },
      });

      return { ladyOrder: updatedLadyOrder, transaction: updatedTransaction };
    });

    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
});

module.exports = route;
