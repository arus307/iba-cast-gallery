"use client";
import Image from "next/image";
import {Autocomplete, Button, TextField, Grid2, Stack, Card, CardContent} from "@mui/material";
import {useState} from "react";
import { Tweet } from "react-tweet";
import {db} from "src/db";
import {Cast} from "@shared-types/types";
import { DateTimeField } from "@mui/x-date-pickers";
import dayjs, {Dayjs} from "dayjs";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export default function Home() {

  const [tweetId, setTweetId] = useState<string>("");

  const [selectedCasts, setSelectedCasts] = useState<Cast[]>([]);

  const [tweetDateTime, setTweetDateTime] = useState<Dayjs|null>(dayjs());

  const [tweets, setTweets] = useState<CastMediaTweet[]>(db.tweets);

  const registerTweet = () => {
    if(!tweetId || !selectedCasts || !tweetDateTime) return;
    const newTweet = {
      id: tweetId,
      postedAt: tweetDateTime,
      taggedCastIds: selectedCasts.map(cast=>cast.id)
    }

    if(tweets.find(tweet=>tweet.id===newTweet.id) ===undefined){
      // 重複がない場合のみ追加
      setTweets([...tweets, newTweet]);
    }

    setTweetId("");
    setSelectedCasts([]);
    setTweetDateTime(dayjs());

    console.log(JSON.stringify(tweets));

  }

  console.log(tweets[0].postedAt);

  const objectString = "\"tweets\": [ \n" +
                        tweets.map((tweet) => 
                          "    {\n" +
                          "        id: \"" + tweet.id + "\",\n" +
                          "        postedAt: dayjs(\"" + tweet.postedAt.format() + "\"),\n" +
                          "        taggedCastIds: [" + tweet.taggedCastIds.join(",") + "]\n" +
                          "    },\n"
                        ).join("") +
                      "]";

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
            <Card>
              <CardContent>
                <pre>{objectString}</pre>
              </CardContent>
            </Card>
          </Grid2>

        </Grid2>

      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
