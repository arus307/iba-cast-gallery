"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Drawer, Box, List, ListItem, ListItemButton, ListItemText, Collapse, } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import AboutDialog from "./AboutDialog";
import { useRouter } from "next/navigation";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import useSWR from "swr";
import { getActiveCastsAction } from "../actions";

interface MenuDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

/**
 * メニュードロワー
 */
const MenuDrawer = ({ open, setOpen }: MenuDrawerProps) => {

    const { status } = useSession();
    const router = useRouter();

    const [openAboutDialog, setOpenAboutDialog] = useState(false);
    const onClickAbout = () => {
        setOpen(false);
        setOpenAboutDialog(true);
    };

    const onClickLogin = () => {
        signIn("discord")
    }

    const onClickFavorites = () => {
        router.push("/favorites");
    }

    const onClickLogout = () => {
        signOut();
    }

    const [isOpenCastList, setIsOpenCastList] = useState(false);
    const toggleCastList = () => {
      setIsOpenCastList(!isOpenCastList);
    };

    const {data: casts, error, isLoading } = useSWR('all-active-casts', getActiveCastsAction);


    return (
        <>
            <Drawer open={open} onClose={() => setOpen(false)}>
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

                        <ListItem>
                            <ListItemButton onClick={toggleCastList}>
                            <ListItemText primary="キャスト一覧" />
                            {isOpenCastList ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                        </ListItem>
                        <Collapse in={isOpenCastList}>
                            <List component="div" disablePadding>
                            {isLoading && <ListItemText primary="読み込み中..." />}
                            {error && <ListItemText primary="キャストの取得に失敗しました" />}
                            {
                                casts && casts.map((cast) => (
                                <ListItem key={cast.id}>
                                    <ListItemButton href={`/casts/${cast.enName}`} sx={{ pl: 4 }}>
                                    <ListItemText primary={cast.name} />
                                    </ListItemButton>
                                </ListItem>
                                ))}
                            </List>
                        </Collapse>

                        {status === "authenticated" && (
                            <ListItem>
                                <ListItemButton onClick={onClickFavorites}>
                                    <ListItemText primary="お気に入り" />
                                </ListItemButton>
                            </ListItem>

                        )}
                        {status === "authenticated" && (
                            <ListItem>
                                <ListItemButton onClick={onClickLogout}>
                                    <ListItemText primary="ログアウト" />
                                </ListItemButton>
                            </ListItem>
                        )}
                        {status === "unauthenticated" && (
                            <ListItem>
                                <ListItemButton onClick={onClickLogin}>
                                    <ListItemText primary="ログイン" />
                                </ListItemButton>
                            </ListItem>
                        )}
                    </List>
                </Box>
            </Drawer>
            <AboutDialog open={openAboutDialog} setOpenDialog={setOpenAboutDialog} />
        </>
    );
}

export default MenuDrawer;
