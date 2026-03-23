import { Request, Response } from 'express';
import { workerService } from '../services/worker.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { Prisma } from '@prisma/client';

export async function listWorkers(req: Request, res: Response): Promise<void> {
  const { search, position, salary_type } = req.query;

  const workers = await workerService.list({
    search: search as string | undefined,
    position: position as string | undefined,
    salary_type: salary_type as string | undefined,
  });

  sendSuccess(res, workers);
}

export async function getWorker(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const worker = await workerService.getById(id);

  if (!worker) {
    sendError(res, 'Worker not found', 404);
    return;
  }

  sendSuccess(res, worker);
}

export async function createWorker(req: Request, res: Response): Promise<void> {
  const { base_id, name, salary_type, position, language, picture_url, resume_url } = req.body;

  if (!base_id || !name || !salary_type || !position || !language) {
    sendError(res, 'base_id, name, salary_type, position, and language are required', 400);
    return;
  }

  try {
    const worker = await workerService.create({
      base_id,
      name,
      salary_type,
      position,
      language,
      picture_url: picture_url || null,
      resume_url: resume_url || null,
    });

    sendSuccess(res, worker, 201);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      sendError(res, 'base_id already exists', 400);
      return;
    }
    throw err;
  }
}

export async function updateWorker(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  const existing = await workerService.getById(id);
  if (!existing) {
    sendError(res, 'Worker not found', 404);
    return;
  }

  try {
    const worker = await workerService.update(id, req.body);
    sendSuccess(res, worker);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      sendError(res, 'base_id already exists', 400);
      return;
    }
    throw err;
  }
}

export async function deleteWorker(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  const existing = await workerService.getById(id);
  if (!existing) {
    sendError(res, 'Worker not found', 404);
    return;
  }

  await workerService.delete(id);
  sendSuccess(res, null);
}
