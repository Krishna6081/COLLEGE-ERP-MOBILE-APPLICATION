import { pool } from '../config/database';
import { logger } from '../utils/logger';

export async function ensureAuthTables(): Promise<void> {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        token VARCHAR(500) NOT NULL,
        expires_at DATETIME NOT NULL,
        revoked TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_rt_user (user_id),
        KEY idx_rt_token (token(255))
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS otp_verifications (
        id VARCHAR(36) NOT NULL,
        identifier VARCHAR(150) NOT NULL,
        otp_code VARCHAR(10) NOT NULL,
        purpose ENUM('LOGIN', 'PASSWORD_RESET') NOT NULL DEFAULT 'LOGIN',
        expires_at DATETIME NOT NULL,
        is_verified TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_otp_identifier (identifier, purpose)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        used TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_pr_user (user_id),
        KEY idx_pr_token (token)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    logger.info('Auth tables verified and ready.');
  } catch (error: any) {
    logger.warn(`Could not verify/create auth tables: ${error.message}`);
  }
}
