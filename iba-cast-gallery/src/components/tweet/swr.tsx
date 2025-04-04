'use client'

import { type ReactNode } from 'react'
import {
  EmbeddedTweet,
  TweetNotFound,
  TweetSkeleton,
  type TwitterComponents,
} from './twitter-theme/components'
import { type TweetCoreProps } from './utils'
import { useTweet } from './hooks'

export type TweetProps = Omit<TweetCoreProps, 'id'> & {
  fallback?: ReactNode
  components?: TwitterComponents
  fetchOptions?: RequestInit
  taggedCasts: Cast[];
} & (
    | {
        id: string
        apiUrl?: string
      }
    | {
        id?: string
        apiUrl: string | undefined
      }
  )

export const Tweet = ({
  id,
  apiUrl,
  fallback = <TweetSkeleton />,
  components,
  fetchOptions,
  onError,
  taggedCasts,
}: TweetProps) => {
  const { data, error, isLoading } = useTweet(id, apiUrl, fetchOptions)

  if (isLoading) return fallback
  if (error || !data) {
    const NotFound = components?.TweetNotFound || TweetNotFound
    return <NotFound error={onError ? onError(error) : error} />
  }

  return <EmbeddedTweet tweet={data} components={components} taggedCasts={taggedCasts}/>
}
