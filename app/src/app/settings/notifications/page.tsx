// 【Next.js】URL: /settings/notifications
import Link from "next/link";

export default function NotificationSettingsPage() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>通知設定</h1>
      <p>通知の設定を変更できます。</p>
      <Link href="/settings">← 設定に戻る</Link>
    </div>
  );
}