// 【Next.js】src/app/settings/page.tsx → URL: /settings
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>設定</h1>

      <ul>
        <li><Link href="/settings/profile">プロフィール設定</Link></li>
        <li><Link href="/settings/notifications">通知設定</Link></li>
      </ul>

      <Link href="/">← ホームに戻る</Link>
    </div>
  );
}
