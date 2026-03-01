import type { Metadata } from "next";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "React Training",
  description: "React + TypeScript の学習",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        {/* 【React】ThemeProvider で囲むと、配下のどのコンポーネントからでも
            useTheme() でテーマ情報にアクセスできる */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
