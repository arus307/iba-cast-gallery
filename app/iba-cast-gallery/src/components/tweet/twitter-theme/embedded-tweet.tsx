import type { Tweet } from '../api/index'
import type { TwitterComponents } from './types'
import { TweetContainer } from './tweet-container'
import { TweetHeader } from './tweet-header'
import { TweetInReplyTo } from './tweet-in-reply-to'
import { TweetBody } from './tweet-body'
import { TweetMedia } from './tweet-media'
import { TweetInfo } from './tweet-info'
import { TweetActions } from './tweet-actions'
import { TweetReplies } from './tweet-replies'
import { QuotedTweet } from './quoted-tweet/index'
import { enrichTweet } from '../utils'
import { useMemo, useState, useEffect } from 'react'
import {Button, Stack, Grid2, IconButton} from '@mui/material'
import CastChip from 'components/CastChip'
import { CastDto } from '@iba-cast-gallery/types'
import { Star, StarBorderOutlined } from '@mui/icons-material'
import { yellow } from '@mui/material/colors';
import { addFavoritePostAction, deleteFavoritePostAction } from 'app/actions'
import { useFavoritePostIds } from 'app/client-components/FavoritePostIdsProvider'

type Props = {
  tweet: Tweet
  components?: Omit<TwitterComponents, 'TweetNotFound'>
  taggedCasts: CastDto[];
}

export const EmbeddedTweet = ({ tweet: t, components, taggedCasts }: Props) => {
  // useMemo does nothing for RSC but it helps when the component is used in the client (e.g by SWR)
  const tweet = useMemo(() => enrichTweet(t), [t])
  const [displayTweet, setDisplayTweet] = useState<boolean>(false);

  const { favoritePostIds, addFavorite: addFavoriteContext, removeFavorite: removeFavoriteContext, isLoading } = useFavoritePostIds();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoading) {
      setIsFavorite(favoritePostIds.includes(tweet.id_str));
    }
  }, [favoritePostIds, isLoading, tweet.id_str]);


  const addFavorite = ()=>{
    addFavoritePostAction(tweet.id_str);
    addFavoriteContext(tweet.id_str);
  };

  const deleteFavorite = ()=>{
    deleteFavoritePostAction(tweet.id_str);
    removeFavoriteContext(tweet.id_str);
  };

  return (
    <TweetContainer>
      {displayTweet && <TweetHeader tweet={tweet} components={components} />}
      {displayTweet && tweet.in_reply_to_status_id_str && <TweetInReplyTo tweet={tweet} />}
      {displayTweet && <TweetBody tweet={tweet} />}
      {tweet.mediaDetails?.length ? (
        <TweetMedia tweet={tweet} components={components} />
      ) : null}
      { displayTweet && tweet.quoted_tweet && <QuotedTweet tweet={tweet.quoted_tweet} />}
       <TweetInfo tweet={tweet} />
      {displayTweet && <TweetActions tweet={tweet} />}
      {displayTweet && <TweetReplies tweet={tweet} /> }
      <Grid2 container alignItems="center">
        <Grid2 size='grow'>
          <Stack direction='row' spacing={0.5} alignItems={'center'} useFlexGap sx={{width: '100%', flexWrap: 'wrap'}}>
            {taggedCasts.map((cast) => (
              <CastChip key={cast.id} cast={cast} />
            ))}
          </Stack>
        </Grid2>
        <Grid2>
          {
            isFavorite ? (
              <IconButton aria-label="unfavorite" onClick={deleteFavorite}>
                <Star sx={{ color: yellow[500] }} />
              </IconButton>
            ):(
              <IconButton aria-label="favorite" onClick={addFavorite}>
                <StarBorderOutlined color="action"/>
              </IconButton>
            )
          }
        </Grid2>
        <Grid2>
          <Button size="small" variant="outlined" onClick={()=>setDisplayTweet(!displayTweet)}>{displayTweet ? '画像のみ表示' : '詳細表示'}</Button>
        </Grid2>
      </Grid2>
    </TweetContainer>
  )
}
