import type { Metadata } from "next";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Todo App",
  description: "React + TypeScript + Next.js 学習用 Todo アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, fontFamily: "sans-serif" }}>

        {/* ヘッダーコンポーネントの表示 */}
        <Header />

        {/* メインコンテンツ（app/page.tsxの内容がchildren部分に表示される） */}
        <main style={{ maxWidth: "720px", margin: "0 auto", padding: "24px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
