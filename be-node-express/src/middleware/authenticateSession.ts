import { Request, Response, NextFunction } from 'express';
import { findUserById } from '../repositories/user.repository';
import { UnauthorizedError } from '../utils/AppError';
import { asyncHandler } from './errorHandler';

// Stateful auth: the session cookie only holds an opaque id (see
// config/session.ts); every request re-fetches the user from Postgres via
// the session store. Contrast with authenticateJwt.ts's stateless approach.
//
// Wrapped in asyncHandler because it's an async function used directly as
// Express middleware: Express 4 only auto-forwards *synchronous* throws to
// the error handler, so a thrown error here would otherwise become an
// unhandled promise rejection (which crashes the process) instead of a 401.
export const authenticateSession = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const userId = req.session.userId;
    if (!userId) {
      throw new UnauthorizedError('Not logged in');
    }

    const user = await findUserById(userId);
    if (!user) {
      throw new UnauthorizedError('Session user no longer exists');
    }

    req.user = { id: user.id, email: user.email };
    next();
  },
);
