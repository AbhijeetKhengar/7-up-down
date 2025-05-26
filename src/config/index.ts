const config = require('./config');

const env = process.env.NODE_ENV || 'development';
export const environment = config[env];
