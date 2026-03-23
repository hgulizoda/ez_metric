import { Request, Response } from 'express';
import { reportService } from '../services/report.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export async function payrollSummary(req: Request, res: Response): Promise<void> {
  const { from, to, worker_id, position } = req.query;

  if (!from || !to) {
    sendError(res, 'from and to query parameters are required', 400);
    return;
  }

  const data = await reportService.payrollSummary({
    from: from as string,
    to: to as string,
    ...(worker_id && { worker_id: Number(worker_id) }),
    ...(position && { position: position as string }),
  });
  sendSuccess(res, data);
}

export async function exportExcel(req: Request, res: Response): Promise<void> {
  const { from, to, worker_id, position } = req.query;

  if (!from || !to) {
    sendError(res, 'from and to query parameters are required', 400);
    return;
  }

  const buffer = await reportService.exportExcel({
    from: from as string,
    to: to as string,
    ...(worker_id && { worker_id: Number(worker_id) }),
    ...(position && { position: position as string }),
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=payroll_${from}_${to}.xlsx`);
  res.send(buffer);
}

export async function weeklyStatements(req: Request, res: Response): Promise<void> {
  const { week_start } = req.query;

  if (!week_start) {
    sendError(res, 'week_start query parameter is required', 400);
    return;
  }

  const data = await reportService.weeklyStatement(week_start as string);
  sendSuccess(res, data);
}

export async function workerInspection(req: Request, res: Response): Promise<void> {
  const workerId = Number(req.params.worker_id);
  const { from, to } = req.query;

  if (!from || !to) {
    sendError(res, 'from and to query parameters are required', 400);
    return;
  }

  const data = await reportService.workerInspection(workerId, from as string, to as string);

  if (!data) {
    sendError(res, 'Worker not found', 404);
    return;
  }

  sendSuccess(res, data);
}

export async function listStatements(req: Request, res: Response): Promise<void> {
  const { from, to } = req.query;

  if (!from || !to) {
    sendError(res, 'from and to query parameters are required', 400);
    return;
  }

  const summary = await reportService.payrollSummary({
    from: from as string,
    to: to as string,
  });

  const statements = summary.map((s) => ({
    id: s.worker_id,
    worker_name: s.worker_name,
    base_id: s.base_id,
    net_pay: s.net_pay,
    period: { from, to },
  }));

  sendSuccess(res, statements);
}

export async function getStatement(req: Request, res: Response): Promise<void> {
  const workerId = Number(req.params.id);
  const { from, to } = req.query;

  if (!from || !to) {
    sendError(res, 'from and to query parameters are required', 400);
    return;
  }

  const data = await reportService.statementForWorker(workerId, from as string, to as string);

  if (!data) {
    sendError(res, 'Worker not found', 404);
    return;
  }

  sendSuccess(res, data);
}

export async function fakeGmail(_req: Request, res: Response): Promise<void> {
  sendSuccess(res, { sent: true, message: 'Statement sent to Gmail (simulated)' });
}
