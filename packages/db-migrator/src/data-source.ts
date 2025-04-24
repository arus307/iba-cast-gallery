import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { commonDataSourceOptions } from '@iba-cast-gallery/dao';

export const AppDataSource = new DataSource({
  ...(commonDataSourceOptions as Partial<DataSourceOptions>), // 型を明示的に指定
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_MIGRATION_USER_USERNAME,
  password: process.env.DB_MIGRATION_USER_PASSWORD,
  database: process.env.DB_DATABASE,
  schema: process.env.DB_SCHEMA,
  logging: ['query', 'error', 'migration'],
  replication: undefined,
  extra: {
    options: `-c search_path=${process.env.DB_SCHEMA || 'public'},public`
  },
});
