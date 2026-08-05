import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

function isBodyParserSyntaxError(err: unknown): boolean {
  return err instanceof SyntaxError && 'body' in err && (err as { status?: number }).status === 400;
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', details: err.issues });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // express.json() throws a raw SyntaxError for malformed request bodies;
  // that's a client mistake (400), not a server fault (500).
  if (isBodyParserSyntaxError(err)) {
    res.status(400).json({ error: 'Malformed JSON body' });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}

// Wraps an async route handler so rejected promises reach errorHandler
// instead of crashing the process (Express 4 doesn't do this automatically).
export function asyncHandler<T extends (req: Request, res: Response, next: NextFunction) => Promise<unknown>>(
  fn: T,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
