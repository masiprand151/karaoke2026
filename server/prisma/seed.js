const bcrypt = require("bcrypt");
const prisma = require("../src/configs/prisma");

async function main() {
  console.log("🌱 Seeding...");

  //////////////////////////////////////////////////////
  // USER
  //////////////////////////////////////////////////////

  const password = await bcrypt.hash("1104", 10);

  await prisma.user.upsert({
    where: {
      username: "administrator",
    },
    update: {},
    create: {
      username: "administrator",
      password,
      role: "admin",
    },
  });

  //////////////////////////////////////////////////////
  // ROOM
  //////////////////////////////////////////////////////

  if ((await prisma.room.count()) === 0) {
    for (let i = 1; i <= 20; i++) {
      await prisma.room.create({
        data: {
          name: `Room ${i}`,
          capacity: 6,
        },
      });
    }
  }

  //////////////////////////////////////////////////////
  // PRICING
  //////////////////////////////////////////////////////

  const rooms = await prisma.room.findMany();

  for (const room of rooms) {
    const count = await prisma.pricing.count({
      where: {
        roomId: room.id,
      },
    });

    if (count > 0) continue;

    await prisma.pricing.createMany({
      data: [
        {
          roomId: room.id,
          name: "Regular",
          description: "Regular Package",
          baseRate: 100000,
          taxRate: 10,
          serviceCharge: 5,
        },
        {
          roomId: room.id,
          name: "Happy Hour",
          description: "Promo Siang",
          baseRate: 75000,
          taxRate: 10,
          serviceCharge: 5,
          isPromo: true,
        },
        {
          roomId: room.id,
          name: "Holiday",
          description: "Hari Libur",
          baseRate: 150000,
          taxRate: 10,
          serviceCharge: 5,
          isHoliday: true,
        },
      ],
    });
  }

  //////////////////////////////////////////////////////
  // FNB
  //////////////////////////////////////////////////////

  if ((await prisma.fnb.count()) === 0) {
    await prisma.fnb.createMany({
      data: [
        {
          name: "Coca Cola",
          description: "Soft Drink",
          basePrice: 18000,
          taxRate: 10,
          serviceCharge: 5,
        },
        {
          name: "Sprite",
          description: "Soft Drink",
          basePrice: 18000,
          taxRate: 10,
          serviceCharge: 5,
        },
        {
          name: "Fanta",
          description: "Soft Drink",
          basePrice: 18000,
          taxRate: 10,
          serviceCharge: 5,
        },
        {
          name: "Aqua",
          description: "Mineral Water",
          basePrice: 10000,
          taxRate: 10,
          serviceCharge: 5,
        },
        {
          name: "French Fries",
          description: "Snack",
          basePrice: 35000,
          taxRate: 10,
          serviceCharge: 5,
        },
        {
          name: "Chicken Wings",
          description: "Snack",
          basePrice: 45000,
          taxRate: 10,
          serviceCharge: 5,
        },
      ],
    });
  }

  //////////////////////////////////////////////////////
  // LADY
  //////////////////////////////////////////////////////

  if ((await prisma.lady.count()) === 0) {
    await prisma.lady.createMany({
      data: [
        {
          name: "Lady A",
          description: "VIP",
          basePrice: 150000,
        },
        {
          name: "Lady B",
          description: "VIP",
          basePrice: 150000,
        },
        {
          name: "Lady C",
          description: "Regular",
          basePrice: 100000,
        },
        {
          name: "Lady D",
          description: "Regular",
          basePrice: 100000,
        },
      ],
    });
  }

  //////////////////////////////////////////////////////
  // PRICING FNB
  //////////////////////////////////////////////////////

  if ((await prisma.pricingFnb.count()) === 0) {
    const regular = await prisma.pricing.findFirst({
      where: {
        name: "Regular",
      },
    });

    const coke = await prisma.fnb.findFirst({
      where: {
        name: "Coca Cola",
      },
    });

    const aqua = await prisma.fnb.findFirst({
      where: {
        name: "Aqua",
      },
    });

    await prisma.pricingFnb.createMany({
      data: [
        {
          pricingId: regular.id,
          fnbId: coke.id,
          quantity: 2,
          includeTax: true,
        },
        {
          pricingId: regular.id,
          fnbId: aqua.id,
          quantity: 2,
          includeTax: true,
        },
      ],
    });
  }

  //////////////////////////////////////////////////////
  // PRICING LADY
  //////////////////////////////////////////////////////

  if ((await prisma.pricingLady.count()) === 0) {
    const regular = await prisma.pricing.findFirst({
      where: {
        name: "Regular",
      },
    });

    const lady = await prisma.lady.findFirst();

    await prisma.pricingLady.create({
      data: {
        pricingId: regular.id,
        ladyId: lady.id,
        quantity: 1,
      },
    });
  }

  console.log("✅ Seed selesai");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
