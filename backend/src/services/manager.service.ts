import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import prisma from './prisma';

export const managerService = {
  async list() {
    return prisma.user.findMany({
      where: { role: 'manager' },
      select: { id: true, username: true, role: true, created_at: true },
      orderBy: { created_at: 'desc' },
    });
  },

  async getById(id: number) {
    return prisma.user.findFirst({
      where: { id, role: 'manager' },
      select: { id: true, username: true, role: true, created_at: true },
    });
  },

  async create(data: { username: string; password: string }) {
    const password_hash = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: {
        username: data.username,
        password_hash,
        role: 'manager',
      },
      select: { id: true, username: true, role: true, created_at: true },
    });
  },

  async update(id: number, data: { username?: string; password?: string }) {
    const updateData: Prisma.UserUpdateInput = {};
    if (data.username) updateData.username = data.username;
    if (data.password) updateData.password_hash = await bcrypt.hash(data.password, 10);

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, username: true, role: true, created_at: true },
    });
  },

  async delete(id: number) {
    return prisma.user.delete({ where: { id } });
  },
};
