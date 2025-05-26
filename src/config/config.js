require("dotenv").config({ path: `./.env.${process.env.NODE_ENV}` });

// console.log('Environment Variables:', process.env);
console.log("Environment:", process.env.NODE_ENV);

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.HOST,
    dialect: process.env.DB_DRIVER,
    secret: process.env.SECRET,
    port: process.env.DB_PORT,
    appPort: process.env.PORT,
  },
  local: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.HOST,
    dialect: process.env.DB_DRIVER,
    secret: process.env.SECRET,
    port: process.env.DB_PORT,
    appPort: process.env.PORT,
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.HOST,
    dialect: process.env.DB_DRIVER,
    secret: process.env.SECRET,
    port: process.env.DB_PORT,
    appPort: process.env.PORT,
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.HOST,
    dialect: process.env.DB_DRIVER,
    secret: process.env.SECRET,
    port: process.env.DB_PORT,
    appPort: process.env.PORT,
  },
};
