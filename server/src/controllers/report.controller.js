const prisma = require("../configs/prisma");
const AppError = require("../helpers/AppError");

// helper untuk ambil range dari query
function getDateRange(req) {
  const { start, end } = req.query;

  const startDate = start ? new Date(start) : undefined;

  const endDate = end ? new Date(end) : undefined;

  if (startDate) {
    startDate.setHours(0, 0, 0, 0);
  }

  if (endDate) {
    endDate.setHours(23, 59, 59, 999);
  }

  return {
    gte: startDate,
    lte: endDate,
  };
}

const cancel = async (req, res, next) => {
  try {
    const range = getDateRange(req);
    const cancelLogs = await prisma.sessionLog.findMany({
      where: {
        action: "delete",
        createdAt: range,
      },
      include: {
        session: {
          include: {
            room: true,
          },
        },
        user: true,
      },
    });
    // Ambil semua fnbId dari oldValue
    const fnbIds = [
      ...new Set(
        cancelLogs
          .filter((log) => log.type === "fnb")
          .map((log) => log.oldValue?.fnbId)
          .filter(Boolean),
      ),
    ];

    // Ambil data F&B
    const fnbs = await prisma.fnb.findMany({
      where: {
        id: {
          in: fnbIds,
        },
      },
    });

    // Jadikan Map supaya pencarian cepat
    const fnbMap = new Map(fnbs.map((fnb) => [fnb.id, fnb]));

    const formatted = cancelLogs.map((log) => {
      let fnb = null;

      if (log.type === "fnb") {
        const fnbId = log.oldValue?.fnbId;

        fnb = fnbMap.get(fnbId) || null;
      }

      return {
        ...log,

        fnb,
      };
    });

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

const purchase = async (req, res, next) => {
  try {
    const range = getDateRange(req);
    const purchaseReport = await prisma.purchase.findMany({
      where: {
        createdAt: range,
      },
      include: { fnb: true, createdBy: true },
    });
    res.json(purchaseReport);
  } catch (error) {
    next(error);
  }
};

const roomDetail = async (req, res, next) => {
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
  } catch (error) {
    next(error);
  }
};

module.exports = { cancel, purchase, roomDetail };
