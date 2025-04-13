import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import path from 'path';


/**
 * 共通のDataSource設定オプション。
 * 実際の接続情報 (host, port, username, password, database) は
 * 利用側のプロジェクトで環境変数などから設定することを想定しています。
 */
export const commonDataSourceOptions: Partial<DataSourceOptions> = {
  type: 'postgres',
  synchronize: false,
  logging: false,
  entities: [
    path.join(__dirname, 'entities/**/*.js'),
  ],
  migrations: [
    path.join(__dirname, 'migrations/**/*.js'),
  ],
  subscribers: [],
};
