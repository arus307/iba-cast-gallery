"use client";

import {Autocomplete, Button, TextField, Grid2, Stack, Card, CardContent} from "@mui/material";
import {useEffect, useState} from "react";
import { Tweet } from "react-tweet";
import {Cast} from "@shared-types/types";
import { DateTimeField } from "@mui/x-date-pickers";
import dayjs, {Dayjs} from "dayjs";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {useData} from "../context/DataContext";

/**
 * jsonの形に整形する
 */
const generateObjectSTring = (db:Db)=>{
  const objectString ="{\n" +
  "    \"tweets\": [ \n" +
   db.tweets.sort((a, b) => dayjs(a.postedAt).isAfter(dayjs(b.postedAt)) ? 1 : -1)
         .map((tweet) => 
           "        {\n" +
           "            \"id\": \"" + tweet.id + "\",\n" +
           "            \"postedAt\": \"" + tweet.postedAt + "\",\n" +
           "            \"taggedCastIds\": [" + tweet.taggedCastIds.join(",") + "]\n" +
           "        }"
         ).join(",\n") + "\n" + 
   "    ],\n" + 
   "    \"casts\": [ \n" +
   db.casts.map((cast) =>
           "        {\n" +
           "            \"id\": " + cast.id + ",\n" +
           "            \"name\": \"" + cast.name + "\",\n" +
           "            \"enName\": \"" + cast.enName + "\",\n" +
           "            \"introduceTweetId\": \"" + cast.introduceTweetId + "\",\n" +
           "            \"color\": \"" + cast.color + "\",\n" +
           "            \"type\": \"" + cast.type + "\"\n" +
           "        }"
   ).join(",\n") + "\n" + 
   "    ]\n" +
   "}";

   return objectString;
}

export default function Home() {

  const db = useData();

  const [tweetId, setTweetId] = useState<string>("");
  const [selectedCasts, setSelectedCasts] = useState<Cast[]>([]);
  const [tweetDateTime, setTweetDateTime] = useState<Dayjs|null>(dayjs());
  const [tweets, setTweets] = useState<CastMediaTweet[]>(db.tweets);

  const registerTweet = () => {
    if(!tweetId || !selectedCasts || !tweetDateTime) return;
    const newTweet = {
      id: tweetId,
      postedAt: tweetDateTime.format(),
      taggedCastIds: selectedCasts.map(cast=>cast.id)
    }

    setTweets([
      ...tweets.filter((tweet)=>tweet.id !== newTweet.id), // すでに存在している場合は一度取り除く
      newTweet
    ].sort((a,b)=>dayjs(a.postedAt).isAfter(dayjs(b.postedAt)) ? 1 : -1));

    setTweetId("");
    setSelectedCasts([]);
    setTweetDateTime(dayjs());
  }

  const objectString = generateObjectSTring({
    tweets:tweets,
    casts:db.casts,
  });

  const copyJson = () => {
    navigator.clipboard.writeText(objectString);
  }

  useEffect(()=>{
    // URLからツイートIDを取得
    const match = tweetId.match(/https:\/\/x\.com\/[^/]+\/status\/(\d+)/);
    if (match) {
      setTweetId(match[1]);
      return;
    }

    // ツイートが既存だったらタグ付けされているキャストを読み込む
    const existTweet = tweets.find((tweet)=>tweet.id === tweetId);
    if(existTweet){
      setSelectedCasts(db.casts.filter((cast)=>existTweet.taggedCastIds.includes(cast.id)));
      setTweetDateTime(dayjs(existTweet.postedAt));
    }else{
      setSelectedCasts([]);
      setTweetDateTime(dayjs());
    }
  },[tweetId]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
        <Grid2 container className="w-full" spacing={2}>

          <Grid2 size={8}>
            <Stack direction="column" spacing={2} alignItems="left">

            <TextField fullWidth value={tweetId} onChange={(e) => setTweetId(e.target.value)} label="Tweet ID" variant="outlined" size="small" />
            <Tweet id={tweetId} />
            <Autocomplete
                multiple
                fullWidth
                options={db.casts}
                getOptionLabel={(option) => option.name}
                value={selectedCasts}
                onChange={(event, newValue) => setSelectedCasts(newValue)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="写ってるキャストを選択"
                        variant="outlined"
                    />
                )}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimeField format="YYYY/MM/DD HH:mm" label="ツイートの日時" ampm={false} value={tweetDateTime} onChange={(newValue)=>setTweetDateTime(newValue)} />
            </LocalizationProvider>
            <Button sx={{marginTop:1}} variant="contained" color="primary" onClick={registerTweet}>登録</Button>
            </Stack>
          </Grid2>
          
          <Grid2 size={4}>
            <Button onClick={copyJson}>JSONをコピー</Button>
            <Card>
              <CardContent>
                <pre>{objectString}</pre>
              </CardContent>
            </Card>
          </Grid2>

        </Grid2>

      </main>
    </div>
  );
}
