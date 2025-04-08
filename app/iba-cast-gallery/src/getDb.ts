"use server";
import path from "path";
import * as fs from "fs"
import dayjs from "dayjs";

const getDbJsonString = async () => {
    const filePath = path.join(process.cwd(), 'public/db.json');
    const jsonString = fs.readFileSync(filePath, 'utf-8');
    return jsonString;
};

const getDb = async()=>{
    const json = await getDbJsonString();
    const db = JSON.parse(json) as Db;

    const joinedDb:JoinedDb = {
        tweets: db.tweets
        .sort((a,b)=>{
            return dayjs(b.postedAt).isAfter(dayjs(a.postedAt)) ? 1: -1;
        })
        .map((tweet) => {
            const taggedCasts: Cast[] = tweet.taggedCastIds.map((castId) => {
                return db.casts.find((cast) => cast.id === castId);
            }).filter((cast): cast is Cast => cast !== undefined);

            return {
                id: tweet.id,
                postedAt: tweet.postedAt,
                taggedCasts: taggedCasts,
            };
        }),
        casts: db.casts,
    }

    return joinedDb;
}

export default getDb;