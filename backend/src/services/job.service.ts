import prisma from './prisma';

export const jobService = {
  async list() {
    return prisma.job.findMany({ orderBy: { title: 'asc' } });
  },

  async getById(id: number) {
    return prisma.job.findUnique({ where: { id } });
  },

  async create(data: { title: string }) {
    return prisma.job.create({ data });
  },

  async update(id: number, data: { title?: string }) {
    return prisma.job.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.job.delete({ where: { id } });
  },
};
