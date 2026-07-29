const prisma = require("../configs/prisma");
const route = require("express").Router();
const AppError = require("../helpers/AppError");
const recalculateTransaction = require("../helpers/recalculateTransaction");

// Ambil daftar F&B
route.get("/", async (req, res, next) => {
  try {
    const search = req.query.search || "";

    const categoryMap = ["food", "drink", "snack", "other"];
    const normalized = search.toLowerCase();

    const fnbs = await prisma.fnb.findMany({
      where: {
        deletedAt: null,
        OR: [
          {
            name: {
              contains: search,
            },
          },
          categoryMap.includes(normalized)
            ? { category: normalized } // cocokkan enum
            : {}, // kalau bukan kategori valid, kosongkan
        ],
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

// managemen
route.post("/", async (req, res, next) => {
  try {
    const { category, name, basePrice, isStock, taxRate, serviceCharge } =
      req.body;

    const fnbCount = await prisma.fnb.count({
      where: {
        name,
        deletedAt: null,
      },
    });

    if (fnbCount > 0) {
      throw new AppError(400, "Product sudah ada!");
    }

    const validCotegory = ["food", "drink", "snack", "other"];
    if (!category || !validCotegory.includes(category))
      throw AppError(400, "Category tidak valid");

    await prisma.fnb.create({
      data: {
        name,
        category,
        stock: 0,
        isStock,
        basePrice: Number(basePrice),
        taxRate: Number(taxRate),
        serviceCharge: Number(serviceCharge),
      },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

route.put("/:fnbId", async (req, res, next) => {
  try {
    const { fnbId } = req.params;
    const {
      category,
      name,
      basePrice,
      taxRate,
      serviceCharge,
      isStock,
      isPromo,
      stock,
      description,
    } = req.body;

    if (req.user.role !== "admin") {
      throw new AppError(401, "Akses di tolak!");
    }

    const fnb = await prisma.fnb.findUnique({
      where: {
        id: Number(fnbId),
      },
    });

    if (!fnb || fnb.deletedAt !== null) {
      throw new AppError(404, "Product tidak di temukan!");
    }

    const data = {
      name,
      basePrice,
      taxRate,
      serviceCharge,
      isStock,
      stock,
      isPromo,
    };
    const validCotegory = ["food", "drink", "snack", "other"];
    if (!category || !validCotegory.includes(category))
      throw AppError(400, "Category tidak valid");
    data.category = category;

    if (Number(stock) !== Number(fnb.stock)) {
      if (!description || description.trim() === "") {
        throw new AppError(
          400,
          "Juka ingin melakukan perubahan stock, description harus di isi!",
        );
      }
      data.description = description;
    }

    await prisma.fnb.update({
      where: {
        id: Number(fnb.id),
      },
      data,
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

route.delete("/:fnbId", async (req, res, next) => {
  try {
    const { fnbId } = req.params;

    const fnb = await prisma.fnb.findUnique({
      where: {
        id: Number(fnbId),
      },
    });

    if (!fnb || fnb.deletedAt !== null) {
      throw new AppError(404, "Product tidak di temukan");
    }

    await prisma.fnb.update({
      where: {
        id: Number(fnb.id),
      },
      data: {
        deletedAt: new Date(),
      },
    });

    res.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
});

// order
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

      // log
      await trx.sessionLog.create({
        data: {
          sessionId: sessionFnb.sessionId,
          transactionId: updatedTransaction.id,
          type: "fnb",
          targetId: sessionFnb.id,
          action: "create",
          oldValue: {},
          newValue: sessionFnb,
          role: req.user.role,
          userId: req.user.id,
        },
      });

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
    const { role } = req.user;

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

      // validasi jika quantity lebih kecil dari sebelumnya
      if (Number(quantity) < Number(sessionFnb.quantity) && role !== "admin") {
        throw new AppError(400, "Akses di tolak!");
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

      // log
      await trx.sessionLog.create({
        data: {
          sessionId: sessionFnb.sessionId,
          transactionId: updatedTransaction.id,
          type: "fnb",
          targetId: sessionFnb.id,
          action: "update",
          oldValue: sessionFnb,
          newValue: updatedSessionFnb,
          role,
          userId: req.user.id,
        },
      });

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

// hapus order / void
route.delete("/order/:id", async (req, res, next) => {
  try {
    const { id } = req.params; //sessionFnb.id

    const result = await prisma.$transaction(async (trx) => {
      const sessionFnb = await trx.sessionFnb.findUnique({
        where: { id: Number(id) },
      });

      if (!sessionFnb) throw new AppError(404, "Order F&B tidak ditemukan");
      if (req.user.role !== "admin") throw new AppError(401, "Akses di tolak");

      await trx.fnb.update({
        where: {
          id: sessionFnb.fnbId,
        },
        data: {
          stock: {
            increment: sessionFnb.quantity,
          },
        },
      });
      await trx.sessionFnb.delete({ where: { id: sessionFnb.id } });

      // Log delete
      await trx.sessionLog.create({
        data: {
          sessionId: sessionFnb.sessionId,
          transactionId: sessionFnb.transactionId,
          type: "fnb",
          targetId: sessionFnb.id,
          action: "delete",
          oldValue: sessionFnb,
          newValue: null,
          role: req.user.role,
          userId: req.user.id,
        },
      });

      const updatedTransaction = await recalculateTransaction(
        sessionFnb.sessionId,
        trx,
      );

      return { deletedFnbId: sessionFnb.id, transaction: updatedTransaction };
    });

    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
});

// Tambah purchase + update stok
route.post("/purchase", async (req, res) => {
  try {
    const { fnbId, supplierName, invoiceNumber, quantity, unitPrice } =
      req.body;

    const userId = req.user.id;

    const totalAmount = Number(unitPrice) * Number(quantity);

    const purchase = await prisma.$transaction(async (tx) => {
      // simpan purchase
      const newPurchase = await tx.purchase.create({
        data: {
          fnbId: Number(fnbId),
          supplierName,
          invoiceNumber,
          quantity: Number(quantity),
          unitPrice: Number(unitPrice),
          totalAmount,
          createdById: userId,
        },
      });

      // update stok Fnb
      await tx.fnb.update({
        where: { id: fnbId },
        data: {
          stock: { increment: Number(quantity) },
        },
      });

      return newPurchase;
    });

    res.json({ success: true, data: purchase });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Gagal menambah purchase" });
  }
});

module.exports = route;
