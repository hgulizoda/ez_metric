import * as XLSX from 'xlsx';
import prisma from './prisma';
import { salaryService } from './salary.service';

interface ReportFilters {
  from: string;
  to: string;
  worker_id?: number;
  position?: string;
}

export const reportService = {
  async payrollSummary({ from, to, worker_id, position }: ReportFilters) {
    const where: Record<string, unknown> = {};
    if (worker_id) where.id = worker_id;
    if (position) where.position = position;

    const workers = await prisma.worker.findMany({
      where,
      select: { id: true, name: true, base_id: true, position: true },
      orderBy: { name: 'asc' },
    });

    const rows = await Promise.all(
      workers.map(async (w) => {
        try {
          const calc = await salaryService.calculateSalary(w.id, from, to);
          return {
            worker_id: w.id,
            worker_name: w.name,
            base_id: w.base_id,
            position: w.position,
            total_hours: calc.regular_hours,
            overtime_hours: calc.overtime_hours,
            gross_pay: calc.gross_pay,
            total_charges: calc.total_charges,
            net_pay: calc.net_pay,
          };
        } catch {
          return {
            worker_id: w.id,
            worker_name: w.name,
            base_id: w.base_id,
            position: w.position,
            total_hours: '0.00',
            overtime_hours: '0.00',
            gross_pay: '0.00',
            total_charges: '0.00',
            net_pay: '0.00',
          };
        }
      }),
    );

    return rows;
  },

  async exportExcel(filters: ReportFilters): Promise<Buffer> {
    const rows = await this.payrollSummary(filters);

    const data = rows.map((r) => ({
      'Base ID': r.base_id,
      'Worker': r.worker_name,
      'Position': r.position,
      'Hours': r.total_hours,
      'OT Hours': r.overtime_hours,
      'Gross Pay': r.gross_pay,
      'Charges': r.total_charges,
      'Net Pay': r.net_pay,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payroll');

    return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  },

  async weeklyStatement(weekStart: string) {
    const startDate = new Date(weekStart);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      days.push(d);
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const workers = await prisma.worker.findMany({
      select: { id: true, name: true, base_id: true, position: true },
      orderBy: { name: 'asc' },
    });

    const records = await prisma.clockRecord.findMany({
      where: {
        clock_in: { gte: startDate, lt: endDate },
        clock_out: { not: null },
      },
    });

    return workers.map((w) => {
      const dailyHours = days.map((day) => {
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);

        let hours = 0;
        for (const r of records) {
          if (r.worker_id === w.id && r.clock_out) {
            const clockIn = new Date(r.clock_in);
            if (clockIn >= dayStart && clockIn <= dayEnd) {
              hours += (r.clock_out.getTime() - r.clock_in.getTime()) / (1000 * 60 * 60);
            }
          }
        }
        return {
          date: day.toISOString().split('T')[0],
          hours: Math.round(hours * 100) / 100,
        };
      });

      const total = dailyHours.reduce((sum, d) => sum + d.hours, 0);

      return {
        worker_id: w.id,
        worker_name: w.name,
        base_id: w.base_id,
        daily: dailyHours,
        total_hours: Math.round(total * 100) / 100,
      };
    });
  },

  async workerInspection(workerId: number, from: string, to: string) {
    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      select: { id: true, name: true, base_id: true, position: true },
    });

    if (!worker) return null;

    const clockRecords = await prisma.clockRecord.findMany({
      where: {
        worker_id: workerId,
        clock_in: { gte: new Date(from), lte: new Date(to) },
      },
      include: {
        shift: { select: { id: true, name: true } },
      },
      orderBy: { clock_in: 'asc' },
    });

    let total_hours = 0;
    const records = clockRecords.map((r) => {
      const hours = r.clock_out
        ? (r.clock_out.getTime() - r.clock_in.getTime()) / (1000 * 60 * 60)
        : 0;
      total_hours += hours;
      return {
        id: r.id,
        shift_name: r.shift.name,
        clock_in: r.clock_in.toISOString(),
        clock_out: r.clock_out?.toISOString() || null,
        hours: Math.round(hours * 100) / 100,
        is_manual_edit: r.is_manual_edit,
        grace_period_applied: r.grace_period_applied,
      };
    });

    const billed_hours = total_hours;
    const efficiency = total_hours > 0 ? (billed_hours / total_hours) * 100 : 0;

    let salary = null;
    try {
      salary = await salaryService.calculateSalary(workerId, from, to);
    } catch {
      // No salary rule configured
    }

    return {
      worker,
      period: { from, to },
      clock_records: records,
      total_hours: Math.round(total_hours * 100) / 100,
      billed_hours: Math.round(billed_hours * 100) / 100,
      efficiency: Math.round(efficiency * 100) / 100,
      salary,
    };
  },

  async statementForWorker(workerId: number, from: string, to: string) {
    const inspection = await this.workerInspection(workerId, from, to);
    if (!inspection) return null;
    return inspection;
  },
};
