import { config } from 'dotenv';
config();

export default {
  nodeEnv: process.env.NODE_ENV || 'dev',
  mongoUri: process.env.MONGO_URI,
  mongoDbName: process.env.MONGO_DB_NAME,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30m',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  port: parseInt(process.env.PORT, 10) || 3000,
};
