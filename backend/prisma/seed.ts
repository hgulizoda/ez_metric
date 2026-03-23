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

  // Workers
  const workers = [
    { base_id: 'W001', name: 'Alex Johnson', salary_type: 'hourly' as const, position: 'Driver', language: 'English' },
    { base_id: 'W002', name: 'Maria Garcia', salary_type: 'hourly' as const, position: 'Driver', language: 'Spanish' },
    { base_id: 'W003', name: 'James Wilson', salary_type: 'percentage' as const, position: 'Loader', language: 'English' },
    { base_id: 'W004', name: 'Fatima Al-Rashid', salary_type: 'flat' as const, position: 'Dispatcher', language: 'Arabic' },
    { base_id: 'W005', name: 'Chen Wei', salary_type: 'hourly' as const, position: 'Driver', language: 'Chinese' },
  ];

  for (const w of workers) {
    await prisma.worker.upsert({
      where: { base_id: w.base_id },
      update: {},
      create: w,
    });
  }

  console.log('Seed complete: 1 admin + 2 managers + 5 workers created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
