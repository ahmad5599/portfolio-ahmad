const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Checking Prisma models...');
  const models = ['profile', 'experience', 'education', 'certification'];
  for (const model of models) {
    if (prisma[model]) {
      console.log(`✅ Model '${model}' exists on PrismaClient instance.`);
    } else {
      console.error(`❌ Model '${model}' DOES NOT exist on PrismaClient instance.`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
