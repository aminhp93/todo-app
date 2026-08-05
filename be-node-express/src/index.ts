import { env } from './config/env';
import { verifyDbConnection } from './config/db';
import { buildApp } from './app';

async function main() {
  await verifyDbConnection();
  const app = await buildApp();

  app.listen(env.port, () => {
    console.log(`Node-Express server running on port ${env.port}`);
    console.log(`GraphQL endpoint available at http://localhost:${env.port}/graphql`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
