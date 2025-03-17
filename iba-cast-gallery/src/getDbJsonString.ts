"use server";
import path from "path";
import * as fs from "fs";

const getDbJsonString = async () => {
    const filePath = path.join(process.cwd(), 'public/db.json');
    const jsonString = fs.readFileSync(filePath, 'utf-8');
    return jsonString;
};

export default getDbJsonString;
