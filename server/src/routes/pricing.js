const prisma = require("../configs/prisma");
const route = require("express").Router();
const AppError = require("../helpers/AppError");

// get all package
route.get("/package", async (req, res, next) => {
  try {
    const search = req.query.search || "";

    const packages = await prisma.pricing.findMany({
      where: {
        name: {
          contains: search,
        },
        isPackage: true,
      },
      include: {
        pricingFnbs: true,
      },
    });

    res.status(200).json({
      success: true,
      packages,
    });
  } catch (error) {
    next(error);
  }
});

route.post("/", async (req, res, next) => {
  try {
    const {
      roomId,
      name,
      description,
      baseRate,
      durationMinutes,
      isHoliday,
      isPromo,
      isPackage,
      taxRate,
      serviceCharge,
      fnbs, // array: [{ fnbId, quantity }]
      ladyQty, //jimlah bandle lady
    } = req.body;

    const userRole = req.user.role;

    // hanya admin boleh
    if (userRole !== "admin") {
      throw new AppError(401, "Akses ditolak");
    }

    // validasi room
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new AppError(404, "Room tidak ditemukan");

    const start = new Date();
    const end = new Date(start.getTime() + Number(durationMinutes) * 60000);

    // buat pricing
    const pricing = await prisma.pricing.create({
      data: {
        roomId,
        name,
        description,
        baseRate,
        durationMinutes,
        isHoliday: !!isHoliday,
        isPromo: !!isPromo,
        isPackage: !!isPackage,
        startDate: start,
        endDate: end,
        taxRate,
        serviceCharge,
        ladyQty,
      },
    });

    // insert FnB bundle
    if (Array.isArray(fnbs)) {
      for (const f of fnbs) {
        await prisma.pricingFnb.create({
          data: {
            pricingId: pricing.id,
            fnbId: f.fnbId,
            quantity: f.quantity,
          },
        });
      }
    }

    res.status(201).json({ success: true, pricing });
  } catch (error) {
    next(error);
  }
});

route.put("/:pricingId/package", async (req, res, next) => {
  try {
    const { pricingId } = req.params;
    const {
      roomId,
      name,
      description,
      baseRate,
      durationMinutes,
      isHoliday,
      isPromo,
      taxRate,
      serviceCharge,
      fnbs,
      ladyQty,
    } = req.body;

    // hanya admin boleh
    if (req.user.role !== "admin") {
      throw new AppError(401, "Akses ditolak");
    }

    // cek package
    const pricing = await prisma.pricing.findUnique({
      where: { id: Number(pricingId) },
      include: { pricingFnbs: true },
    });

    if (!pricing || !pricing.isPackage) {
      throw new AppError(404, "Package tidak ditemukan");
    }

    // validasi room
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new AppError(404, "Room tidak ditemukan");

    const start = new Date();
    const end = new Date(start.getTime() + Number(durationMinutes) * 60000);

    // update pricing
    const updatedPricing = await prisma.pricing.update({
      where: { id: pricing.id },
      data: {
        roomId,
        name,
        description,
        baseRate,
        durationMinutes,
        isHoliday: !!isHoliday,
        isPromo: !!isPromo,
        startDate: start,
        endDate: end,
        taxRate,
        serviceCharge,
        ladyQty,
      },
    });

    // hapus FnB lama
    await prisma.pricingFnb.deleteMany({
      where: { pricingId: pricing.id },
    });

    // insert FnB baru
    if (Array.isArray(fnbs)) {
      for (const f of fnbs) {
        await prisma.pricingFnb.create({
          data: {
            pricingId: pricing.id,
            fnbId: f.fnbId,
            quantity: f.quantity,
          },
        });
      }
    }

    res.status(200).json({ success: true, pricing: updatedPricing });
  } catch (error) {
    next(error);
  }
});

route.delete("/:pricingId/package", async (req, res, next) => {
  try {
    const { pricingId } = req.params;

    // cari pricing dengan isPackage true
    const pricing = await prisma.pricing.findUnique({
      where: { id: Number(pricingId) },
      include: { pricingFnbs: true },
    });
    if (!pricing || !pricing.isPackage) {
      throw new AppError(404, "Package tidak di temukan");
    }

    // hapus FnB bundle dulu (supaya tidak orphan)
    await prisma.pricingFnb.deleteMany({
      where: { pricingId: pricing.id },
    });

    // hapus pricing
    await prisma.pricing.delete({
      where: { id: pricing.id },
    });

    res
      .status(200)
      .json({ success: true, message: "Package berhasil dihapus" });
  } catch (error) {
    next(error);
  }
});

module.exports = route;
