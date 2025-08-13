import type { ReactNode } from 'react'
import clsx from 'clsx'
import s from './tweet-container.module.css'
import './theme.css'

type Props = { className?: string; children: ReactNode, dataTestId?:string }

export const TweetContainer = ({ className, children, dataTestId }: Props) => (
  <div className={clsx('react-tweet-theme', s.root, className)} data-testid={`tweet-container-${dataTestId}`}>
    <article className={s.article}>{children}</article>
  </div>
)
