import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';
import { Post } from './entities/Post';
import { Cast } from './entities/Cast';
import { PostCastTag } from './entities/PostCastTag';

const options: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_MIGRATION_USER_USERNAME,
  password: process.env.DB_MIGRATION_USER_PASSWORD,
  database: process.env.DB_DATABASE,
  schema: process.env.DB_SCHEMA,
  entities: [Post, Cast, PostCastTag],
  migrations: [path.join(__dirname, 'migrations/**/*.js')],
  synchronize: false,
  logging: ['query', 'error'],
  extra: {
    options: `-c search_path=${process.env.DB_SCHEMA || 'public'},public`
  },
};

export const AppDataSourceForGenerate = new DataSource(options);