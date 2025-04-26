"use client";

import { useState } from "react";
import { Drawer, Box, List, ListItem, ListItemButton, ListItemText, } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import AboutDialog from "./AboutDialog";

interface MenuDrawerProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

/**
 * メニュードロワー
 */
const MenuDrawer = ({open, setOpen}:MenuDrawerProps) => {
    const [openAboutDialog, setOpenAboutDialog] = useState(false);
    const onClickAbout = ()=>{
        setOpen(false);
        setOpenAboutDialog(true);
    };

    return(
        <>
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
            <AboutDialog open={openAboutDialog} setOpenDialog={setOpenAboutDialog} />
        </>
    );
}

export default MenuDrawer;
