import prisma from './prisma';

export const dashboardService = {
  async summary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get the start of the current week (Monday)
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
    weekStart.setHours(0, 0, 0, 0);

    const [
      total_workers,
      total_shifts,
      active_shifts,
      open_clock_records,
      active_today_records,
      week_records,
    ] = await Promise.all([
      prisma.worker.count(),
      prisma.shift.count(),
      prisma.shift.count({ where: { status: 'active' } }),
      prisma.clockRecord.count({ where: { clock_out: null } }),
      prisma.clockRecord.findMany({
        where: { clock_in: { gte: today, lt: tomorrow } },
        select: { worker_id: true },
        distinct: ['worker_id'],
      }),
      prisma.clockRecord.findMany({
        where: {
          clock_in: { gte: weekStart },
          clock_out: { not: null },
        },
      }),
    ]);

    // Calculate hours this week
    let hours_this_week = 0;
    for (const r of week_records) {
      if (!r.clock_out) continue;
      hours_this_week += (r.clock_out.getTime() - r.clock_in.getTime()) / (1000 * 60 * 60);
    }

    // Workers approaching overtime (>35 hours this week)
    const workerWeekHours: Record<number, number> = {};
    for (const r of week_records) {
      if (!r.clock_out) continue;
      const hours = (r.clock_out.getTime() - r.clock_in.getTime()) / (1000 * 60 * 60);
      workerWeekHours[r.worker_id] = (workerWeekHours[r.worker_id] || 0) + hours;
    }
    const approaching_overtime = Object.values(workerWeekHours).filter((h) => h >= 35).length;

    return {
      total_workers,
      active_today: active_today_records.length,
      total_shifts,
      active_shifts,
      open_clock_records,
      hours_this_week: round2(hours_this_week),
      approaching_overtime,
    };
  },

  async workedHours() {
    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
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

    // Build daily breakdown for the current week
    const dailyMap: Record<string, { hours: number; overtime: number }> = {};

    for (const r of records) {
      if (!r.clock_out) continue;
      const hours = (r.clock_out.getTime() - r.clock_in.getTime()) / (1000 * 60 * 60);
      this_month += hours;

      if (r.clock_in >= weekStart) {
        this_week += hours;

        // Add to daily breakdown
        const dateKey = r.clock_in.toISOString().split('T')[0];
        if (!dailyMap[dateKey]) dailyMap[dateKey] = { hours: 0, overtime: 0 };
        // For simplicity: overtime is hours beyond 8 per day per record
        const regular = Math.min(hours, 8);
        const ot = Math.max(0, hours - 8);
        dailyMap[dateKey].hours += regular;
        dailyMap[dateKey].overtime += ot;
      }

      if (r.clock_in >= todayStart) {
        today += hours;
      }
    }

    // Convert daily map to sorted array with readable labels
    const daily_breakdown = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => {
        const d = new Date(date + 'T00:00:00');
        const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        return {
          date: label,
          hours: round2(data.hours),
          overtime: round2(data.overtime),
        };
      });

    return {
      today: round2(today),
      this_week: round2(this_week),
      this_month: round2(this_month),
      daily_breakdown,
    };
  },

  async hoursTrend() {
    const now = new Date();
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const records = await prisma.clockRecord.findMany({
      where: {
        clock_in: { gte: fourteenDaysAgo },
        clock_out: { not: null },
      },
    });

    // Group hours by date
    const dailyMap: Record<string, number> = {};
    for (let i = 0; i < 14; i++) {
      const d = new Date(fourteenDaysAgo);
      d.setDate(d.getDate() + i);
      dailyMap[d.toISOString().split('T')[0]] = 0;
    }

    for (const r of records) {
      if (!r.clock_out) continue;
      const dateKey = r.clock_in.toISOString().split('T')[0];
      const hours = (r.clock_out.getTime() - r.clock_in.getTime()) / (1000 * 60 * 60);
      if (dailyMap[dateKey] !== undefined) {
        dailyMap[dateKey] += hours;
      }
    }

    // Get overtime threshold from salary rules (use 40 as default weekly, 8 as daily threshold)
    const dailyThreshold = 40; // Total hours threshold line for the chart

    return Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, totalHours]) => {
        const d = new Date(date + 'T00:00:00');
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return {
          date: label,
          hours: round2(totalHours),
          overtime: round2(Math.max(0, totalHours - dailyThreshold)),
          threshold: dailyThreshold,
        };
      });
  },

  async clockStatus() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get the start of the current week
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
    weekStart.setHours(0, 0, 0, 0);

    const workers = await prisma.worker.findMany({
      select: { id: true, name: true, position: true },
      orderBy: { name: 'asc' },
    });

    // Get open clock records (currently clocked in)
    const openRecords = await prisma.clockRecord.findMany({
      where: { clock_out: null },
      select: { worker_id: true },
    });
    const clockedInIds = new Set(openRecords.map((r) => r.worker_id));

    // Get weekly hours per worker
    const weekRecords = await prisma.clockRecord.findMany({
      where: {
        clock_in: { gte: weekStart },
        clock_out: { not: null },
      },
    });

    const workerHours: Record<number, number> = {};
    for (const r of weekRecords) {
      if (!r.clock_out) continue;
      const hours = (r.clock_out.getTime() - r.clock_in.getTime()) / (1000 * 60 * 60);
      workerHours[r.worker_id] = (workerHours[r.worker_id] || 0) + hours;
    }

    return workers.map((w) => ({
      id: w.id,
      name: w.name,
      position: w.position,
      is_clocked_in: clockedInIds.has(w.id),
      weekly_hours: round2(workerHours[w.id] || 0),
    }));
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
