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
import {Button, Stack, Grid2, IconButton, Popover, Typography, Link, Snackbar, Alert} from '@mui/material'
import CastChip from 'components/CastChip'
import { CastDto } from '@iba-cast-gallery/types'
import { Star, StarBorderOutlined } from '@mui/icons-material'
import { yellow } from '@mui/material/colors';
import { addFavoritePostAction, deleteFavoritePostAction } from 'app/actions'
import { useFavoritePostIds } from 'app/client-components/FavoritePostIdsProvider'
import { useSession } from 'next-auth/react'

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
  const { data: session } = useSession();
  
  // ポップオーバーの状態管理
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const openPopover = Boolean(anchorEl);

  // Snackbarの状態管理
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info'>('success');

  useEffect(() => {
    if (!isLoading) {
      setIsFavorite(favoritePostIds.includes(tweet.id_str));
    }
  }, [favoritePostIds, isLoading, tweet.id_str]);


  const addFavorite = ()=>{
    addFavoritePostAction(tweet.id_str);
    addFavoriteContext(tweet.id_str);
    setSnackbarMessage('お気に入りに追加しました');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const deleteFavorite = ()=>{
    deleteFavoritePostAction(tweet.id_str);
    removeFavoriteContext(tweet.id_str);
    setSnackbarMessage('お気に入りから削除しました');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const handleFavoriteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!session?.user) {
      // ログインしていない場合はポップオーバーを表示
      setAnchorEl(event.currentTarget);
      return;
    }

    // ログインしている場合は通常のお気に入り処理
    if (isFavorite) {
      deleteFavorite();
    } else {
      addFavorite();
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
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
          <IconButton 
            aria-label={isFavorite ? "unfavorite" : "favorite"} 
            onClick={handleFavoriteClick}
          >
            {isFavorite ? (
              <Star sx={{ color: yellow[500] }} />
            ) : (
              <StarBorderOutlined color="action"/>
            )}
          </IconButton>
          <Popover
            open={openPopover}
            anchorEl={anchorEl}
            onClose={handlePopoverClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
          >
            <div style={{ padding: '16px', maxWidth: '300px' }}>
              <Typography variant="body1" gutterBottom>
                お気に入り機能を使用するにはログインが必要です
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Discordアカウントでログインしてください
              </Typography>
              <Link href="/api/auth/signin" underline="none">
                <Button variant="contained" color="primary" fullWidth sx={{ mt: 1 }}>
                  ログイン
                </Button>
              </Link>
            </div>
          </Popover>
        </Grid2>
        <Grid2>
          <Button size="small" variant="outlined" onClick={()=>setDisplayTweet(!displayTweet)}>{displayTweet ? '画像のみ表示' : '詳細表示'}</Button>
        </Grid2>
      </Grid2>

      {/* 登録・削除完了を通知するSnackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </TweetContainer>
  )
}
