export default () => ({
  nodeEnv: process.env.NODE_ENV,
  mongoUri: process.env.MONGO_URI,
  mongoDbName: process.env.MONGO_DB_NAME,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  baseUrl: process.env.BASE_URL,
  port: parseInt(process.env.PORT, 10) || 3000,
});
