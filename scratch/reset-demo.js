const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.user.deleteMany({ where: { email: 'demo@cal-clone.com' } });
  console.log('Deleted demo user');
}
main().finally(() => prisma.$disconnect());
