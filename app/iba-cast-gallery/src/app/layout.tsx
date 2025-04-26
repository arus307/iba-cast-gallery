import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "app/globals.css";
import { CssBaseline, Typography, Stack, Link } from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Roboto, Hachi_Maru_Pop } from 'next/font/google';
import theme from 'theme';
import { GoogleAnalytics } from "@next/third-parties/google";
import ScrollToTopButton from "./client-components/ScrollToTopButton";
import AppBar from "./client-components/AppBar";

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
                  <AppBar/>
                  <div className="grid items-center justify-items-center min-h-screen p-8 sm:p-20">
                    {children}
                    <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
                      <Stack direction="column" spacing={0.5} sx={{marginTop:4}} alignItems="center">
                        <Typography variant="h6">
                          このサイトは、IBA公式とは一切関係のないファンサイトです。
                        </Typography>
                        <Typography variant="subtitle2">
                          arus(<Link href="https://x.com/arus307" target='_blank' rel='noopener noreferrer'>@arus307</Link>)が勝手に開発しています。
                        </Typography>
                        <Typography variant="subtitle2">
                            タグ付けの誤りや反映されていないツイート、その他問題がありましたら<Link href="https://forms.gle/ATYKj4eXd3t8kJHB9" target='_blank' rel='noopener noreferrer'>お問い合わせフォーム</Link>もしくは上記のXアカウントまでご連絡ください。
                        </Typography>
                        </Stack>
                    </footer>
                  </div>
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
