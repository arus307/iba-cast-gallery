import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "app/globals.css";
import { CssBaseline, Typography, Stack, Link} from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Roboto } from 'next/font/google';
import theme from 'theme';
import { GoogleAnalytics } from "@next/third-parties/google";

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
                <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
                  <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
                    {children}
                  </main>
                  <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
                  <Stack direction="column" spacing={0.5} alignItems="center">
                    <Typography variant="h6">
                      このサイトは、IBA公式とは一切関係のないファンサイトです。
                    </Typography>
                    <Typography variant="subtitle2">
                      タグ付けの誤りや反映されていないツイート、その他の問題がある場合はarus(X:<Link href="https://x.com/arus307" target='_blank' rel='noopener noreferrer'>@arus307</Link>)までご連絡ください。
                    </Typography>
                  </Stack>
                </footer>
                </div>
              </CssBaseline>
            </ThemeProvider>
          </AppRouterCacheProvider>
      </body>
      <GoogleAnalytics gaId="G-5LSG13J5E2" />
    </html>
  );
}
