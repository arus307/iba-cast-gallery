// packages/dao/src/data-source-for-generate.ts
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Post } from './entities/Post';
import { Cast } from './entities/Cast';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const options: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DEV_DB_HOST || 'localhost',
  port: Number(process.env.DEV_DB_PORT) || 5432,
  username: process.env.DEV_DB_USERNAME || 'postgres',
  password: process.env.DEV_DB_PASSWORD || 'password',
  database: process.env.DEV_DB_DATABASE || 'ibacastgallery',
  entities: [Post, Cast],
  migrations: [path.join(__dirname, 'migrations/**/*.ts')],
  synchronize: false,
  logging: ['query', 'error'],
};

export const AppDataSourceForGenerate = new DataSource(options);