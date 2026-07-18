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
      //------------------------------------------
      // FNB VALIDATION
      //------------------------------------------
      const fnb = await trx.fnb.findUnique({ where: { id: Number(fnbId) } });
      if (!fnb) throw new AppError(404, "F&B tidak ditemukan");
      if (fnb.isStock && fnb.stock < Number(quantity))
        throw new AppError(400, "Stock F&B tidak cukup");

      //------------------------------------------
      // HITUNG SUBTOTAL (tanpa tax/service)
      //------------------------------------------
      const unitPrice = Number(fnb.basePrice);
      const subtotal = unitPrice * Number(quantity);

      //------------------------------------------
      // SIMPAN SESSION FNB (totalAmount = subtotal saja)
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
      // UPDATE TRANSACTION
      //------------------------------------------
      const session = await trx.session.findUnique({
        where: { id: Number(sessionId) },
        include: {
          transaction: true,
          sessionFnbs: { include: { fnb: true } },
          sessionLadies: { include: { lady: true } },
        },
      });

      if (!session || !session.transaction)
        throw new AppError(404, "Transaction tidak ditemukan");

      // Ambil pricing
      const pricing = await trx.pricing.findUnique({
        where: { id: session.transaction.pricingId },
      });

      let amount = Number(pricing.baseRate);
      let tax = (amount * Number(pricing.taxRate)) / 100;
      let service = (amount * Number(pricing.serviceCharge)) / 100;

      // Hitung ulang F&B (subtotal + tax/service)
      let fnbSubtotal = 0;
      session.sessionFnbs.forEach((sf) => {
        const sub = Number(sf.unitPrice) * sf.quantity;
        fnbSubtotal += sub;
        tax += (sub * Number(sf.fnb.taxRate)) / 100;
        service += (sub * Number(sf.fnb.serviceCharge)) / 100;
      });

      // Hitung ulang Lady (tanpa tax/service)
      let ladyTotal = 0;
      session.sessionLadies.forEach((sl) => {
        ladyTotal += Number(sl.totalAmount);
      });

      const grandTotal = amount + fnbSubtotal + ladyTotal + tax + service;

      const updatedTransaction = await trx.transaction.update({
        where: { id: session.transaction.id },
        data: {
          amount,
          taxAmount: tax,
          serviceAmount: service,
          grandTotal,
        },
      });

      return { sessionFnb, transaction: updatedTransaction };
    });

    res.status(201).json({ success: true, result });
  } catch (error) {
    next(error);
  }
});

module.exports = route;
