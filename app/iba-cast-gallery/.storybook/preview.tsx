import type { Preview, Decorator } from "@storybook/react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "../src/theme";

// テーマを提供するDecoratorコンポーネント
const withMuiTheme: Decorator = (Story) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Story />
    </ThemeProvider>
  );
};

const preview: Preview = {
  decorators: [withMuiTheme],
};

export default preview;
