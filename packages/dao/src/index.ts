// 1. DataSource オプションをエクスポート
export { commonDataSourceOptions } from './data-source';
export type { DataSourceOptions } from 'typeorm'; // 必要ならTypeORMの型も再エクスポート

// 2. Entity をエクスポート
export { Cast } from './entities/Cast';
export { Post } from './entities/Post';

// 3. Custom Repository や DAO をエクスポート (使う場合)
// 例1: カスタムリポジトリのファクトリ関数と型
// export { getUserRepository } from './repositories/UserRepository';
// export type { UserRepository } from './repositories/UserRepository';

// 例2: DAOクラス
// export { UserDao } from './dao/UserDao';

// 4. TypeORMの主要な型や関数を再エクスポートしておくと便利 (任意)
export {
  DataSource,
  Repository,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  // ... その他必要なもの
} from 'typeorm';