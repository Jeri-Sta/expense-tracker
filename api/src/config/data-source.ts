import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number.parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_NAME || 'expense_tracker',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
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
});
