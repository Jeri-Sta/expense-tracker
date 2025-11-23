import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: Number.parseInt(process.env.API_PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number.parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
}));