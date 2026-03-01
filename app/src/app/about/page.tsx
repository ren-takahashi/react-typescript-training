// 【Next.js】src/app/about/page.tsx → URL: /about
import Navigation from "@/components/Navigation";
import Link from "next/link";

export default function About() {
  return (
    <div style={{ padding: "16px" }}>

    {/* 【Next.js】現在地をハイライトするナビゲーション */}
    <Navigation />
      <h1>About</h1>
      <p>このアプリは React + TypeScript + Next.js の学習用です。</p>

      <h2>使用技術</h2>
      <ul>
        <li>Next.js（フレームワーク）</li>
        <li>React（UIライブラリ）</li>
        <li>TypeScript（型付き言語）</li>
      </ul>

      {/* 【Next.js】Link でトップページに戻る */}
      <Link href="/">← ホーム戻る</Link>
    </div>
  );
}
