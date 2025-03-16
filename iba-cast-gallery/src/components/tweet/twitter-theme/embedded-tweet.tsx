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
import { useMemo, useState } from 'react'
import {Button, Stack} from '@mui/material'
import CastChip from 'components/CastChip'

type Props = {
  tweet: Tweet
  components?: Omit<TwitterComponents, 'TweetNotFound'>
  taggedCasts: Cast[];
}

export const EmbeddedTweet = ({ tweet: t, components, taggedCasts }: Props) => {
  // useMemo does nothing for RSC but it helps when the component is used in the client (e.g by SWR)
  const tweet = useMemo(() => enrichTweet(t), [t])
  const [displayTweet, setDisplayTweet] = useState<boolean>(false);
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
      <Stack direction='row' spacing={1} sx={{m:0.5}} alignItems={'center'}>
        {taggedCasts.map((cast) => (
          <CastChip key={cast.id} cast={cast} />
        ))}
        <Button size="small" variant="outlined" onClick={()=>setDisplayTweet(!displayTweet)}>ツイート全体を表示</Button>
      </Stack>
    </TweetContainer>
  )
}
