"use server";

import { Typography, Box, Accordion, AccordionSummary,AccordionDetails } from "@mui/material";
import { getCastDetail } from "services/castService";
import Tweets from "../../../components/Tweets";
import {Tweet} from 'components/tweet/swr';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default async function Page(
  { params }: { params: { castEnName: string } }
) {

  const castEnName = params.castEnName;
  const cast = await getCastDetail(castEnName);

  const joinedPosts : JoinedPost[]  = cast.taggedPosts.map((post)=>{
    return {
      id: post.id,
      postedAt: post.postedAt,
      taggedCasts: post.taggedCasts,
    };
  });

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{mb:2}}>
        {cast.name} ({cast.enName})
      </Typography>

      <Accordion defaultExpanded sx={{mb:2}}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography variant="h5" component="h2">紹介ポスト</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{p:0}}>
          <Box sx={{ mb: 2, justifyContent: "center", display: "flex" }}>
            <Tweet id={cast.introduceTweetId} taggedCasts={[]}/>
          </Box>          
        </AccordionDetails>
      </Accordion>

      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>ポスト一覧</Typography>

      <Tweets joinedPosts={joinedPosts}/>
    </Box>
  );
}
