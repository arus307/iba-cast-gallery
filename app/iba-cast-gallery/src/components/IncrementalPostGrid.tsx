"use client";

import { Box, Button, Grid } from "@mui/material";
import {
  type ComponentProps,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const INITIAL_POST_COUNT = 9;
const POST_BATCH_SIZE = 6;

type IncrementalPostGridProps<T> = {
  items: T[];
  getItemKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  itemSize: ComponentProps<typeof Grid>["size"];
};

/**
 * 一覧のカードを段階的にマウントする。
 * 未表示のポストは Tweet API や画像のリクエストを開始しないため、初期表示の通信量を抑えられる。
 */
export default function IncrementalPostGrid<T>({
  items,
  getItemKey,
  renderItem,
  itemSize,
}: IncrementalPostGridProps<T>) {
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(INITIAL_POST_COUNT, items.length),
  );
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const hasMore = visibleCount < items.length;

  useEffect(() => {
    setVisibleCount(Math.min(INITIAL_POST_COUNT, items.length));
  }, [items]);

  const loadMore = useCallback(() => {
    setVisibleCount((current) =>
      Math.min(current + POST_BATCH_SIZE, items.length),
    );
  }, [items.length]);

  useEffect(() => {
    if (!hasMore || typeof IntersectionObserver === "undefined") {
      return;
    }

    const target = loadMoreRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <>
      <Grid container spacing={2} className="w-full">
        {items.slice(0, visibleCount).map((item) => (
          <Grid key={getItemKey(item)} size={itemSize}>
            {renderItem(item)}
          </Grid>
        ))}
      </Grid>
      {hasMore && (
        <Box
          ref={loadMoreRef}
          data-testid="post-load-more"
          sx={{ display: "flex", justifyContent: "center", py: 3 }}
        >
          <Button onClick={loadMore} variant="outlined">
            さらに表示
          </Button>
        </Box>
      )}
    </>
  );
}
