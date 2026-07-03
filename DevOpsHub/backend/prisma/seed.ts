import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@devopshub.local' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@devopshub.local',
    },
  });

  console.log('Seeded database user:', admin.username);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
