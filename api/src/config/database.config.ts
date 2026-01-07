import { registerAs } from '@nestjs/config';
import * as fs from 'fs';

export default registerAs('database', () => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number.parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_NAME || 'expense_tracker',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  ssl:
    process.env.DB_SSL === 'true'
      ? {
          cert: fs.readFileSync(process.env.DB_CA_CERTIFICATE_PATH),
          key: fs.readFileSync(process.env.DB_KEY_PATH),
          rejectUnauthorized: false,
        }
      : false,
  extra: {
    family: 4,
  },
}));
