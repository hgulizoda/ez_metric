import { Prisma } from '@prisma/client';
import prisma from './prisma';

export const efficiencyService = {
  async listAll(from: string, to: string) {
    const workers = await prisma.worker.findMany({
      select: { id: true, name: true, base_id: true, position: true },
      orderBy: { name: 'asc' },
    });

    const bonusRules = await prisma.bonusRule.findMany();

    const results = await Promise.all(
      workers.map(async (worker) => {
        const stats = await calculateWorkerEfficiency(worker.id, from, to);
        const rule = bonusRules.find(
          (r) => r.position.toLowerCase() === worker.position.toLowerCase(),
        );
        const bonus_eligible = rule
          ? stats.efficiency >= Number(rule.min_efficiency_threshold)
          : false;

        return {
          worker_id: worker.id,
          worker_name: worker.name,
          base_id: worker.base_id,
          position: worker.position,
          total_hours: round2(stats.total_hours),
          billed_hours: round2(stats.billed_hours),
          efficiency: round2(stats.efficiency),
          bonus_eligible,
        };
      }),
    );

    return results;
  },

  async getWorkerEfficiency(workerId: number, from: string, to: string) {
    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      select: { id: true, name: true, base_id: true, position: true },
    });

    if (!worker) return null;

    const stats = await calculateWorkerEfficiency(workerId, from, to);

    const bonusRules = await prisma.bonusRule.findMany();
    const rule = bonusRules.find(
      (r) => r.position.toLowerCase() === worker.position.toLowerCase(),
    );
    const bonus_eligible = rule
      ? stats.efficiency >= Number(rule.min_efficiency_threshold)
      : false;

    const bonuses = await prisma.bonus.findMany({
      where: {
        worker_id: workerId,
        period: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return {
      worker_id: worker.id,
      worker_name: worker.name,
      base_id: worker.base_id,
      position: worker.position,
      total_hours: round2(stats.total_hours),
      billed_hours: round2(stats.billed_hours),
      efficiency: round2(stats.efficiency),
      bonus_eligible,
      bonuses: bonuses.map((b) => ({
        id: b.id,
        amount: Number(b.amount).toFixed(2),
        type: b.type,
        period: b.period.toISOString().split('T')[0],
        note: b.note,
        created_at: b.created_at.toISOString(),
      })),
    };
  },
};

async function calculateWorkerEfficiency(workerId: number, from: string, to: string) {
  const records = await prisma.clockRecord.findMany({
    where: {
      worker_id: workerId,
      clock_in: { gte: new Date(from), lte: new Date(to) },
      clock_out: { not: null },
    },
  });

  let total_hours = 0;
  for (const r of records) {
    if (r.clock_out) {
      total_hours += (r.clock_out.getTime() - r.clock_in.getTime()) / (1000 * 60 * 60);
    }
  }

  // MVP: billed_hours = total_hours (no separate billing system)
  const billed_hours = total_hours;
  const efficiency = total_hours > 0 ? (billed_hours / total_hours) * 100 : 0;

  return { total_hours, billed_hours, efficiency };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
