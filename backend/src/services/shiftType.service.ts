import prisma from './prisma';

export const shiftTypeService = {
  async list() {
    return prisma.shiftType.findMany({ orderBy: { name: 'asc' } });
  },

  async getById(id: number) {
    return prisma.shiftType.findUnique({ where: { id } });
  },

  async create(data: { name: string }) {
    return prisma.shiftType.create({ data });
  },

  async update(id: number, data: { name?: string }) {
    return prisma.shiftType.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.shiftType.delete({ where: { id } });
  },
};
