import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { jobService } from '../services/job.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export async function listJobs(_req: Request, res: Response): Promise<void> {
  const jobs = await jobService.list();
  sendSuccess(res, jobs);
}

export async function getJob(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const job = await jobService.getById(id);
  if (!job) { sendError(res, 'Job not found', 404); return; }
  sendSuccess(res, job);
}

export async function createJob(req: Request, res: Response): Promise<void> {
  const { title } = req.body;
  if (!title) { sendError(res, 'title is required', 400); return; }

  try {
    const job = await jobService.create({ title });
    sendSuccess(res, job, 201);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      sendError(res, 'Job title already exists', 400); return;
    }
    throw err;
  }
}

export async function updateJob(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const existing = await jobService.getById(id);
  if (!existing) { sendError(res, 'Job not found', 404); return; }

  try {
    const job = await jobService.update(id, req.body);
    sendSuccess(res, job);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      sendError(res, 'Job title already exists', 400); return;
    }
    throw err;
  }
}

export async function deleteJob(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const existing = await jobService.getById(id);
  if (!existing) { sendError(res, 'Job not found', 404); return; }
  await jobService.delete(id);
  sendSuccess(res, null);
}
