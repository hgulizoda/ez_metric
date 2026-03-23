import { Request, Response } from 'express';
import { ChargeType, SalaryType } from '@prisma/client';
import { salaryService } from '../services/salary.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export async function listRules(req: Request, res: Response): Promise<void> {
  const rules = await salaryService.listRules();
  sendSuccess(res, rules);
}

export async function getRuleByWorkerId(req: Request, res: Response): Promise<void> {
  const workerId = Number(req.params.worker_id);
  const rule = await salaryService.getRuleByWorkerId(workerId);

  if (!rule) {
    sendError(res, 'Salary rule not found for this worker', 404);
    return;
  }

  sendSuccess(res, rule);
}

export async function upsertRule(req: Request, res: Response): Promise<void> {
  const { worker_id, type, rate, overtime_multiplier, overtime_threshold_hours } = req.body;

  if (!worker_id || !type || rate === undefined) {
    sendError(res, 'worker_id, type, and rate are required', 400);
    return;
  }

  const { record } = await salaryService.upsertRule({
    worker_id: Number(worker_id),
    type: type as SalaryType,
    rate: Number(rate),
    ...(overtime_multiplier !== undefined && { overtime_multiplier: Number(overtime_multiplier) }),
    ...(overtime_threshold_hours !== undefined && { overtime_threshold_hours: Number(overtime_threshold_hours) }),
  });

  sendSuccess(res, record, 200);
}

export async function listCharges(req: Request, res: Response): Promise<void> {
  const { worker_id, type } = req.query;

  const charges = await salaryService.listCharges({
    ...(worker_id && { worker_id: Number(worker_id) }),
    ...(type && { type: type as ChargeType }),
  });

  sendSuccess(res, charges);
}

export async function createCharge(req: Request, res: Response): Promise<void> {
  const { worker_id, type, amount, distributed_over_periods, description } = req.body;

  if (!worker_id || !type || amount === undefined || !description) {
    sendError(res, 'worker_id, type, amount, and description are required', 400);
    return;
  }

  const charge = await salaryService.createCharge({
    worker_id: Number(worker_id),
    type: type as ChargeType,
    amount: Number(amount),
    ...(distributed_over_periods !== undefined && {
      distributed_over_periods: Number(distributed_over_periods),
    }),
    description,
  });

  sendSuccess(res, charge, 201);
}

export async function updateCharge(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  const existing = await salaryService.getChargeById(id);
  if (!existing) {
    sendError(res, 'Charge not found', 404);
    return;
  }

  const charge = await salaryService.updateCharge(id, req.body);
  sendSuccess(res, charge);
}

export async function deleteCharge(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  const existing = await salaryService.getChargeById(id);
  if (!existing) {
    sendError(res, 'Charge not found', 404);
    return;
  }

  await salaryService.deleteCharge(id);
  sendSuccess(res, null);
}

export async function calculateSalary(req: Request, res: Response): Promise<void> {
  const workerId = Number(req.params.worker_id);
  const { from, to } = req.query;

  if (!from || !to) {
    sendError(res, 'from and to query parameters are required', 400);
    return;
  }

  try {
    const result = await salaryService.calculateSalary(workerId, from as string, to as string);
    sendSuccess(res, result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to calculate salary';
    sendError(res, message, 400);
  }
}
