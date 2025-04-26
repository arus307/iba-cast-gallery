"use client";

import { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import {AppBar as MUIAppBar, Toolbar, IconButton, Typography} from '@mui/material';
import { Hachi_Maru_Pop } from 'next/font/google';
import MenuDrawer from './MenuDrawer';

const hachiMaruPop = Hachi_Maru_Pop({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-hachi-maru-pop',
});

const AppBar = () => {
    const [openMenu, setOpenMenu] = useState(false);
    return (
        <>
            <MUIAppBar position='static' id='back-to-top-anchor'>
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={()=>setOpenMenu(true)}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant='h4' sx={{
                            fontFamily: `${hachiMaruPop.style.fontFamily}`,
                            py: 2,
                            px: 1,
                        }}>
                    IBAぎゃらりー
                    </Typography>
                </Toolbar>
            </MUIAppBar>
            <MenuDrawer open={openMenu} setOpen={setOpenMenu} />
        </>
    );
};

export default AppBar;
