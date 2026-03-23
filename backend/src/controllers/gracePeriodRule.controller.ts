import { Request, Response } from 'express';
import { gracePeriodRuleService } from '../services/gracePeriodRule.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export async function listRules(req: Request, res: Response): Promise<void> {
  const rules = await gracePeriodRuleService.list();
  sendSuccess(res, rules);
}

export async function createRule(req: Request, res: Response): Promise<void> {
  const { name, minutes_allowed } = req.body;

  if (!name || minutes_allowed === undefined) {
    sendError(res, 'name and minutes_allowed are required', 400);
    return;
  }

  const rule = await gracePeriodRuleService.create({
    name,
    minutes_allowed: Number(minutes_allowed),
  });
  sendSuccess(res, rule, 201);
}

export async function updateRule(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  const existing = await gracePeriodRuleService.getById(id);
  if (!existing) {
    sendError(res, 'Grace period rule not found', 404);
    return;
  }

  const data: { name?: string; minutes_allowed?: number } = {};
  if (req.body.name) data.name = req.body.name;
  if (req.body.minutes_allowed !== undefined) data.minutes_allowed = Number(req.body.minutes_allowed);

  const rule = await gracePeriodRuleService.update(id, data);
  sendSuccess(res, rule);
}

export async function deleteRule(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  const existing = await gracePeriodRuleService.getById(id);
  if (!existing) {
    sendError(res, 'Grace period rule not found', 404);
    return;
  }

  await gracePeriodRuleService.delete(id);
  sendSuccess(res, null);
}
