import { CastDto } from '@iba-cast-gallery/types';
import fs from 'fs';
import path from 'path';

const CASTS_DATA_PATH = path.join(__dirname, '../.test-data/casts.json');

/**
 * globalSetupで生成されたキャスト一覧のJSONファイルを読み込み、その内容を返す。
 * @returns {CastDto[]} キャスト情報の配列
 */
export function getTestCasts(): CastDto[] {
    if (!fs.existsSync(CASTS_DATA_PATH)) {
        // globalSetupが失敗した場合などはファイルが存在しない可能性がある
        console.warn(`Could not find cast data file at ${CASTS_DATA_PATH}. Returning empty array.`);
        return [];
    }

    try {
        const fileContent = fs.readFileSync(CASTS_DATA_PATH, 'utf-8');
        const casts = JSON.parse(fileContent) as CastDto[];
        return casts;
    } catch (error) {
        console.error(`Error reading or parsing cast data from ${CASTS_DATA_PATH}:`, error);
        return [];
    }
}
