import ToggleExample from "@/components/ToggleExample";
import Link from "next/link";

export default function ToggleDemoPage() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>useToggle デモ</h1>
      <ToggleExample />
      <div style={{ marginTop: "16px" }}>
        <Link href="/">← ホームに戻る</Link>
      </div>
    </div>
  );
}