import SimpleUserForm from "@/components/SimpleUserForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div style={{ padding: "16px" }}>
      <SimpleUserForm />
      
      <div style={{ marginTop: "24px", maxWidth: "500px" }}>
        <h3>💡 FormField のメリット</h3>
        <ul style={{ fontSize: "14px", color: "#666" }}>
          <li>入力フィールドの見た目が統一される</li>
          <li>エラー表示のロジックが共通化される</li>
          <li>コードの重複が減り、メンテナンスしやすい</li>
          <li>プロジェクト全体で一貫したUI/UX</li>
        </ul>
      </div>

      <div style={{ marginTop: "16px" }}>
        <Link href="/">← ホームに戻る</Link>
      </div>
    </div>
  );
}