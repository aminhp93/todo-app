import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/AppError';

// Stateless auth: the access token itself carries identity, no DB lookup
// needed on every request. Contrast with authenticateSession.ts, which does
// hit the session store on every request.
export function authenticateJwt(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed Authorization header');
  }

  const token = header.slice('Bearer '.length);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired access token');
  }
}
