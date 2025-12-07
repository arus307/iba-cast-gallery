import {
  Button,
  IconButton,
  Popover,
  Typography,
  Link,
  Snackbar,
  Alert,
} from "@mui/material";
import { Star, StarBorderOutlined } from "@mui/icons-material";
import { yellow } from "@mui/material/colors";
import { useState, useEffect } from "react";
import { addFavoritePostAction, deleteFavoritePostAction } from "app/actions";
import { useFavoritePostIds } from "app/client-components/FavoritePostIdsProvider";
import { useSession } from "next-auth/react";

const FavoriteButton = ({ tweetId }: { tweetId: string }) => {
  const {
    favoritePostIds,
    addFavorite: addFavoriteContext,
    removeFavorite: removeFavoriteContext,
    isLoading,
  } = useFavoritePostIds();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const { data: session } = useSession();

  // ポップオーバーの状態管理
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const openPopover = Boolean(anchorEl);

  // Snackbarの状態管理
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "info">(
    "success"
  );

  useEffect(() => {
    if (!isLoading) {
      setIsFavorite(favoritePostIds.includes(tweetId));
    }
  }, [favoritePostIds, isLoading, tweetId]);

  const addFavorite = () => {
    addFavoritePostAction(tweetId);
    addFavoriteContext(tweetId);
    setSnackbarMessage("お気に入りに追加しました");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const deleteFavorite = () => {
    deleteFavoritePostAction(tweetId);
    removeFavoriteContext(tweetId);
    setSnackbarMessage("お気に入りから削除しました");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };

  const handleFavoriteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!session?.user) {
      // ログインしていない場合はポップオーバーを表示
      setAnchorEl(event.currentTarget);
      return;
    }

    // ログインしている場合は通常のお気に入り処理
    if (isFavorite) {
      deleteFavorite();
    } else {
      addFavorite();
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <IconButton
        aria-label={isFavorite ? "unfavorite" : "favorite"}
        onClick={handleFavoriteClick}
      >
        {isFavorite ? (
          <Star sx={{ color: yellow[500] }} />
        ) : (
          <StarBorderOutlined color="action" />
        )}
      </IconButton>
      <Popover
        open={openPopover}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <div style={{ padding: "16px", maxWidth: "300px" }}>
          <Typography variant="body1" gutterBottom>
            お気に入り機能を使用するにはログインが必要です
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Discordアカウントでログインしてください
          </Typography>
          <Link href="/api/auth/signin" underline="none">
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 1 }}
            >
              ログイン
            </Button>
          </Link>
        </div>
      </Popover>

      {/* 登録・削除完了を通知するSnackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FavoriteButton;
