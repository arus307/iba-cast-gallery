import type { EnrichedQuotedTweet } from '../../utils'
import { QuotedTweetContainer } from './quoted-tweet-container'
import { QuotedTweetHeader } from './quoted-tweet-header'
import { QuotedTweetBody } from './quoted-tweet-body'
import { TweetMedia } from '../tweet-media'

type Props = { tweet: EnrichedQuotedTweet }

export const QuotedTweet = ({ tweet }: Props) => (
  <QuotedTweetContainer tweet={tweet}>
    <QuotedTweetHeader tweet={tweet} />
    <QuotedTweetBody tweet={tweet} />
    {tweet.mediaDetails?.length ? <TweetMedia quoted tweet={tweet} /> : null}
  </QuotedTweetContainer>
)
