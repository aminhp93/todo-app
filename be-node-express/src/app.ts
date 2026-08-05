import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { sessionMiddleware } from './config/session';
import routes from './routes';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { buildContext } from './graphql/context';
import { errorHandler } from './middleware/errorHandler';

export async function buildApp() {
  const app = express();

  // credentials: true + reflected origin is required for the session-cookie
  // demo (session-auth/todos-session) to work from a browser frontend on a
  // different port; a wildcard origin can't be combined with credentials.
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(sessionMiddleware);

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api', routes);

  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();
  app.use('/graphql', expressMiddleware(apolloServer, { context: buildContext }));

  // Must be registered after all routes so thrown/rejected errors reach it.
  app.use(errorHandler);

  return app;
}
