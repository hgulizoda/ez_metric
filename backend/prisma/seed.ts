import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminHash = await bcrypt.hash('admin123', 10);
  const managerHash = await bcrypt.hash('manager123', 10);

  // Users — matching ez-claude frontend expectations
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password_hash: adminHash, role: 'admin' },
  });

  await prisma.user.upsert({
    where: { username: 'ash' },
    update: {},
    create: { username: 'ash', password_hash: adminHash, role: 'admin' },
  });

  await prisma.user.upsert({
    where: { username: 'justin' },
    update: {},
    create: { username: 'justin', password_hash: managerHash, role: 'manager' },
  });

  await prisma.user.upsert({
    where: { username: 'manager1' },
    update: {},
    create: { username: 'manager1', password_hash: managerHash, role: 'manager' },
  });

  // Workers — matching EZ Truck Repair LLC employees
  const workers = [
    { base_id: 'W001', name: 'Ash Rojas', salary_type: 'flat' as const, position: 'Office', language: 'English' },
    { base_id: 'W002', name: 'Justin Naranjo', salary_type: 'hourly' as const, position: 'Mechanical Floor', language: 'English' },
    { base_id: 'W003', name: 'Jesus Garcia', salary_type: 'hourly' as const, position: 'Mechanical Floor', language: 'Spanish' },
    { base_id: 'W004', name: 'Bernardo Grossi', salary_type: 'hourly' as const, position: 'Mechanical Floor', language: 'Spanish' },
    { base_id: 'W005', name: 'Miguel Lopez', salary_type: 'hourly' as const, position: 'Mechanical Floor', language: 'Spanish' },
    { base_id: 'W006', name: 'Jose Retana', salary_type: 'hourly' as const, position: 'Mechanical Floor', language: 'Spanish' },
    { base_id: 'W007', name: 'Zafar Khatamov', salary_type: 'hourly' as const, position: 'Office', language: 'English' },
    { base_id: 'W008', name: 'islomjon abdurahmanov', salary_type: 'hourly' as const, position: 'Mechanical Floor', language: 'Russian' },
    { base_id: 'W009', name: 'Oybek TURDIMURODOV', salary_type: 'hourly' as const, position: 'Mechanical Floor', language: 'Russian' },
    { base_id: 'W010', name: 'Josue Delgado', salary_type: 'hourly' as const, position: 'Mechanical Floor', language: 'Spanish' },
    { base_id: 'W011', name: 'Carlos Martinez', salary_type: 'hourly' as const, position: 'Mechanical Floor', language: 'Spanish' },
    { base_id: 'W012', name: 'Marco Hernandez', salary_type: 'hourly' as const, position: 'Parts', language: 'Spanish' },
    { base_id: 'W013', name: 'David Torres', salary_type: 'hourly' as const, position: 'Mechanical Floor', language: 'Spanish' },
    { base_id: 'W014', name: 'Luis Gomez', salary_type: 'hourly' as const, position: 'Mechanical Floor', language: 'Spanish' },
    { base_id: 'W015', name: 'Ramon Flores', salary_type: 'hourly' as const, position: 'Mechanical Floor', language: 'Spanish' },
    { base_id: 'W016', name: 'Pedro Jimenez', salary_type: 'hourly' as const, position: 'Office', language: 'Spanish' },
    { base_id: 'W017', name: 'Juan Rodriguez', salary_type: 'hourly' as const, position: 'Mechanical Floor', language: 'Spanish' },
    { base_id: 'W018', name: 'Eduardo Morales', salary_type: 'hourly' as const, position: 'Mechanical Floor', language: 'Spanish' },
    { base_id: 'W019', name: 'Sergio Cruz', salary_type: 'hourly' as const, position: 'Parts', language: 'Spanish' },
    { base_id: 'W020', name: 'Fernando Rivera', salary_type: 'hourly' as const, position: 'Mechanical Floor', language: 'Spanish' },
    { base_id: 'W021', name: 'Miguel Vargas', salary_type: 'hourly' as const, position: 'Mechanical Floor', language: 'Spanish' },
    { base_id: 'W022', name: 'Roberto Medina', salary_type: 'hourly' as const, position: 'Mechanical Floor', language: 'Spanish' },
  ];

  for (const w of workers) {
    await prisma.worker.upsert({
      where: { base_id: w.base_id },
      update: {},
      create: w,
    });
  }

  // Shifts
  const shifts = [
    { name: 'Main Shift 1', start_time: new Date('2026-03-23T07:00:00Z'), end_time: new Date('2026-03-23T16:00:00Z') },
    { name: 'Main Shift 2', start_time: new Date('2026-03-23T08:00:00Z'), end_time: new Date('2026-03-23T17:00:00Z') },
    { name: 'Night Shift', start_time: new Date('2026-03-23T20:00:00Z'), end_time: new Date('2026-03-24T06:00:00Z') },
  ];

  for (const s of shifts) {
    const existing = await prisma.shift.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.shift.create({ data: s });
    }
  }

  // Grace period rules
  const existing = await prisma.gracePeriodRule.findFirst({ where: { name: 'Standard Grace' } });
  if (!existing) {
    await prisma.gracePeriodRule.create({
      data: { name: 'Standard Grace', minutes_allowed: 5 },
    });
  }

  // Clock records — last 14 days of realistic data
  const clockCount = await prisma.clockRecord.count();
  if (clockCount === 0) {
    console.log('Seeding clock records...');
    const allWorkers = await prisma.worker.findMany({ select: { id: true } });
    const allShifts = await prisma.shift.findMany({ select: { id: true } });

    const now = new Date();
    const records: {
      worker_id: number;
      shift_id: number;
      clock_in: Date;
      clock_out: Date | null;
      is_manual_edit: boolean;
      edit_note: string | null;
      grace_period_applied: boolean;
    }[] = [];

    for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
      const day = new Date(now);
      day.setDate(day.getDate() - dayOffset);
      const dayOfWeek = day.getDay(); // 0=Sun, 6=Sat

      // Skip Sundays, half staff on Saturdays
      if (dayOfWeek === 0) continue;
      const workingWorkers =
        dayOfWeek === 6
          ? allWorkers.slice(0, Math.ceil(allWorkers.length / 2))
          : allWorkers;

      for (const worker of workingWorkers) {
        // Random shift assignment (weighted toward shift 1)
        const rand = Math.random();
        const shift =
          rand < 0.6 ? allShifts[0] : rand < 0.9 ? allShifts[1] : allShifts[2];

        // Vary clock-in time: 6:45–7:15 for shift 1, 7:45–8:15 for shift 2, 19:45–20:15 for night
        let baseHour: number;
        if (shift.id === allShifts[0].id) baseHour = 7;
        else if (shift.id === allShifts[1].id) baseHour = 8;
        else baseHour = 20;

        const clockInVariance = Math.floor(Math.random() * 31) - 15; // -15 to +15 min
        const clockIn = new Date(
          day.getFullYear(),
          day.getMonth(),
          day.getDate(),
          baseHour,
          clockInVariance,
        );

        // Hours worked: 7.5–10 hours with occasional short days
        const hoursWorked = 7.5 + Math.random() * 2.5;
        const clockOut = new Date(clockIn.getTime() + hoursWorked * 3600000);

        // Today's records: some workers still clocked in (no clock_out)
        const isToday = dayOffset === 0;
        const stillIn = isToday && Math.random() < 0.4;

        // 5% chance of grace period
        const grace = clockInVariance > 0 && clockInVariance <= 5;

        // 3% chance of manual edit
        const isManual = Math.random() < 0.03;

        records.push({
          worker_id: worker.id,
          shift_id: shift.id,
          clock_in: clockIn,
          clock_out: stillIn ? null : clockOut,
          is_manual_edit: isManual,
          edit_note: isManual ? 'Corrected by admin — forgot to clock in on time' : null,
          grace_period_applied: grace,
        });
      }
    }

    await prisma.clockRecord.createMany({ data: records });
    console.log(`  -> ${records.length} clock records created.`);
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
