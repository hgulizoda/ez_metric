import prisma from './prisma';

export const departmentService = {
  async list() {
    return prisma.department.findMany({ orderBy: { name: 'asc' } });
  },

  async getById(id: number) {
    return prisma.department.findUnique({ where: { id } });
  },

  async create(data: { name: string; code?: string }) {
    return prisma.department.create({
      data: {
        name: data.name,
        code: data.code || data.name.toLowerCase().replace(/\s+/g, '-'),
      },
    });
  },

  async update(id: number, data: { name?: string }) {
    return prisma.department.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.department.delete({ where: { id } });
  },
};
