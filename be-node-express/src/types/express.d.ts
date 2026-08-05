declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

declare global {
  namespace Express {
    interface Request {
      // Populated by authenticateJwt for JWT-protected routes.
      user?: { id: number; email: string };
    }
  }
}

export {};
