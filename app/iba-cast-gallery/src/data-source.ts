import { DataSource } from 'typeorm';
import { commonDataSourceOptions, resolveDatabaseSchema } from '@iba-cast-gallery/dao';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';

const NODE_ENV = process.env.NODE_ENV as 'development' | 'production' | 'preview' | undefined;
const databaseSchema = resolveDatabaseSchema(process.env);

export const appDataSource = new DataSource({
  ...commonDataSourceOptions,

  type:'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  schema: databaseSchema,
  logging: NODE_ENV === 'development' || NODE_ENV === 'preview' ? ['query', 'error', 'migration'] : false,
  extra: {
    options: `-c search_path=${databaseSchema},public`
  },
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
