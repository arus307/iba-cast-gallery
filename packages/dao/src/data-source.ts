import 'reflect-metadata';
import { DataSourceOptions } from 'typeorm';
import { Cast } from './entities/Cast';
import { Post } from './entities/Post';
import { PostCastTag } from './entities/PostCastTag';
import { User } from './entities/User';
import { UserAccount } from './entities/UserAccount';
import { Favorite } from './entities/Favorite';
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
    Cast,
    Post,
    PostCastTag,
    User,
    UserAccount,
    Favorite,
  ],
  migrations: [
    path.join(__dirname, 'migrations/**/*.js'),
  ],
  subscribers: [],
};
