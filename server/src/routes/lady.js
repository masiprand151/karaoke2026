const prisma = require("../configs/prisma");
const route = require("express").Router();
const AppError = require("../helpers/AppError");

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
      // UPDATE TRANSACTION
      //------------------------------------------
      const session = await trx.session.findUnique({
        where: { id: Number(sessionId), closed: false },
        include: {
          transaction: true,
          sessionFnbs: { include: { fnb: true } },
          sessionLadies: { include: { lady: true } },
        },
      });

      if (!session || !session.transaction)
        throw new AppError(404, "Transaction tidak ditemukan");

      // Ambil Room dari transaction (sudah sesuai durasi)
      let amount = Number(session.transaction.amount);
      let roomTax = Number(session.transaction.taxAmount);
      let roomService = Number(session.transaction.serviceAmount);

      // Hitung ulang F&B (subtotal + tax/service)
      let fnbSubtotal = 0;
      let fnbTax = 0;
      let fnbService = 0;
      session.sessionFnbs.forEach((sf) => {
        const sub = Number(sf.unitPrice) * sf.quantity;
        fnbSubtotal += sub;
        fnbTax += (sub * Number(sf.fnb.taxRate)) / 100;
        fnbService += (sub * Number(sf.fnb.serviceCharge)) / 100;
      });

      // Hitung ulang Lady (tanpa tax/service)
      let ladyTotal = 0;
      session.sessionLadies.forEach((sl) => {
        ladyTotal += Number(sl.totalAmount);
      });

      // GrandTotal = Room + F&B + Lady
      const grandTotal =
        amount +
        roomTax +
        roomService +
        fnbSubtotal +
        fnbTax +
        fnbService +
        ladyTotal;

      const updatedTransaction = await trx.transaction.update({
        where: { id: session.transaction.id },
        data: {
          amount,
          taxAmount: roomTax + fnbTax,
          serviceAmount: roomService + fnbService,
          grandTotal,
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

module.exports = route;
