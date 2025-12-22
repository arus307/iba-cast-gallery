import { Box, Link, Typography, Tooltip } from "@mui/material";

interface OshiMarkProps {
  oshiMark: string;
  dataTestId?: string;
}

/**
 * キャストの推しマーク(ファンマーク)を表示するコンポーネント
 * 
 * @param oshiMark - 推しマーク（絵文字）
 * @param dataTestId - テスト用のdata-testid属性
 */
const OshiMark: React.FC<OshiMarkProps> = ({ oshiMark, dataTestId }) => {
  // '-' の場合は何も表示しない
  if (oshiMark === '-') {
    return null;
  }

  // 公式の推しマーク一覧ツイートURL
  const officialTweetUrl = "https://x.com/iba_diary/status/1980613318734938476";

  return (
    <Box 
      component="span" 
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
      data-testid={dataTestId}
    >
      <Tooltip title="公式の推しマーク一覧を見る">
        <Link
          href={officialTweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ 
            textDecoration: 'none',
            '&:hover': { opacity: 0.7 }
          }}
          aria-label="公式の推しマーク一覧ツイートを新しいタブで開く"
        >
          <Typography 
            component="span" 
            sx={{ fontSize: '1.2em', lineHeight: 1 }}
          >
            {oshiMark}
          </Typography>
        </Link>
      </Tooltip>
    </Box>
  );
};

export default OshiMark;
