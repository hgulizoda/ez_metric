import { Prisma } from '@prisma/client';
import prisma from './prisma';

interface ListWorkersParams {
  search?: string;
  position?: string;
  salary_type?: string;
}

export const workerService = {
  async list({ search, position, salary_type }: ListWorkersParams) {
    const where: Prisma.WorkerWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { base_id: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (position) {
      where.position = position;
    }

    if (salary_type) {
      where.salary_type = salary_type as Prisma.EnumSalaryTypeFilter['equals'];
    }

    return prisma.worker.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  },

  async getById(id: number) {
    return prisma.worker.findUnique({ where: { id } });
  },

  async create(data: Prisma.WorkerCreateInput) {
    return prisma.worker.create({ data });
  },

  async update(id: number, data: Prisma.WorkerUpdateInput) {
    return prisma.worker.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.worker.delete({ where: { id } });
  },
};
