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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
