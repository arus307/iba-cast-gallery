/**
 * Custom components that the default Twitter theme allows.
 *
 * Note: We only use these components in Server Components, because the root `Tweet`
 * component that uses them is a Server Component and you can't pass down functions to a
 * client component unless they're Server Actions.
 */
export type TwitterComponents = {
  TweetNotFound?: typeof import('./tweet-not-found').TweetNotFound
  AvatarImg?: typeof import('./avatar-img').AvatarImg
  MediaImg?: typeof import('./media-img').MediaImg
}

/**
 * @deprecated Use `TwitterComponents` instead.
 */
export type TweetComponents = TwitterComponents
