import { Prisma, ShiftStatus } from '@prisma/client';
import prisma from './prisma';

interface ListShiftsParams {
  status?: string;
}

export const shiftService = {
  async list({ status }: ListShiftsParams) {
    const where: Prisma.ShiftWhereInput = {};

    if (status) {
      where.status = status as ShiftStatus;
    }

    return prisma.shift.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  },

  async getById(id: number) {
    return prisma.shift.findUnique({
      where: { id },
      include: {
        worker_shifts: {
          include: {
            worker: {
              select: { id: true, name: true, base_id: true },
            },
          },
        },
      },
    });
  },

  async create(data: { name: string; start_time: string; end_time: string }) {
    return prisma.shift.create({
      data: {
        name: data.name,
        start_time: new Date(data.start_time),
        end_time: new Date(data.end_time),
      },
    });
  },

  async update(id: number, data: Prisma.ShiftUpdateInput) {
    return prisma.shift.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.shift.delete({ where: { id } });
  },
};
