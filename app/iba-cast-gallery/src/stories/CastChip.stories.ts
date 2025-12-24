import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CastChip from "../components/CastChip";

const meta = {
  title: "Components/CastChip",
  component: CastChip,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof CastChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Diamond: Story = {
  args: {
    cast: {
      id: 1,
      name: "ダイヤモンド",
      type: 1,
      introduceTweetId: "",
      enName: "diamond",
      fanMark: "-",
      taggedPosts: [],
    },
  },
};
