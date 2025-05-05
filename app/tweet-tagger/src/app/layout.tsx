import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import theme from '../theme';
import AuthSessionProviders from "./AuthSessionProvider"; // 作成したプロバイダーコンポーネント

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "いばぎゃらりー管理画面",
  description: "いばぎゃらりーの管理画面です",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthSessionProviders>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline>
                <div className="grid items-center justify-items-center min-h-screen p-8 sm:p-20">
                  <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
                    {children}
                  </main>
                </div>
              </CssBaseline>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </AuthSessionProviders>
      </body>
    </html>
  );
}
