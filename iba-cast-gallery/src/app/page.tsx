"use server";

import getDb from "getDb";
import TweetFilter from "./client-components/TweetFilter";

export default async function Home () {
  const db = await getDb();

  return (
    <TweetFilter db={db}/>
  );
}
