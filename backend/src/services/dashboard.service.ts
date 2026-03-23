import prisma from './prisma';

export const dashboardService = {
  async summary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [total_workers, total_shifts, active_shifts, open_clock_records, active_today_records] =
      await Promise.all([
        prisma.worker.count(),
        prisma.shift.count(),
        prisma.shift.count({ where: { status: 'active' } }),
        prisma.clockRecord.count({ where: { clock_out: null } }),
        prisma.clockRecord.findMany({
          where: {
            clock_in: { gte: today, lt: tomorrow },
          },
          select: { worker_id: true },
          distinct: ['worker_id'],
        }),
      ]);

    return {
      total_workers,
      active_today: active_today_records.length,
      total_shifts,
      active_shifts,
      open_clock_records,
    };
  },

  async workedHours() {
    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const records = await prisma.clockRecord.findMany({
      where: {
        clock_in: { gte: monthStart },
        clock_out: { not: null },
      },
    });

    let today = 0;
    let this_week = 0;
    let this_month = 0;

    for (const r of records) {
      if (!r.clock_out) continue;
      const hours = (r.clock_out.getTime() - r.clock_in.getTime()) / (1000 * 60 * 60);

      this_month += hours;

      if (r.clock_in >= weekStart) {
        this_week += hours;
      }

      if (r.clock_in >= todayStart) {
        today += hours;
      }
    }

    return {
      today: round2(today),
      this_week: round2(this_week),
      this_month: round2(this_month),
    };
  },

  async bonusProgress() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = now;

    const workers = await prisma.worker.findMany({
      select: { id: true, name: true, base_id: true, position: true },
      orderBy: { name: 'asc' },
    });

    const bonusRules = await prisma.bonusRule.findMany();

    const records = await prisma.clockRecord.findMany({
      where: {
        clock_in: { gte: monthStart, lte: monthEnd },
        clock_out: { not: null },
      },
    });

    return workers.map((w) => {
      let total_hours = 0;
      for (const r of records) {
        if (r.worker_id === w.id && r.clock_out) {
          total_hours += (r.clock_out.getTime() - r.clock_in.getTime()) / (1000 * 60 * 60);
        }
      }

      const billed = total_hours;
      const efficiency = total_hours > 0 ? (billed / total_hours) * 100 : 0;

      const rule = bonusRules.find(
        (r) => r.position.toLowerCase() === w.position.toLowerCase(),
      );
      const threshold = rule ? Number(rule.min_efficiency_threshold) : 0;
      const progress_percent = threshold > 0 ? (efficiency / threshold) * 100 : 0;
      const bonus_eligible = threshold > 0 && efficiency >= threshold;

      return {
        worker_id: w.id,
        worker_name: w.name,
        position: w.position,
        efficiency: round2(efficiency),
        threshold,
        progress_percent: round2(progress_percent),
        bonus_eligible,
      };
    });
  },
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
