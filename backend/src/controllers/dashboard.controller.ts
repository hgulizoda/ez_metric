import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/apiResponse';

export async function getSummary(_req: Request, res: Response): Promise<void> {
  const data = await dashboardService.summary();
  sendSuccess(res, data);
}

export async function getWorkedHours(_req: Request, res: Response): Promise<void> {
  const data = await dashboardService.workedHours();
  sendSuccess(res, data);
}

export async function getBonusProgress(_req: Request, res: Response): Promise<void> {
  const data = await dashboardService.bonusProgress();
  sendSuccess(res, data);
}
