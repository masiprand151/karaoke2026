const AppError = require("./AppError");

async function recalculateTransaction(sessionId, trx, discountRate = 0) {
  const session = await trx.session.findUnique({
    where: { id: Number(sessionId) },
    include: {
      transaction: { include: { pricing: true } },
      room: true,
      sessionFnbs: { include: { fnb: true } },
      sessionLadies: { include: { lady: true } },
    },
  });

  if (!session || !session.transaction) {
    throw new AppError(404, "Transaction tidak ditemukan");
  }
  //---------------------------------------
  // ROOM (pakai pricing)
  //---------------------------------------
  const roomAmount = Number(session.transaction.amount); // base rate × duration
  let roomTax =
    (roomAmount * Number(session.transaction.pricing.taxRate || 0)) / 100;
  let roomService =
    (roomAmount * Number(session.transaction.pricing.serviceCharge || 0)) / 100;

  // --- Diskon Room ---
  const existingDis = Number(session.transaction.roomDis || 0);
  const totalDiscountRate = existingDis + discountRate;
  const discountAmount = (roomAmount * totalDiscountRate) / 100;

  let roomTotal = roomAmount - discountAmount; // hanya base setelah diskon

  if (totalDiscountRate >= 100) {
    roomTax = 0;
    roomService = 0;
    roomTotal = 0;
  }

  //---------------------------------------
  // FNB
  //---------------------------------------
  let fnbSubtotal = 0,
    fnbTax = 0,
    fnbService = 0;
  for (const sf of session.sessionFnbs) {
    const subtotal = Number(sf.totalAmount);
    fnbSubtotal += subtotal;
    fnbTax += (subtotal * Number(sf.fnb.taxRate || 0)) / 100;
    fnbService += (subtotal * Number(sf.fnb.serviceCharge || 0)) / 100;
  }

  //---------------------------------------
  // LADY
  //---------------------------------------
  let ladyTotal = 0;
  for (const sl of session.sessionLadies) {
    ladyTotal += Number(sl.totalAmount);
  }

  //---------------------------------------
  // TOTAL
  //---------------------------------------
  const taxAmount = roomTax + fnbTax;
  const serviceAmount = roomService + fnbService;
  const grandTotal =
    roomTotal + fnbSubtotal + ladyTotal + taxAmount + serviceAmount;
  //---------------------------------------
  // UPDATE TRANSACTION
  //---------------------------------------
  return trx.transaction.update({
    where: { id: session.transaction.id },
    data: {
      roomDis: totalDiscountRate,
      roomDisAmount: discountAmount,
      amount: roomAmount, // tetap simpan base room rate
      taxAmount,
      serviceAmount,
      grandTotal,
    },
  });
}

module.exports = recalculateTransaction;
