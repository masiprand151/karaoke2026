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

    // insert Lady bundle
    // if (Array.isArray(ladies)) {
    //   for (const l of ladies) {
    //     await prisma.pricingLady.create({
    //       data: {
    //         pricingId: pricing.id,
    //         ladyId: l.ladyId,
    //         quantity: l.quantity,
    //       },
    //     });
    //   }
    // }

    res.status(201).json({ success: true, pricing });
  } catch (error) {
    next(error);
  }
});

module.exports = route;
