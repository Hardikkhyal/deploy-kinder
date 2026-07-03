import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const servers = await prisma.serverInstance.findMany();
  let count = 0;
  for (const s of servers) {
    if (s.publicIp.includes(':')) {
      const cleanIp = s.publicIp.split(':')[0];
      await prisma.serverInstance.update({
        where: { id: s.id },
        data: { publicIp: cleanIp }
      });
      console.log(`Cleaned Server ID ${s.id}: "${s.publicIp}" -> "${cleanIp}"`);
      count++;
    }
  }
  console.log(`Completed DB cleanup. Cleaned ${count} server IP records.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
