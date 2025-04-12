import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { commonDataSourceOptions } from '@iba-cast-gallery/dao';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const AppDataSource = new DataSource({
  ...(commonDataSourceOptions as Partial<DataSourceOptions>), // 型を明示的に指定
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_MIGRATION_USER_USERNAME || 'postgres',
  password: process.env.DB_MIGRATION_USER_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'iba_cast_gallery',
  logging: ['query', 'error', 'migration'],
  replication: undefined,
});
