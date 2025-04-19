// packages/dao/src/data-source-for-generate.ts
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Post } from './entities/Post';
import { Cast } from './entities/Cast';

if(process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'preview') {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env.development') });
}

const options: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_MIGRATION_USER_USERNAME,
  password: process.env.DB_MIGRATION_USER_PASSWORD,
  database: process.env.DB_DATABASE,
  schema: process.env.DB_SCHEMA,
  entities: [Post, Cast],
  migrations: [path.join(__dirname, 'migrations/**/*.js')],
  synchronize: false,
  logging: ['query', 'error'],
  extra: {
    options: `-c search_path=${process.env.DB_SCHEMA || 'public'},public`
  },
};

export const AppDataSourceForGenerate = new DataSource(options);