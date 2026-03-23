import { Request, Response } from 'express';
import { ClockStatus } from '@prisma/client';
import { clockService } from '../services/clock.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export async function clockIn(req: Request, res: Response): Promise<void> {
  const { worker_id, shift_id, device_id, shift_type_id } = req.body;

  if (!worker_id || !shift_id) {
    sendError(res, 'worker_id and shift_id are required', 400);
    return;
  }

  const result = await clockService.clockIn({
    worker_id: Number(worker_id),
    shift_id: Number(shift_id),
    device_id: device_id ? Number(device_id) : undefined,
    shift_type_id: shift_type_id ? Number(shift_type_id) : undefined,
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
  const { worker_id, shift_id, status, from, to } = req.query;

  const records = await clockService.listRecords({
    worker_id: worker_id as string | undefined,
    shift_id: shift_id as string | undefined,
    status: status as string | undefined,
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

export async function changeStatus(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { status, note } = req.body;

  if (!status) {
    sendError(res, 'status is required', 400);
    return;
  }

  const validStatuses: ClockStatus[] = ['pending', 'approved', 'rejected', 'flagged'];
  if (!validStatuses.includes(status)) {
    sendError(res, `status must be one of: ${validStatuses.join(', ')}`, 400);
    return;
  }

  const existing = await clockService.getRecordById(id);
  if (!existing) {
    sendError(res, 'Clock record not found', 404);
    return;
  }

  const adminUserId = req.user!.id;
  const record = await clockService.changeStatus(id, status as ClockStatus, adminUserId, note);
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

  const adminUserId = req.user!.id;
  const record = await clockService.manualEdit(id, req.body, adminUserId);
  sendSuccess(res, record);
}
