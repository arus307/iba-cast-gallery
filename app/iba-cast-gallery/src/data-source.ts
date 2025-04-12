import { DataSource } from 'typeorm';
import { commonDataSourceOptions } from '@iba-cast-gallery/dao';
import * as dotenv from 'dotenv';

dotenv.config(); // .env ファイルから環境変数を読み込む

export const appDataSource = new DataSource({
  ...commonDataSourceOptions,

  type:'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'iba_cast_gallery',
  logging: process.env.NODE_ENV === 'development',
});

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