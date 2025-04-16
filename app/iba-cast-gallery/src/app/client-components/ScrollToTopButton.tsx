"use client";

import { Box, Fab, Fade, useScrollTrigger } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';

/**
 * ページトップまでスクロールするボタン
 * ※layoutに配置されているAppBarのidを元にスクロールする
 */
export default function ScrollToTopButton() {

    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 100,
      });
    
      const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const anchor = (
          (event.target as HTMLDivElement).ownerDocument || document
        ).querySelector('#back-to-top-anchor');
    
        if (anchor) {
          anchor.scrollIntoView({
            block: 'center',
            behavior: 'smooth',
          });
        }
      };

    return (
        <Fade in={trigger}>
            <Box
                onClick={handleClick}
                role="presentation"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
            >
                <Fab size="small" aria-label="トップにスクロール">
                    <KeyboardArrowUp />
                </Fab>
            </Box>
        </Fade>
    );
}