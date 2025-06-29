"use client";

import NextTopLoader from "nextjs-toploader";
import { useTheme } from "@mui/material/styles";

export default function Loader() {

  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  return (
    <NextTopLoader
      color={primaryColor}
      initialPosition={0.08}
      crawlSpeed={200}
      height={3}
      crawl={true}
      showSpinner={true}
      easing="ease"
      speed={200}
    />
  );
}
