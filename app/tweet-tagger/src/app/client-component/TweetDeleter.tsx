"use client";

import { Button, Stack, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { redirect } from "next/navigation";
import { useState } from "react";

const TweetDeleter = ({ postId }: { postId: string }) => {

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const deletePost = async () => {
    const res = await fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
    });

    if (res.status === 200) {
      alert("ポストを削除しました");
      redirect('/posts');
    } else {
      alert("ポストの削除に失敗しました");
    }
  };

  return (
    <>
      <Button onClick={() => { setOpenConfirmDialog(true) }} variant="contained" color="error">削除</Button>
      <Dialog open={openConfirmDialog}>
        <DialogTitle>
          本当に削除しますか？
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} direction="row">
            <Button variant="contained" onClick={() => { setOpenConfirmDialog(false) }} color="primary">キャンセル</Button>
            <Button variant="contained" onClick={deletePost} color="error">削除</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TweetDeleter;
