import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DB: {
    HOST: process.env.DATABASE_HOST || 'localhost',
    PORT: parseInt(process.env.DATABASE_PORT || '3306', 10),
    NAME: process.env.DATABASE_NAME || 'college_erp_db',
    USER: process.env.DATABASE_USER || 'root',
    PASSWORD: process.env.DATABASE_PASSWORD || '',
  },
  JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'default_access_secret_key_2026',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_key_2026',
    ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  FILE_STORAGE_PATH: process.env.FILE_STORAGE_PATH || './uploads',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};
