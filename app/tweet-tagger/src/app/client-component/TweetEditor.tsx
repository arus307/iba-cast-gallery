"use client";

import { TextField, Stack, Button, Checkbox, FormControlLabel, } from "@mui/material";
import { useEffect, useState } from "react";
import { DateTimeField } from "@mui/x-date-pickers/DateTimeField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Tweet } from "../../components/tweet/swr";
import dayjs, { Dayjs } from "dayjs";
import { Cast, Post, PostCastTag } from "@iba-cast-gallery/dao";
import TagEditor from "./TagEditor";


/**
 * ツイート情報を編集するコンポーネント
 * 
 * @param initialId 編集対象のツイートID (新規登録時は空文字)
 */
const TweetEditor = ({ initialId }: {
  initialId: string;
}) => {

  // 初期値がある場合は編集不可とする
  const isDisableTweetId = initialId !== undefined && initialId !== "";

  const [casts, setCasts] = useState<Cast[]>([]);

  useEffect(() => {
    // DBからキャスト情報を取得する
    const fetchCasts = async () => {
      try {
        const response = await fetch("/api/casts");
        if (!response.ok) {
          // エラー処理
        }

        const data: Cast[] = await response.json();
        setCasts(data);
      } catch (error) {
        console.error("Error fetching casts:", error);
      }
    };

    fetchCasts();
  }, []);

  const [tweetId, setTweetId] = useState<string>(initialId ?? "");
  const [tweetDateTime, setTweetDateTime] = useState<Dayjs | null>(dayjs());
  const [isDeleted, setIsDeleted] = useState<boolean>(false);
  const [castTags, setCastTags] = useState<PostCastTag[]>([]);

  const registerTweet = async () => {
    if (tweetDateTime === null) return;

    const newPost: Post = {
      id: tweetId,
      postedAt: tweetDateTime?.toISOString(),
      isDeleted: isDeleted,
      castTags: castTags,
      taggedCasts: [],
    };

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ post: newPost }),
      });

      if (!response.ok) {
        // エラー処理
        console.error("Failed to register post");
        return;
      }

      // 登録完了で諸々リセット
      setTweetId("");
      setCastTags([]);
      setTweetDateTime(dayjs());
    } catch (error) {
      console.error("Error registering post:", error);
    }
  };

  const checkExistTweet = async (tweetId: string) => {
    try {
      const response = await fetch(`/api/posts/${tweetId}`);

      if (response.status === 404) {
        return;
      }

      if (!response.ok) {
        // エラー処理
        console.error("Failed to fetch post");
        return;
      }

      const data: Post = await response.json();

      if (Array.isArray(data.castTags)) {
        setCastTags(data.castTags.sort((a, b) => a.order - b.order));
      }
      setTweetDateTime(dayjs(data.postedAt));
      setIsDeleted(data.isDeleted);
    } catch (error) {
      console.error("Error fetch post:", error);
    }
  }

  useEffect(() => {
    // URLからツイートIDを取得
    const match = tweetId.match(/https:\/\/x\.com\/[^/]+\/status\/(\d+)/);
    if (match) {
      setTweetId(match[1]);
      return;
    }

    // ツイートが既存のものか確認して既存ならキャスト情報/投稿日時を更新する
    checkExistTweet(tweetId);
  }, [tweetId]);

  return (
    <Stack className="w-full" direction="column" spacing={2} alignItems="left">
      <TextField fullWidth value={tweetId} onChange={(e) => setTweetId(e.target.value)} label="Tweet ID" variant="outlined" size="small" disabled={isDisableTweetId} />
      <Tweet id={tweetId} taggedCasts={[]} />
      <TagEditor casts={casts} castTags={castTags} setCastTags={setCastTags} />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimeField format="YYYY/MM/DD HH:mm" label="ツイートの日時" ampm={false} value={tweetDateTime} onChange={(newValue) => setTweetDateTime(newValue)} />
      </LocalizationProvider>
      <FormControlLabel control={<Checkbox checked={isDeleted} onChange={(e, checked) => setIsDeleted(checked)} />} label="削除フラグ" />
      <Button sx={{ marginTop: 1 }} variant="contained" color="primary" onClick={registerTweet}> 登録</Button>
    </Stack>
  );
};

export default TweetEditor;
