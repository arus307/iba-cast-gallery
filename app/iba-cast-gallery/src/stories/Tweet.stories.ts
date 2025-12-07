import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tweet } from "../components/tweet/swr";

// 1. Meta設定：このコンポーネントの基本情報
const meta = {
  title: "Components/Tweet", // Storybookのサイドバーでの表示名
  component: Tweet, // どのコンポーネントの話？
  tags: ["autodocs"], // ドキュメントを自動生成してくれる魔法のタグ
  parameters: {
    layout: "centered", // 真ん中に表示する？ 'fullscreen' もあるよ
  },
} satisfies Meta<typeof Tweet>;

export default meta;
type Story = StoryObj<typeof meta>;

// 2. ストーリー定義：実際の表示パターン
// "Primary" という名前のパターン
export const Primary: Story = {
  args: {
    id: "1980472013727887757",
    taggedCasts: [
      {
        order: 1,
        cast: {
          id: 1,
          name: "キャスト名",
          type: 1,
          introduceTweetId: "",
          enName: "enCastName",
          taggedPosts: [],
        },
      },
    ],
  },
};
