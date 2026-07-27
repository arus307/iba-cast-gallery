"use client";

import { Button, Stack, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TweetDeleter = ({ postId }: { postId: string }) => {

  const router = useRouter();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const deletePost = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (res.status === 200) {
        alert("ポストを削除しました");
        router.push('/posts');
        router.refresh();
        return;
      }

      alert("ポストの削除に失敗しました");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("ポストの削除に失敗しました");
    } finally {
      setDeleting(false);
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
            <Button
              variant="contained"
              onClick={() => { setOpenConfirmDialog(false) }}
              color="primary"
              disabled={deleting}
            >
              キャンセル
            </Button>
            <Button
              variant="contained"
              onClick={deletePost}
              color="error"
              disabled={deleting}
              loading={deleting}
              loadingPosition="start"
              data-testid="tweet-delete-confirm-button"
            >
              {deleting ? "削除中..." : "削除"}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TweetDeleter;
