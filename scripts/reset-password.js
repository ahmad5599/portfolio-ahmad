const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@example.com";
  const password = "changeme";
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });
    console.log(`Password for ${email} reset to '${password}'`);
  } catch (error) {
    console.error("Error resetting password:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
