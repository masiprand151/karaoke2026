const prisma = require("../configs/prisma");
const route = require("express").Router();
const AppError = require("../helpers/AppError");

// helper untuk ambil range dari query
function getDateRange(req) {
  const { start, end } = req.query;
  return {
    gte: start ? new Date(start) : undefined,
    lte: end ? new Date(end) : undefined,
  };
}

// -------------------- Laporan Pembatalan --------------------
route.get("/cancel", async (req, res, next) => {
  try {
    const range = getDateRange(req);
    const cancelLogs = await prisma.sessionLog.findMany({
      where: {
        action: "delete",
        createdAt: range,
      },
      include: { session: true, user: true },
    });
    res.json(cancelLogs);
  } catch (err) {
    next(new AppError(err.message));
  }
});

// -------------------- Laporan Pembelian --------------------
route.get("/purchase", async (req, res, next) => {
  try {
    const range = getDateRange(req);
    const purchaseReport = await prisma.purchase.findMany({
      where: {
        createdAt: range,
      },
      include: { fnb: true, createdBy: true },
    });
    res.json(purchaseReport);
  } catch (err) {
    next(new AppError(err.message));
  }
});

// -------------------- Laporan Transaksi Room --------------------
route.get("/room/detail", async (req, res, next) => {
  try {
    const range = getDateRange(req);

    const roomTransactions = await prisma.transaction.findMany({
      where: {
        // status: "paid",
        createdAt: range,
      },

      include: {
        session: {
          include: {
            sessionFnbs: true,
            sessionLadies: true,
            room: true,
            user: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = roomTransactions.map((t) => ({
      id: t.id,
      number: t.number,
      createdAt: t.createdAt,

      room: t?.session?.room,

      discount: Number(t.roomDisAmount || 0),

      subtotal: Number(t.amount || 0),

      serviceAmount: Number(t.serviceAmount || 0),

      taxAmount: Number(t.taxAmount || 0),

      grandTotal: Number(t.grandTotal || 0),

      fnbTotal:
        t.session?.sessionFnbs?.reduce(
          (sum, f) => sum + Number(f.totalAmount || 0),
          0,
        ) || 0,

      ladyTotal:
        t.session?.sessionLadies?.reduce(
          (sum, l) => sum + Number(l.totalAmount || 0),
          0,
        ) || 0,
    }));

    res.json(formatted);
  } catch (err) {
    next(new AppError(err.message));
  }
});
module.exports = route;
