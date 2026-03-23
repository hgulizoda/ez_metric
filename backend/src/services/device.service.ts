import { Prisma } from '@prisma/client';
import prisma from './prisma';

export const deviceService = {
  async list(params?: { is_active?: boolean }) {
    const where: Prisma.DeviceWhereInput = {};
    if (params?.is_active !== undefined) where.is_active = params.is_active;
    return prisma.device.findMany({ where, orderBy: { name: 'asc' } });
  },

  async getById(id: number) {
    return prisma.device.findUnique({ where: { id } });
  },

  async create(data: { name: string; serial_number?: string; location?: string }) {
    return prisma.device.create({ data });
  },

  async update(id: number, data: Prisma.DeviceUpdateInput) {
    return prisma.device.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.device.delete({ where: { id } });
  },
};
