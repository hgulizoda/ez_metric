import { Request, Response } from 'express';
import { efficiencyService } from '../services/efficiency.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export async function listEfficiency(req: Request, res: Response): Promise<void> {
  const { from, to } = req.query;

  if (!from || !to) {
    sendError(res, 'from and to query parameters are required', 400);
    return;
  }

  const data = await efficiencyService.listAll(from as string, to as string);
  sendSuccess(res, data);
}

export async function getWorkerEfficiency(req: Request, res: Response): Promise<void> {
  const workerId = Number(req.params.worker_id);
  const { from, to } = req.query;

  if (!from || !to) {
    sendError(res, 'from and to query parameters are required', 400);
    return;
  }

  const data = await efficiencyService.getWorkerEfficiency(workerId, from as string, to as string);

  if (!data) {
    sendError(res, 'Worker not found', 404);
    return;
  }

  sendSuccess(res, data);
}
