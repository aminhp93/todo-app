import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { toPublicUser } from '../types/domain';
import { BadRequestError } from '../utils/AppError';
import { asyncHandler } from '../middleware/errorHandler';

// JWT flow: register issues no tokens (client must log in explicitly);
// login/refresh return { accessToken, refreshToken } for the client to store
// (access in memory, refresh in a secure store) and send back as
// `Authorization: Bearer <accessToken>`.

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const user = await authService.register(email, password, name);
  res.status(201).json(user);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await authService.validateCredentials(email, password);
  const tokens = await authService.issueTokenPair(user);
  res.json({ user: toPublicUser(user), ...tokens });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (typeof refreshToken !== 'string') {
    throw new BadRequestError('refreshToken is required');
  }
  const tokens = await authService.rotateRefreshToken(refreshToken);
  res.json(tokens);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (typeof refreshToken !== 'string') {
    throw new BadRequestError('refreshToken is required');
  }
  await authService.logout(refreshToken);
  res.status(204).send();
});
