import { Request, Response } from 'express';
import { bonusRuleService, bonusService } from '../services/bonus.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

// Bonus Rules
export async function listBonusRules(_req: Request, res: Response): Promise<void> {
  const rules = await bonusRuleService.list();
  sendSuccess(res, rules);
}

export async function createBonusRule(req: Request, res: Response): Promise<void> {
  const { position, formula, min_efficiency_threshold } = req.body;

  if (!position || !formula || min_efficiency_threshold === undefined) {
    sendError(res, 'position, formula, and min_efficiency_threshold are required', 400);
    return;
  }

  const rule = await bonusRuleService.create({
    position,
    formula,
    min_efficiency_threshold: Number(min_efficiency_threshold),
  });
  sendSuccess(res, rule, 201);
}

export async function updateBonusRule(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  const existing = await bonusRuleService.getById(id);
  if (!existing) {
    sendError(res, 'Bonus rule not found', 404);
    return;
  }

  const data: { position?: string; formula?: string; min_efficiency_threshold?: number } = {};
  if (req.body.position !== undefined) data.position = req.body.position;
  if (req.body.formula !== undefined) data.formula = req.body.formula;
  if (req.body.min_efficiency_threshold !== undefined) {
    data.min_efficiency_threshold = Number(req.body.min_efficiency_threshold);
  }

  const rule = await bonusRuleService.update(id, data);
  sendSuccess(res, rule);
}

export async function deleteBonusRule(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  const existing = await bonusRuleService.getById(id);
  if (!existing) {
    sendError(res, 'Bonus rule not found', 404);
    return;
  }

  await bonusRuleService.delete(id);
  sendSuccess(res, null);
}

// Bonuses
export async function listBonuses(req: Request, res: Response): Promise<void> {
  const { worker_id, period } = req.query;

  const bonuses = await bonusService.list({
    ...(worker_id && { worker_id: Number(worker_id) }),
    ...(period && { period: period as string }),
  });
  sendSuccess(res, bonuses);
}

export async function createManualBonus(req: Request, res: Response): Promise<void> {
  const { worker_id, amount, period, note } = req.body;

  if (!worker_id || amount === undefined || !period) {
    sendError(res, 'worker_id, amount, and period are required', 400);
    return;
  }

  const bonus = await bonusService.createManual({
    worker_id: Number(worker_id),
    amount: Number(amount),
    period,
    note,
  });
  sendSuccess(res, bonus, 201);
}
