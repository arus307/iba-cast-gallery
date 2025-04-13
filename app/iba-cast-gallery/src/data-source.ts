import { DataSource } from 'typeorm';
import { commonDataSourceOptions } from '@iba-cast-gallery/dao';
import * as dotenv from 'dotenv';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';
import * as path from 'path';
import 'reflect-metadata';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env.development') });
}

export const appDataSource = new DataSource({
  ...commonDataSourceOptions,
  
  type:'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  logging: process.env.NODE_ENV === 'development',
} as PostgresConnectionOptions);

export const initializeDatabase = async () => {
  try {
    if (!appDataSource.isInitialized) {
      await appDataSource.initialize();
      console.log('Data Source has been initialized!');
    }
  } catch (err) {
    console.error('Error during Data Source initialization:', err);
    process.exit(1); // 初期化失敗時はプロセス終了など
  }
};