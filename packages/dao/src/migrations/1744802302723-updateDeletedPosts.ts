// @ts-nocheck
// (エンティティの変更によってエラーが出るようになったので、ts-nocheckを追加しています)

import { Post } from "../entities/Post";
import { MigrationInterface, QueryRunner } from "typeorm";


export class UpdateDeletedPosts1744802302723 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Obsolete: consolidated into 1800000000000-consolidatePostSeedData.ts
        /*
        await queryRunner.manager.createQueryBuilder()
            .update(Post)
            .set({ isDeleted: true })
            .where("id IN (:...ids)", { ids: targetPostIds })
            .execute();
        */
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Obsolete: consolidated into 1800000000000-consolidatePostSeedData.ts
        /*
        await queryRunner.manager.createQueryBuilder()
            .update(Post)
            .set({ isDeleted: false })
            .where("id IN (:...ids)", { ids: targetPostIds })
            .execute();
        */
    }

}

const targetPostIds = [
    '1875806976611102749',
    '1881537451149476037',
    '1881627800299565408',
    '1882262384200634748',
    '1882624801074012358',
    '1882702860233953636',
    '1885213014464618763',
    '1893501977658569064',
    '1898207056508645842',
    '1900394693659418728',
    '1903283218281009486',
    '1905106186762129677'
];
