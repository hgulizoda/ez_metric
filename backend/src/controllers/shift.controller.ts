import { Request, Response } from 'express';
import { shiftService } from '../services/shift.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export async function listShifts(req: Request, res: Response): Promise<void> {
  const { status } = req.query;
  const shifts = await shiftService.list({ status: status as string | undefined });
  sendSuccess(res, shifts);
}

export async function getShift(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const shift = await shiftService.getById(id);

  if (!shift) {
    sendError(res, 'Shift not found', 404);
    return;
  }

  sendSuccess(res, shift);
}

export async function createShift(req: Request, res: Response): Promise<void> {
  const { name, start_time, end_time } = req.body;

  if (!name || !start_time || !end_time) {
    sendError(res, 'name, start_time, and end_time are required', 400);
    return;
  }

  if (new Date(start_time) >= new Date(end_time)) {
    sendError(res, 'start_time must be before end_time', 400);
    return;
  }

  const shift = await shiftService.create({ name, start_time, end_time });
  sendSuccess(res, shift, 201);
}

export async function updateShift(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  const existing = await shiftService.getById(id);
  if (!existing) {
    sendError(res, 'Shift not found', 404);
    return;
  }

  const { start_time, end_time } = req.body;
  if (start_time && end_time && new Date(start_time) >= new Date(end_time)) {
    sendError(res, 'start_time must be before end_time', 400);
    return;
  }

  const data: Record<string, unknown> = { ...req.body };
  if (start_time) data.start_time = new Date(start_time);
  if (end_time) data.end_time = new Date(end_time);

  const shift = await shiftService.update(id, data);
  sendSuccess(res, shift);
}

export async function deleteShift(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  const existing = await shiftService.getById(id);
  if (!existing) {
    sendError(res, 'Shift not found', 404);
    return;
  }

  await shiftService.delete(id);
  sendSuccess(res, null);
}
