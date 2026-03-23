import { Prisma } from '@prisma/client';
import prisma from './prisma';

export const bonusRuleService = {
  async list() {
    return prisma.bonusRule.findMany({ orderBy: { created_at: 'desc' } });
  },

  async getById(id: number) {
    return prisma.bonusRule.findUnique({ where: { id } });
  },

  async create(data: { position: string; formula: string; min_efficiency_threshold: number }) {
    return prisma.bonusRule.create({
      data: {
        position: data.position,
        formula: data.formula,
        min_efficiency_threshold: new Prisma.Decimal(data.min_efficiency_threshold),
      },
    });
  },

  async update(id: number, data: { position?: string; formula?: string; min_efficiency_threshold?: number }) {
    const updateData: Prisma.BonusRuleUpdateInput = {};
    if (data.position !== undefined) updateData.position = data.position;
    if (data.formula !== undefined) updateData.formula = data.formula;
    if (data.min_efficiency_threshold !== undefined) {
      updateData.min_efficiency_threshold = new Prisma.Decimal(data.min_efficiency_threshold);
    }
    return prisma.bonusRule.update({ where: { id }, data: updateData });
  },

  async delete(id: number) {
    return prisma.bonusRule.delete({ where: { id } });
  },
};

export const bonusService = {
  async list(params?: { worker_id?: number; period?: string }) {
    const where: Prisma.BonusWhereInput = {};
    if (params?.worker_id) where.worker_id = params.worker_id;
    if (params?.period) where.period = new Date(params.period);

    return prisma.bonus.findMany({
      where,
      include: {
        worker: { select: { id: true, name: true, base_id: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  },

  async createManual(data: { worker_id: number; amount: number; period: string; note?: string }) {
    return prisma.bonus.create({
      data: {
        worker_id: data.worker_id,
        amount: new Prisma.Decimal(data.amount),
        type: 'manual',
        period: new Date(data.period),
        note: data.note || null,
      },
    });
  },
};
