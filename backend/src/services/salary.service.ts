import { Prisma, SalaryType, ChargeType } from '@prisma/client';
import prisma from './prisma';

export const salaryService = {
  async listRules() {
    return prisma.salaryRule.findMany({
      include: {
        worker: {
          select: { id: true, name: true, base_id: true },
        },
      },
      orderBy: { worker: { name: 'asc' } },
    });
  },

  async getRuleByWorkerId(workerId: number) {
    return prisma.salaryRule.findFirst({
      where: { worker_id: workerId },
      include: {
        worker: {
          select: { id: true, name: true, base_id: true },
        },
      },
    });
  },

  async upsertRule(data: {
    worker_id: number;
    type: SalaryType;
    rate: number;
    overtime_multiplier?: number;
    overtime_threshold_hours?: number;
  }) {
    const existing = await prisma.salaryRule.findFirst({
      where: { worker_id: data.worker_id },
    });

    if (existing) {
      return {
        record: await prisma.salaryRule.update({
          where: { id: existing.id },
          data: {
            type: data.type,
            rate: new Prisma.Decimal(data.rate),
            ...(data.overtime_multiplier !== undefined && {
              overtime_multiplier: new Prisma.Decimal(data.overtime_multiplier),
            }),
            ...(data.overtime_threshold_hours !== undefined && {
              overtime_threshold_hours: data.overtime_threshold_hours,
            }),
          },
        }),
        created: false,
      };
    }

    return {
      record: await prisma.salaryRule.create({
        data: {
          worker_id: data.worker_id,
          type: data.type,
          rate: new Prisma.Decimal(data.rate),
          ...(data.overtime_multiplier !== undefined && {
            overtime_multiplier: new Prisma.Decimal(data.overtime_multiplier),
          }),
          ...(data.overtime_threshold_hours !== undefined && {
            overtime_threshold_hours: data.overtime_threshold_hours,
          }),
        },
      }),
      created: true,
    };
  },

  async listCharges(params?: { worker_id?: number; type?: ChargeType }) {
    const where: Prisma.ChargeWhereInput = {};

    if (params?.worker_id) {
      where.worker_id = params.worker_id;
    }
    if (params?.type) {
      where.type = params.type;
    }

    return prisma.charge.findMany({
      where,
      include: {
        worker: {
          select: { id: true, name: true, base_id: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  },

  async getChargeById(id: number) {
    return prisma.charge.findUnique({ where: { id } });
  },

  async createCharge(data: {
    worker_id: number;
    type: ChargeType;
    amount: number;
    distributed_over_periods?: number;
    description: string;
  }) {
    return prisma.charge.create({
      data: {
        worker_id: data.worker_id,
        type: data.type,
        amount: new Prisma.Decimal(data.amount),
        remaining: new Prisma.Decimal(data.amount),
        ...(data.distributed_over_periods !== undefined && {
          distributed_over_periods: data.distributed_over_periods,
        }),
        description: data.description,
      },
    });
  },

  async updateCharge(id: number, data: Prisma.ChargeUpdateInput) {
    return prisma.charge.update({ where: { id }, data });
  },

  async deleteCharge(id: number) {
    return prisma.charge.delete({ where: { id } });
  },

  async calculateSalary(workerId: number, from: string, to: string) {
    const rule = await prisma.salaryRule.findFirst({
      where: { worker_id: workerId },
      include: {
        worker: {
          select: { id: true, name: true, base_id: true },
        },
      },
    });

    if (!rule) {
      throw new Error('No salary rule found for this worker');
    }

    const clockRecords = await prisma.clockRecord.findMany({
      where: {
        worker_id: workerId,
        clock_in: {
          gte: new Date(from),
          lte: new Date(to),
        },
        clock_out: { not: null },
      },
    });

    let total_hours = 0;
    for (const record of clockRecords) {
      if (record.clock_out) {
        const diffMs = record.clock_out.getTime() - record.clock_in.getTime();
        total_hours += diffMs / (1000 * 60 * 60);
      }
    }

    const rate = Number(rule.rate);
    const overtime_multiplier = Number(rule.overtime_multiplier);
    const overtime_threshold_hours = rule.overtime_threshold_hours;

    let regular_hours = 0;
    let overtime_hours = 0;
    let base_pay = 0;
    let overtime_pay = 0;

    if (rule.type === SalaryType.hourly) {
      regular_hours = Math.min(total_hours, overtime_threshold_hours);
      overtime_hours = Math.max(0, total_hours - overtime_threshold_hours);
      base_pay = regular_hours * rate;
      overtime_pay = overtime_hours * rate * overtime_multiplier;
    } else if (rule.type === SalaryType.flat) {
      regular_hours = total_hours;
      overtime_hours = 0;
      base_pay = rate;
      overtime_pay = 0;
    } else if (rule.type === SalaryType.percentage) {
      regular_hours = total_hours;
      overtime_hours = 0;
      base_pay = rate;
      overtime_pay = 0;
    }

    const gross_pay = base_pay + overtime_pay;

    const activeCharges = await prisma.charge.findMany({
      where: {
        worker_id: workerId,
        remaining: { gt: 0 },
      },
    });

    let total_charges = 0;
    const chargesDetail = activeCharges.map((charge) => {
      const remaining = Number(charge.remaining);
      const amount = Number(charge.amount);
      let deduction: number;

      if (
        charge.type === ChargeType.distribution &&
        charge.distributed_over_periods
      ) {
        deduction = amount / charge.distributed_over_periods;
      } else {
        deduction = remaining;
      }

      total_charges += deduction;

      return {
        id: charge.id,
        type: charge.type,
        description: charge.description,
        amount: amount.toFixed(2),
        remaining: remaining.toFixed(2),
        deduction: deduction.toFixed(2),
      };
    });

    const net_pay = gross_pay - total_charges;

    return {
      worker_id: workerId,
      worker_name: rule.worker.name,
      period: { from, to },
      salary_type: rule.type,
      rate: rate.toFixed(2),
      regular_hours: regular_hours.toFixed(2),
      overtime_hours: overtime_hours.toFixed(2),
      base_pay: base_pay.toFixed(2),
      overtime_pay: overtime_pay.toFixed(2),
      gross_pay: gross_pay.toFixed(2),
      total_charges: total_charges.toFixed(2),
      net_pay: net_pay.toFixed(2),
      charges: chargesDetail,
    };
  },
};
