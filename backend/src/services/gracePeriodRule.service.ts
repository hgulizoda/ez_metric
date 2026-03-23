import prisma from './prisma';

export const gracePeriodRuleService = {
  async list() {
    return prisma.gracePeriodRule.findMany({
      orderBy: { created_at: 'desc' },
    });
  },

  async getById(id: number) {
    return prisma.gracePeriodRule.findUnique({ where: { id } });
  },

  async create(data: { name: string; minutes_allowed: number }) {
    return prisma.gracePeriodRule.create({ data });
  },

  async update(id: number, data: { name?: string; minutes_allowed?: number }) {
    return prisma.gracePeriodRule.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.gracePeriodRule.delete({ where: { id } });
  },
};
