import { Fragment } from 'react'
import clsx from 'clsx'
import {
  type EnrichedTweet,
  type EnrichedQuotedTweet,
  getMediaUrl,
} from '../utils'
import { MediaDetails } from '../api/index'
import type { TwitterComponents } from './types'
import { TweetMediaVideo } from './tweet-media-video'
import { MediaImg } from './media-img'
import s from './tweet-media.module.css'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import 'react-photo-view/dist/react-photo-view.css';
import { Grid2, Chip, Tooltip, Typography, Paper } from '@mui/material'

const getSkeletonStyle = (media: MediaDetails, itemCount: number) => {
  let paddingBottom = 56.25 // default of 16x9

  // if we only have 1 item, show at original ratio
  if (itemCount === 1)
    paddingBottom =
      (100 / media.original_info.width) * media.original_info.height

  // if we have 2 items, double the default to be 16x9 total
  if (itemCount === 2) paddingBottom = paddingBottom * 2

  return {
    width: media.type === 'photo' ? undefined : 'unset',
    paddingBottom: `${paddingBottom}%`,
  }
}

type Props = {
  tweet: EnrichedTweet | EnrichedQuotedTweet
  components?: TwitterComponents
  quoted?: boolean
}

export const TweetMedia = ({ tweet, components, quoted }: Props) => {
  const length = tweet.mediaDetails?.length ?? 0
  const Img = components?.MediaImg ?? MediaImg

  return (
    <div className={clsx(s.root, !quoted && s.rounded)}>
      <div
        className={clsx(
          s.mediaWrapper,
          length > 1 && s.grid2Columns,
          length === 3 && s.grid3,
          length > 4 && s.grid2x2
        )}
      >
        <PhotoProvider overlayRender={({ images, index }) => {
          const media = tweet.mediaDetails?.at(index);
          if(!media || media.type !== 'photo' || !media.ext_alt_text) return null;
          return (
          <Paper sx={{position:'absolute', bottom:0, p:3, zIndex:10, bgcolor: `rgba(0, 0, 0, 0.6)`, width:'100%'}}>
            {
              media.ext_alt_text && (
                <Typography>{media.ext_alt_text}</Typography>
              )
            }
          </Paper>
        )}}>
          {tweet.mediaDetails?.map((media) => (
            <Fragment key={media.media_url_https}>
              {media.type === 'photo' ? (
                <div className={clsx(s.mediaContainer, s.mediaLink)}>
                  <div
                    className={s.skeleton}
                    style={getSkeletonStyle(media, length)}
                  />
                  <PhotoView src={getMediaUrl(media,'large')}>
                    <Img
                      src={getMediaUrl(media, 'small')}
                      alt={media.ext_alt_text || 'Image'}
                      className={s.image}
                      draggable
                    />
                  </PhotoView>
                  {
                    media.ext_alt_text && (
                      <Tooltip
                        title={media.ext_alt_text}
                        placement="top"
                        componentsProps={{
                          tooltip: {
                            sx: {
                              bgcolor: 'background.paper',
                              color: 'text.primary',
                              fontSize: '0.8rem',
                            },
                          },
                        }}
                      >
                        <Chip
                          label="ALT"
                          size="small"
                          sx={{
                            height:'20px',
                            borderRadius: 1,
                            bgcolor: 'background.paper',
                            opacity:0.8,
                            zIndex:1,
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            m:1,
                            '& .MuiChip-label': {
                              px: 0.5,
                            },
                          }}/>
                      </Tooltip> 
                    )
                  }
                </div>
              ) : (
                <div key={media.media_url_https} className={s.mediaContainer}>
                  <div
                    className={s.skeleton}
                    style={getSkeletonStyle(media, length)}
                  />
                  <TweetMediaVideo tweet={tweet} media={media} />
                </div>
              )}
            </Fragment>
          ))}
        </PhotoProvider>
      </div>
    </div>
  )
}
