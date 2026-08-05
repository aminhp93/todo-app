import { IncomingMessage } from 'http';
import { GraphQLError } from 'graphql';
import { verifyAccessToken } from '../utils/jwt';

export interface GraphQLContext {
  userId: number | null;
}

// Same JWT access tokens as the REST API (middleware/authenticateJwt.ts) —
// pass `Authorization: Bearer <token>` to /graphql. Resolvers that touch
// user-owned data check ctx.userId themselves and throw UNAUTHENTICATED if
// it's missing.
export async function buildContext({ req }: { req: IncomingMessage }): Promise<GraphQLContext> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return { userId: null };
  }
  try {
    const payload = verifyAccessToken(header.slice('Bearer '.length));
    return { userId: payload.sub };
  } catch {
    return { userId: null };
  }
}

export function requireUserId(ctx: GraphQLContext): number {
  if (!ctx.userId) {
    throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return ctx.userId;
}
