import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { findUserById } from '../repositories/user.repository';
import { toPublicUser } from '../types/domain';
import { UnauthorizedError } from '../utils/AppError';
import { asyncHandler } from '../middleware/errorHandler';

// Session flow: login regenerates the session (mitigates session fixation),
// stores only the user id server-side, and the client just carries the
// cookie express-session sets — no token to store or attach manually.

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await authService.validateCredentials(email, password);

  await new Promise<void>((resolve, reject) => {
    req.session.regenerate((err) => (err ? reject(err) : resolve()));
  });
  req.session.userId = user.id;

  res.json({ user: toPublicUser(user) });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await new Promise<void>((resolve, reject) => {
    req.session.destroy((err) => (err ? reject(err) : resolve()));
  });
  res.clearCookie('connect.sid');
  res.status(204).send();
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) {
    throw new UnauthorizedError('Not logged in');
  }
  const user = await findUserById(userId);
  if (!user) {
    throw new UnauthorizedError('Session user no longer exists');
  }
  res.json(toPublicUser(user));
});
