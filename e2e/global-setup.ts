import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { CastDto } from '@iba-cast-gallery/types';

const TEST_DATA_DIR = path.join(__dirname, '.test-data');
const CASTS_DATA_PATH = path.join(TEST_DATA_DIR, 'casts.json');
const API_URL = 'http://localhost:3000/api/casts';

async function globalSetup() {
    console.log('--- Global setup: Fetching cast data ---');

    try {
        // APIサーバーが起動するまでリトライする
        const casts = await fetchWithRetry(API_URL, 5, 3000);

        // .test-data ディレクトリが存在しない場合は作成
        if (!fs.existsSync(TEST_DATA_DIR)) {
            fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
        }

        // 取得したデータをJSONファイルに書き込む
        fs.writeFileSync(CASTS_DATA_PATH, JSON.stringify(casts, null, 2));

        console.log(`Successfully fetched ${casts.length} casts and saved to ${CASTS_DATA_PATH}`);
        console.log('--- Global setup: Complete ---');
    } catch (error) {
        console.error('!!! Global setup failed:', error);
        // セットアップに失敗した場合は、テストが失敗するようにプロセスを終了させる
        process.exit(1);
    }
}

async function fetchWithRetry(url: string, retries: number, delay: number): Promise<CastDto[]> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                return await response.json() as CastDto[];
            }
            console.warn(`Attempt ${i + 1}/${retries}: API request failed with status ${response.status}. Retrying in ${delay / 1000}s...`);
        } catch (error) {
            const err = error as Error;
            console.warn(`Attempt ${i + 1}/${retries}: API request failed with error: ${err.message}. Retrying in ${delay / 1000}s...`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    throw new Error(`Failed to fetch data from ${url} after ${retries} attempts.`);
}

export default globalSetup;
