const bcrypt = require("bcrypt");
const prisma = require("../src/configs/prisma");

async function main() {
  const password = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: {
      username: "admin",
    },
    update: {},
    create: {
      username: "admin",
      password,
      role: "admin",
    },
  });

  console.log("✅ Default admin created");

  // Buat 20 Room awal
  const rooms = [];
  for (let i = 1; i <= 20; i++) {
    rooms.push({
      name: `Room ${i}`,
      capacity: i % 2 === 0 ? 6 : 4, // contoh kapasitas bergantian
    });
  }

  await prisma.room.createMany({
    data: rooms,
    skipDuplicates: true, // biar tidak error kalau sudah ada
  });

  console.log("✅ 20 Rooms created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
