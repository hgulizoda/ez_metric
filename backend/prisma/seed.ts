import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminHash = await bcrypt.hash('admin123', 10);
  const managerHash = await bcrypt.hash('manager123', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password_hash: adminHash, role: 'admin' },
  });

  await prisma.user.upsert({
    where: { username: 'manager1' },
    update: {},
    create: { username: 'manager1', password_hash: managerHash, role: 'manager' },
  });

  await prisma.user.upsert({
    where: { username: 'manager2' },
    update: {},
    create: { username: 'manager2', password_hash: managerHash, role: 'manager' },
  });

  console.log('Seed complete: 1 admin + 2 managers created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
