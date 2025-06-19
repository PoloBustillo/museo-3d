const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const roles = [{ name: "admin" }, { name: "editor" }, { name: "user" }];
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log("Roles por defecto insertados.");

  const userRole = await prisma.role.findUnique({ where: { name: "user" } });

  const defaultSettings = [
    { key: "notificaciones", value: "false" },
    { key: "subscripcion", value: "false" },
    { key: "emailValidated", value: "false" },
  ];

  const users = await prisma.user.findMany();
  for (const user of users) {
    const hasRole = await prisma.userRole.findFirst({
      where: { userId: user.id, roleId: userRole.id },
    });
    if (!hasRole) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: userRole.id },
      });
    }
    for (const setting of defaultSettings) {
      await prisma.userSetting.upsert({
        where: { userId_key: { userId: user.id, key: setting.key } },
        update: {},
        create: { userId: user.id, key: setting.key, value: setting.value },
      });
    }
  }
  console.log("UserRole y UserSetting poblados para todos los usuarios.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
