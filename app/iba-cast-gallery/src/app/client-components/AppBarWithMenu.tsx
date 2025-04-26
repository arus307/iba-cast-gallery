"use client";

import { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import {AppBar, Toolbar, IconButton, Typography, Link,Drawer, Box,List,ListItem, ListItemText, ListItemButton, Dialog,DialogTitle, DialogContent} from '@mui/material';
import { Hachi_Maru_Pop } from 'next/font/google';
import { ArrowBack } from '@mui/icons-material';

const hachiMaruPop = Hachi_Maru_Pop({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-hachi-maru-pop',
});

const CustomAppBar = () => {
    const [open, setOpen] = useState(false);

    const [openAboutDialog, setOpenAboutDialog] = useState(false);

    const onClickAbout = ()=>{
        setOpen(false);
        setOpenAboutDialog(true);
    };

    return (
        <AppBar position='static' id='back-to-top-anchor'>
            <Toolbar>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    onClick={()=>setOpen(true)}>
                    <MenuIcon />
                </IconButton>
                <Typography variant='h4' sx={{
                        fontFamily: `${hachiMaruPop.style.fontFamily}`,
                        py: 2,
                        px: 1,
                    }}>
                IBAぎゃらりー
                </Typography>

                <Drawer open={open} onClose={()=> setOpen(false)}>
                    <Box
                        sx={{ width: 250 }}>
                        <List>
                            <ListItem>
                                <ListItemButton onClick={() => setOpen(false)}>
                                    <ArrowBack />
                                    <ListItemText primary="戻る" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem>
                                <ListItemButton onClick={onClickAbout}>
                                    <ListItemText primary="このサイトについて" />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </Box>
                </Drawer>

                <Dialog open={openAboutDialog} onClose={()=>setOpenAboutDialog(false)}>
                    <DialogTitle>このサイトについて</DialogTitle>
                    <DialogContent>
                        <Typography sx={{mb:0.5}}>
                            このサイトは、IBA公式とは一切関係のないファンサイトです。
                        </Typography>
                        <Typography sx={{mb:0.5}}>
                            arus(<Link href="https://x.com/arus307" target='_blank' rel='noopener noreferrer'>@arus307</Link>)が勝手に開発しています。
                        </Typography>
                        <Typography>
                            タグ付けの誤りや反映されていないツイート、その他問題がありましたら<Link href="https://forms.gle/ATYKj4eXd3t8kJHB9" target='_blank' rel='noopener noreferrer'>お問い合わせフォーム</Link>もしくは上記のXアカウントまでご連絡ください。
                        </Typography>
                    </DialogContent>
                </Dialog>
            </Toolbar>
        </AppBar>
    );
};

export default CustomAppBar;