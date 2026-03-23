import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { managerService } from '../services/manager.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export async function listManagers(_req: Request, res: Response): Promise<void> {
  const managers = await managerService.list();
  sendSuccess(res, managers);
}

export async function createManager(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body;

  if (!username || !password) {
    sendError(res, 'username and password are required', 400);
    return;
  }

  try {
    const manager = await managerService.create({ username, password });
    sendSuccess(res, manager, 201);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      sendError(res, 'Username already exists', 400);
      return;
    }
    throw err;
  }
}

export async function updateManager(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  const existing = await managerService.getById(id);
  if (!existing) {
    sendError(res, 'Manager not found', 404);
    return;
  }

  try {
    const manager = await managerService.update(id, req.body);
    sendSuccess(res, manager);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      sendError(res, 'Username already exists', 400);
      return;
    }
    throw err;
  }
}

export async function deleteManager(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  const existing = await managerService.getById(id);
  if (!existing) {
    sendError(res, 'Manager not found', 404);
    return;
  }

  await managerService.delete(id);
  sendSuccess(res, null);
}
