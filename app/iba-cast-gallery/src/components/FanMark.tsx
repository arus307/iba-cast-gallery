"use client";

import { useState } from "react";
import { Box, Link, Typography, Tooltip, Alert, Snackbar, IconButton } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LaunchIcon from "@mui/icons-material/Launch";

interface FanMarkProps {
  fanMark: string;
  dataTestId?: string;
}

/**
 * キャストの推しマーク(ファンマーク)を表示するコンポーネント
 * 
 * @param fanMark - 推しマーク（絵文字）
 * @param dataTestId - テスト用のdata-testid属性
 */
const FanMark: React.FC<FanMarkProps> = ({ fanMark, dataTestId }) => {
  const [alertState, setAlertState] = useState<'idle' | 'success' | 'error'>('idle');

  // '-' の場合は何も表示しない
  if (fanMark === '-') {
    return null;
  }

  // 公式の推しマーク一覧ツイートURL
  const officialTweetUrl = "https://x.com/iba_diary/status/1980613318734938476";

  // ファンマークをクリップボードにコピー
  const handleCopyFanMark = async () => {
    // クリップボードAPIが利用可能かチェック
    if (!navigator.clipboard) {
      console.error('クリップボードAPIが利用できません');
      setAlertState('error');
      return;
    }

    try {
      await navigator.clipboard.writeText(fanMark);
      setAlertState('success');
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err);
      setAlertState('error');
    }
  };

  return (
    <Box 
      component="span" 
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
      data-testid={dataTestId}
    >
      <Tooltip title="ファンマークをコピー">
        <IconButton
          onClick={handleCopyFanMark}
          size="small"
          sx={{ 
            padding: 0.5,
            '&:hover': { opacity: 0.7 }
          }}
          aria-label="ファンマークをクリップボードにコピー"
          data-testid={dataTestId ? `${dataTestId}-copy-button` : undefined}
        >
          <Typography 
            component="span" 
            sx={{ fontSize: '1.2em', lineHeight: 1, marginRight: 0.5 }}
          >
            {fanMark}
          </Typography>
          <ContentCopyIcon sx={{ fontSize: '0.8em' }} />
        </IconButton>
      </Tooltip>

      <Link
        href={officialTweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ 
          textDecoration: 'none',
          fontSize: '0.8em',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.25,
          '&:hover': { opacity: 0.7 }
        }}
        aria-label="公式の推しマーク一覧ツイートを新しいタブで開く"
        data-testid={dataTestId ? `${dataTestId}-official-link` : undefined}
      >
        公式
        <LaunchIcon sx={{ fontSize: '1em' }} />
      </Link>

      <Snackbar
        open={alertState !== 'idle'}
        autoHideDuration={3000}
        onClose={() => setAlertState('idle')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setAlertState('idle')} 
          severity={alertState === 'error' ? "error" : "success"}
          sx={{ width: '100%' }}
        >
          {alertState === 'error' ? 'クリップボードへのコピーに失敗しました' : 'ファンマークをコピーしました'}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FanMark;
