import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { departmentService } from '../services/department.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export async function listDepartments(_req: Request, res: Response): Promise<void> {
  const departments = await departmentService.list();
  sendSuccess(res, departments);
}

export async function getDepartment(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const dept = await departmentService.getById(id);
  if (!dept) { sendError(res, 'Department not found', 404); return; }
  sendSuccess(res, dept);
}

export async function createDepartment(req: Request, res: Response): Promise<void> {
  const { name } = req.body;
  if (!name) { sendError(res, 'name is required', 400); return; }

  try {
    const dept = await departmentService.create({ name });
    sendSuccess(res, dept, 201);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      sendError(res, 'Department name already exists', 400); return;
    }
    throw err;
  }
}

export async function updateDepartment(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const existing = await departmentService.getById(id);
  if (!existing) { sendError(res, 'Department not found', 404); return; }

  try {
    const dept = await departmentService.update(id, req.body);
    sendSuccess(res, dept);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      sendError(res, 'Department name already exists', 400); return;
    }
    throw err;
  }
}

export async function deleteDepartment(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const existing = await departmentService.getById(id);
  if (!existing) { sendError(res, 'Department not found', 404); return; }
  await departmentService.delete(id);
  sendSuccess(res, null);
}
