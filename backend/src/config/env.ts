import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const accessSecret = process.env.JWT_ACCESS_SECRET || 'default_access_secret_key_2026';
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_key_2026';
const developmentJwtSecrets = new Set([
  'default_access_secret_key_2026',
  'default_refresh_secret_key_2026',
  'college_erp_access_secret_key_2026_super_secure!',
  'college_erp_refresh_secret_key_2026_super_secure!',
]);

export function validateProductionConfiguration(config: NodeJS.ProcessEnv = process.env) {
  if ((config.NODE_ENV || 'development') !== 'production') return;
  const missing: string[] = [];
  for (const key of ['DATABASE_HOST', 'DATABASE_NAME', 'DATABASE_USER', 'DATABASE_PASSWORD'] as const) {
    if (!config[key]) missing.push(key);
  }
  const productionAccessSecret = config.JWT_ACCESS_SECRET || '';
  const productionRefreshSecret = config.JWT_REFRESH_SECRET || '';
  if (productionAccessSecret.length < 32 || developmentJwtSecrets.has(productionAccessSecret)) {
    missing.push('a strong JWT_ACCESS_SECRET (at least 32 characters)');
  }
  if (productionRefreshSecret.length < 32 || developmentJwtSecrets.has(productionRefreshSecret)) {
    missing.push('a strong JWT_REFRESH_SECRET (at least 32 characters)');
  }
  if (productionAccessSecret && productionAccessSecret === productionRefreshSecret) {
    missing.push('distinct JWT access and refresh secrets');
  }
  if (!config.DATABASE_USER || config.DATABASE_USER.trim().toLowerCase() === 'root') {
    missing.push('a non-root DATABASE_USER');
  }
  if (!config.DATABASE_PASSWORD || ['root', 'password', 'password123'].includes(config.DATABASE_PASSWORD.trim().toLowerCase())) {
    missing.push('a non-default DATABASE_PASSWORD');
  }
  if (!config.CORS_ORIGIN || config.CORS_ORIGIN.trim() === '*') {
    missing.push('an explicit CORS_ORIGIN');
  }
  if (missing.length) {
    throw new Error(`Unsafe production configuration: set ${missing.join(', ')}`);
  }
}

validateProductionConfiguration();

export const env = {
  NODE_ENV: nodeEnv,
  PORT: parseInt(process.env.PORT || '5000', 10),
  DB: {
    HOST: process.env.DATABASE_HOST || 'localhost',
    PORT: parseInt(process.env.DATABASE_PORT || '3306', 10),
    NAME: process.env.DATABASE_NAME || 'college_erp_db',
    USER: process.env.DATABASE_USER || 'root',
    PASSWORD: process.env.DATABASE_PASSWORD || 'root',
  },
  JWT: {
    ACCESS_SECRET: accessSecret,
    REFRESH_SECRET: refreshSecret,
    ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  FILE_STORAGE_PATH: process.env.FILE_STORAGE_PATH || './uploads',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};
