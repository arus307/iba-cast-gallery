"use server";

import {
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { getCastDetail } from "services/castService";
import Tweets from "../../../components/Tweets";
import { Tweet } from "components/tweet/swr";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FanMark from "../../../components/FanMark";
import dayjs from "dayjs";

export default async function Page({
  params,
}: {
  params: Promise<{ castEnName: string }>;
}) {
  const castEnName = await params.then((p) => p.castEnName);
  const cast = await getCastDetail(castEnName);

  const joinedPosts: JoinedPost[] = cast.taggedPosts
    .map((post) => {
      return {
        id: post.id,
        postedAt: post.postedAt,
        taggedCasts: post.taggedCasts,
      };
    })
    .sort((a, b) => (dayjs(a.postedAt).isAfter(dayjs(b.postedAt)) ? -1 : 1));

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 2 }}
        data-testid="cast-name"
      >
        {cast.name} ({cast.enName}){" "}
        <FanMark fanMark={cast.fanMark} dataTestId="fan-mark" />
      </Typography>

      {cast.introduceTweetId && (
        <Accordion
          defaultExpanded
          sx={{ mb: 2 }}
          data-testid="introduce-tweet-accordion"
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" component="h2">
              紹介ポスト
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Box
              sx={{ mb: 2, justifyContent: "center", display: "flex" }}
              data-testid="introduce-tweet"
            >
              <Tweet id={cast.introduceTweetId} taggedCasts={[]} />
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        ポスト一覧
      </Typography>

      <Tweets joinedPosts={joinedPosts} />
    </Box>
  );
}
