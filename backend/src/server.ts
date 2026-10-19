import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { testDbConnection } from './config/database';

async function bootstrap() {
  const isDbConnected = await testDbConnection();
  if (isDbConnected) {
    const { ensureAuthTables } = await import('./database/init-auth-tables');
    await ensureAuthTables();
  } else {
    logger.info('Database unavailable; database-backed requests will report errors until the database reconnects.');
  }

  const server = app.listen(env.PORT, '0.0.0.0', () => {
    logger.info(`=================================================`);
    logger.info(`  COLLEGE ERP BACKEND SERVER IS RUNNING          `);
    logger.info(`  Port        : ${env.PORT}                     `);
    logger.info(`  Environment : ${env.NODE_ENV}                 `);
    logger.info(`  Local API   : http://localhost:${env.PORT}/api/v1 `);
    logger.info('  Device API  : Expo host metadata is used in development; set EXPO_PUBLIC_API_URL if needed.');
    logger.info(`=================================================`);
  });

  process.on('unhandledRejection', (reason: any) => {
    logger.error(`Unhandled Promise Rejection: ${reason?.message || reason}`);
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error(`Uncaught Exception: ${error.message}`);
  });
}

bootstrap();
