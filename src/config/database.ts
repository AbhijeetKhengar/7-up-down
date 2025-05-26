import { Dialect } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

interface DatabaseConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  dialect: Dialect;
}

interface Config {
  development: DatabaseConfig;
  test: DatabaseConfig;
  production: DatabaseConfig;
  local: DatabaseConfig;
}

const getDialect = (): Dialect => {
  const dialect = (process.env.DB_DRIVER || 'mysql').toLowerCase();
  if (['mysql', 'postgres', 'sqlite', 'mariadb', 'mssql'].includes(dialect)) {
    return dialect as Dialect;
  }
  return 'mysql';
};

const config: Config = {
  local: {
    username: process.env.DB_USERNAME || "local_user",
    password: process.env.DB_PASSWORD || "local_pass",
    database: process.env.DB_NAME || "local_database",
    host: process.env.HOST || "127.0.0.1",
    dialect: getDialect(),
  },

  development: {
    username: process.env.DB_DEV_USER || "dev_user",
    password: process.env.DB_DEV_PASS || "dev_password",
    database: process.env.DB_DEV_NAME || "dev_database",
    host: process.env.DB_DEV_HOST || "host.dev",
    dialect: getDialect(),
  },
  test: {
    username: process.env.DB_TEST_USER || "test_user",
    password: process.env.DB_TEST_PASS || "test_password",
    database: process.env.DB_TEST_NAME || "test_database",
    host: process.env.DB_TEST_HOST || "host.test",
    dialect: getDialect(),
  },
  production: {
    username: process.env.DB_PROD_USER || "prod_user",
    password: process.env.DB_PROD_PASS || "prod_password",
    database: process.env.DB_PROD_NAME || "prod_database",
    host: process.env.DB_PROD_HOST || "prod.host",
    dialect: getDialect(),
  },
};

export default config;
