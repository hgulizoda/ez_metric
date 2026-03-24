import { Request, Response } from 'express';
import { clockService } from '../services/clock.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export async function clockIn(req: Request, res: Response): Promise<void> {
  const { worker_id, shift_id } = req.body;

  if (!worker_id || !shift_id) {
    sendError(res, 'worker_id and shift_id are required', 400);
    return;
  }

  const result = await clockService.clockIn({
    worker_id: Number(worker_id),
    shift_id: Number(shift_id),
  });

  if (result.error) {
    sendError(res, result.error, 400);
    return;
  }

  sendSuccess(res, result.data, 201);
}

export async function clockOut(req: Request, res: Response): Promise<void> {
  const { worker_id, shift_id } = req.body;

  if (!worker_id || !shift_id) {
    sendError(res, 'worker_id and shift_id are required', 400);
    return;
  }

  const result = await clockService.clockOut(Number(worker_id), Number(shift_id));

  if (result.error) {
    sendError(res, result.error, 400);
    return;
  }

  sendSuccess(res, result.data);
}

export async function listRecords(req: Request, res: Response): Promise<void> {
  const { worker_id, shift_id, from, to } = req.query;

  const records = await clockService.listRecords({
    worker_id: worker_id as string | undefined,
    shift_id: shift_id as string | undefined,
    from: from as string | undefined,
    to: to as string | undefined,
  });

  sendSuccess(res, records);
}

export async function getRecord(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const record = await clockService.getRecordById(id);

  if (!record) {
    sendError(res, 'Clock record not found', 404);
    return;
  }

  sendSuccess(res, record);
}

export async function editRecord(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  const existing = await clockService.getRecordById(id);
  if (!existing) {
    sendError(res, 'Clock record not found', 404);
    return;
  }

  const { edit_note } = req.body;
  if (!edit_note) {
    sendError(res, 'edit_note is required for manual edits', 400);
    return;
  }

  const record = await clockService.manualEdit(id, req.body);
  sendSuccess(res, record);
}
