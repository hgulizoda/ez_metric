import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { shiftTypeService } from '../services/shiftType.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export async function listShiftTypes(_req: Request, res: Response): Promise<void> {
  const types = await shiftTypeService.list();
  sendSuccess(res, types);
}

export async function getShiftType(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const st = await shiftTypeService.getById(id);
  if (!st) { sendError(res, 'Shift type not found', 404); return; }
  sendSuccess(res, st);
}

export async function createShiftType(req: Request, res: Response): Promise<void> {
  const { name } = req.body;
  if (!name) { sendError(res, 'name is required', 400); return; }

  try {
    const st = await shiftTypeService.create({ name });
    sendSuccess(res, st, 201);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      sendError(res, 'Shift type name already exists', 400); return;
    }
    throw err;
  }
}

export async function updateShiftType(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const existing = await shiftTypeService.getById(id);
  if (!existing) { sendError(res, 'Shift type not found', 404); return; }

  try {
    const st = await shiftTypeService.update(id, req.body);
    sendSuccess(res, st);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      sendError(res, 'Shift type name already exists', 400); return;
    }
    throw err;
  }
}

export async function deleteShiftType(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const existing = await shiftTypeService.getById(id);
  if (!existing) { sendError(res, 'Shift type not found', 404); return; }
  await shiftTypeService.delete(id);
  sendSuccess(res, null);
}
