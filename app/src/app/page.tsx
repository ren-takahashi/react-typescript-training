// 【Next.js】src/app/page.tsx → URL: /
import Link from "next/link"; // 【Next.js】ページ遷移用コンポーネント
import NavigationButton from "../components/NavigationButton";
import Navigation from "../components/Navigation"; // 追加

export default function Home() {
  return (
    <div>
      {/* 【Next.js】現在地をハイライトするナビゲーション */}
      <Navigation />
      
      <div style={{ padding: "16px" }}>
        <h1>ホーム</h1>
        <p>Next.js のルーティングを学習中です。</p>

        {/* 【Next.js】useRouter を使ったナビゲーションボタン */}
        <div style={{ marginTop: "16px" }}>
          <h3>プログラムによる遷移</h3>
          <NavigationButton />
        </div>

        <nav style={{ marginTop: "16px" }}>
          <h2>ページ一覧</h2>
          <ul>
            {/* 【Next.js】Link コンポーネントでページ遷移 */}
            <li><Link href="/about">About ページ</Link></li>
            <li><Link href="/users">ユーザー一覧</Link></li>
            <li><Link href="/settings">設定</Link></li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
