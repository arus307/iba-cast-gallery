'use client'

import type { ReactNode } from 'react'
import type { EnrichedQuotedTweet } from '../../utils'
import s from './quoted-tweet-container.module.css'

type Props = { tweet: EnrichedQuotedTweet; children: ReactNode }

export const QuotedTweetContainer = ({ tweet, children }: Props) => (
  <div
    className={s.root}
    onClick={(e) => {
      e.preventDefault()
      window.open(tweet.url, '_blank')
    }}
  >
    <article className={s.article}>{children}</article>
  </div>
)
