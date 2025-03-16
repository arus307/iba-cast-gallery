"use server";
import path from "path";
import * as fs from "fs";
import dayjs from "dayjs";

export type Db = {
    tweets: CastMediaTweet[];
    casts: Cast[];
};

export const getDbJsonString = async () => {
    const filePath = path.join(process.cwd(), 'public/db.json');
    const jsonString = fs.readFileSync(filePath, 'utf-8');
    return jsonString;
};
