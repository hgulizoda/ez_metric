import { Prisma, ClockStatus } from '@prisma/client';
import prisma from './prisma';

interface ClockInParams {
  worker_id: number;
  shift_id: number;
  device_id?: number;
  shift_type_id?: number;
}

interface ListRecordsParams {
  worker_id?: string;
  shift_id?: string;
  status?: string;
  from?: string;
  to?: string;
}

const CLOCK_RECORD_INCLUDE = {
  worker: { select: { id: true, name: true, base_id: true, position: true } },
  shift: { select: { id: true, name: true } },
  device: { select: { id: true, name: true, serial_number: true } },
  shift_type: { select: { id: true, name: true } },
  status_changed: { select: { id: true, username: true } },
};

export const clockService = {
  async clockIn({ worker_id, shift_id, device_id, shift_type_id }: ClockInParams) {
    // Check for existing open clock-in (no clock_out)
    const existing = await prisma.clockRecord.findFirst({
      where: { worker_id, shift_id, clock_out: null },
    });

    if (existing) {
      return { error: 'Worker already clocked in to this shift' };
    }

    // Check grace period
    const shift = await prisma.shift.findUnique({ where: { id: shift_id } });
    const now = new Date();
    let grace_period_applied = false;

    if (shift) {
      const rules = await prisma.gracePeriodRule.findMany();
      if (rules.length > 0) {
        const maxGrace = Math.max(...rules.map((r) => r.minutes_allowed));
        const diffMs = now.getTime() - new Date(shift.start_time).getTime();
        const diffMinutes = diffMs / (1000 * 60);
        if (diffMinutes > 0 && diffMinutes <= maxGrace) {
          grace_period_applied = true;
        }
      }
    }

    const record = await prisma.clockRecord.create({
      data: {
        worker_id,
        shift_id,
        device_id: device_id || null,
        shift_type_id: shift_type_id || null,
        clock_in: now,
        grace_period_applied,
        status: 'pending',
      },
      include: CLOCK_RECORD_INCLUDE,
    });

    return { data: record };
  },

  async clockOut(worker_id: number, shift_id: number) {
    const existing = await prisma.clockRecord.findFirst({
      where: { worker_id, shift_id, clock_out: null },
    });

    if (!existing) {
      return { error: 'No active clock-in found for this worker and shift' };
    }

    const record = await prisma.clockRecord.update({
      where: { id: existing.id },
      data: { clock_out: new Date() },
      include: CLOCK_RECORD_INCLUDE,
    });

    return { data: record };
  },

  async listRecords({ worker_id, shift_id, status, from, to }: ListRecordsParams) {
    const where: Prisma.ClockRecordWhereInput = {};

    if (worker_id) where.worker_id = Number(worker_id);
    if (shift_id) where.shift_id = Number(shift_id);
    if (status) where.status = status as ClockStatus;

    if (from || to) {
      where.clock_in = {};
      if (from) where.clock_in.gte = new Date(from);
      if (to) where.clock_in.lte = new Date(to);
    }

    return prisma.clockRecord.findMany({
      where,
      include: CLOCK_RECORD_INCLUDE,
      orderBy: { created_at: 'desc' },
    });
  },

  async getRecordById(id: number) {
    return prisma.clockRecord.findUnique({
      where: { id },
      include: CLOCK_RECORD_INCLUDE,
    });
  },

  async changeStatus(
    id: number,
    status: ClockStatus,
    adminUserId: number,
    note?: string,
  ) {
    return prisma.clockRecord.update({
      where: { id },
      data: {
        status,
        status_changed_by: adminUserId,
        status_changed_at: new Date(),
        status_note: note || null,
      },
      include: CLOCK_RECORD_INCLUDE,
    });
  },

  async manualEdit(
    id: number,
    data: {
      clock_in?: string;
      clock_out?: string;
      edit_note: string;
      device_id?: number;
      shift_type_id?: number;
    },
    adminUserId: number,
  ) {
    const updateData: Prisma.ClockRecordUpdateInput = {
      is_manual_edit: true,
      edit_note: data.edit_note,
      status_changed_by: adminUserId,
      status_changed_at: new Date(),
    };

    if (data.clock_in) updateData.clock_in = new Date(data.clock_in);
    if (data.clock_out) updateData.clock_out = new Date(data.clock_out);
    if (data.device_id !== undefined) updateData.device = data.device_id ? { connect: { id: data.device_id } } : { disconnect: true };
    if (data.shift_type_id !== undefined) updateData.shift_type = data.shift_type_id ? { connect: { id: data.shift_type_id } } : { disconnect: true };

    return prisma.clockRecord.update({
      where: { id },
      data: updateData,
      include: CLOCK_RECORD_INCLUDE,
    });
  },
};
