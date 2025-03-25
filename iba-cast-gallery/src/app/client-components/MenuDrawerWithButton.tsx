"use client";

import { Button,List, IconButton, Drawer, ListItem, Box } from '@mui/material';
import {useState} from 'react';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import Link from 'next/link';

const MenuDrawerWithButton = ({casts}:{casts:Cast[]})=>{

    const [open, setOpen] = useState(false);

    // TODO キャストのメニューRC/ICで分けてCollapseにする
    // ドロワー内のレイアウト調整

    return (
        <>
            <IconButton onClick={()=>setOpen(true)}>
                <MenuRoundedIcon />
            </IconButton>
            <Drawer open={open} onClose={()=>setOpen(false)}>
                <Box sx={{width: 250}}>
                    <ListItem onClick={()=>setOpen(false)}>
                        <Link href="/">トップ</Link>
                    </ListItem>
                    <ListItem onClick={()=>setOpen(false)}>
                        <Link href="/casts">キャストさん一覧</Link>
                    </ListItem>
                    
                    <List disablePadding>
                        {
                            casts.map((cast)=>(
                                <ListItem key={cast.id} sx={{ pl: 4 }}>
                                    <Link href={`/casts/${cast.type}/${cast.enName}`}>{cast.name}</Link>
                                </ListItem>
                            ))
                        }
                    </List>
                </Box>
            </Drawer>
        </>
    );
};

export default MenuDrawerWithButton;