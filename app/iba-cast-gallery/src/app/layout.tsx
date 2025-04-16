import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "app/globals.css";
import { AppBar, CssBaseline, Typography } from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Roboto, Hachi_Maru_Pop } from 'next/font/google';
import theme from 'theme';
import { GoogleAnalytics } from "@next/third-parties/google";
import ScrollToTopButton from "./client-components/ScrollToTopButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IBA gallery",
  description: "Imaginary Base Akihabaraの写真付きツイートをまとめて見ることができるファンサイトです。",
};

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

const hachiMaruPop = Hachi_Maru_Pop({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-hachi-maru-pop',
});


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
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline>
                <>
                  <AppBar position='static' id='back-to-top-anchor'>
                    <Typography variant='h4' sx={{
                    fontFamily: `${hachiMaruPop.style.fontFamily}`,
                    p: 2,
                  }}>
                      IBAぎゃらりー
                    </Typography>
                  </AppBar>
                  {children}
                  <ScrollToTopButton />
                </>
              </CssBaseline>
            </ThemeProvider>
          </AppRouterCacheProvider>
      </body>
      <GoogleAnalytics gaId="G-5LSG13J5E2" />
    </html>
  );
}
