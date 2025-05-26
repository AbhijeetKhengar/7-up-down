import { Sequelize } from "sequelize";
import { logger } from "../logger/logger";
import { environment } from "./index";

const { database, username, password, dialect, port, host } = environment;

const dialectOptions = dialect === 'mysql' ? {
  supportBigNumbers: true,
  bigNumberStrings: true
} : undefined;

export const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
  benchmark: true,
  logging: (sql: string, timing?: number) => {
    if (process.env.SQL_LOGGING === 'true') {
      logger.debug(`[${timing}ms] ${sql}`);
    }
  },
  port: port,
  timezone: "+05:30",
  dialectOptions,
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  }
});

logger.debug(`Database connection configured: ${dialect}://${username}@${host}:${port}/${database}`);

export default sequelize;
