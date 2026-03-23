import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../services/prisma';
import { sendError, sendSuccess } from '../utils/apiResponse';

export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body;

  if (!username || !password) {
    sendError(res, 'Username and password are required', 400);
    return;
  }

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    sendError(res, 'Invalid username or password', 401);
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    sendError(res, 'Invalid username or password', 401);
    return;
  }

  const secret = process.env.JWT_SECRET || 'dev-secret-key';
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    secret,
    { expiresIn: '24h' },
  );

  sendSuccess(res, {
    token,
    user: { id: user.id, username: user.username, role: user.role },
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    sendError(res, 'Not authenticated', 401);
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, username: true, role: true },
  });

  if (!user) {
    sendError(res, 'User not found', 404);
    return;
  }

  sendSuccess(res, user);
}
