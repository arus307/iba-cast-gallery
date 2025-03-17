import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "app/globals.css";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Roboto } from 'next/font/google';
import theme from 'theme';
import { GoogleAnalytics } from "@next/third-parties/google";
import { DataProvider } from "context/DataContext";
import getDbJsonString from "getDbJsonString";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IBA Cast Gallery",
  description: "Imaginary Base Akihabaraの写真付きツイートをまとめて見ることができるファンサイトです。",
};

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

const jsonString = await getDbJsonString();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${roboto.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DataProvider jsonString={jsonString}>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline>
                {children}
              </CssBaseline>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </DataProvider>
      </body>
      <GoogleAnalytics gaId="G-5LSG13J5E2" />
    </html>
  );
}
