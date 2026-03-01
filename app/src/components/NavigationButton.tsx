"use client"; // useRouter は Client Component でのみ使用可能

// 【Next.js】useRouter は next/navigation から import
import { useRouter } from "next/navigation";

export default function NavigationButton() {
  // 【Next.js】useRouter でルーターオブジェクトを取得
  const router = useRouter();

  function handleGoToAbout() {
    router.push("/about"); // 指定ページに遷移
  }

  function handleGoBack() {
    router.back(); // ブラウザの「戻る」と同じ
  }

  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <button onClick={handleGoToAbout}>About ページへ</button>
      <button onClick={handleGoBack}>前のページに戻る</button>
    </div>
  );
}
