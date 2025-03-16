/* eslint @typescript-eslint/no-explicit-any: warn */
/* eslint @typescript-eslint/no-unused-vars: warn */
import { TweetContainer } from './tweet-container'
import styles from './tweet-not-found.module.css'

type Props = {
  error?: any
}

export const TweetNotFound = (_props: Props) => (
  <TweetContainer>
    <div className={styles.root}>
      <h3>Tweet not found</h3>
      <p>The embedded tweet could not be found…</p>
    </div>
  </TweetContainer>
)
