// packages/dao/src/data-source-for-generate.ts
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Post } from './entities/Post';
import { Cast } from './entities/Cast';

if(process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
}

const options: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_MIGRATION_USER_USERNAME || 'postgres',
  password: process.env.DB_MIGRATION_USER_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'iba_cast_gallery',
  entities: [Post, Cast],
  migrations: [path.join(__dirname, 'migrations/**/*.js')],
  synchronize: false,
  logging: ['query', 'error'],
};

export const AppDataSourceForGenerate = new DataSource(options);