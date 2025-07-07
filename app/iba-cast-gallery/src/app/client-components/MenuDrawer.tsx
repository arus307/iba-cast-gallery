"use client";

import { useState } from "react";
import { Drawer, List, ListItem, ListItemButton, ListItemText, Collapse, } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import AboutDialog from "./AboutDialog";
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
  const [openAboutDialog, setOpenAboutDialog] = useState(false);
  const onClickAbout = () => {
    setOpen(false);
    setOpenAboutDialog(true);
  };

  const [isOpenCastList, setIsOpenCastList] = useState(false);
  const toggleCastList = () => {
    setIsOpenCastList(!isOpenCastList);
  };

  const {data: casts, error, isLoading } = useSWR('all-active-casts', getActiveCastsAction);

  return (
    <>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <List sx={{ width: 250 }}>
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

        </List>
      </Drawer>
      <AboutDialog open={openAboutDialog} setOpenDialog={setOpenAboutDialog} />
    </>
  );
}

export default MenuDrawer;
