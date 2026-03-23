import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { deviceService } from '../services/device.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export async function listDevices(req: Request, res: Response): Promise<void> {
  const { is_active } = req.query;
  const params = is_active !== undefined ? { is_active: is_active === 'true' } : undefined;
  const devices = await deviceService.list(params);
  sendSuccess(res, devices);
}

export async function getDevice(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const device = await deviceService.getById(id);
  if (!device) { sendError(res, 'Device not found', 404); return; }
  sendSuccess(res, device);
}

export async function createDevice(req: Request, res: Response): Promise<void> {
  const { name, serial_number, location } = req.body;
  if (!name) { sendError(res, 'name is required', 400); return; }

  try {
    const device = await deviceService.create({
      name,
      serial_number: serial_number || undefined,
      location: location || undefined,
    });
    sendSuccess(res, device, 201);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      sendError(res, 'Serial number already exists', 400); return;
    }
    throw err;
  }
}

export async function updateDevice(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const existing = await deviceService.getById(id);
  if (!existing) { sendError(res, 'Device not found', 404); return; }

  try {
    const device = await deviceService.update(id, req.body);
    sendSuccess(res, device);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      sendError(res, 'Serial number already exists', 400); return;
    }
    throw err;
  }
}

export async function deleteDevice(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const existing = await deviceService.getById(id);
  if (!existing) { sendError(res, 'Device not found', 404); return; }
  await deviceService.delete(id);
  sendSuccess(res, null);
}
