"use client";
// 自作の useTheme フックで Context の値を取得
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeButton() {
  // 【React】useContext（useTheme の中で使っている）
  // Props を経由せずに、テーマ情報に直接アクセスできる！
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: "8px 16px",
        backgroundColor: theme === "light" ? "#fff" : "#333",
        color: theme === "light" ? "#333" : "#fff",
        border: "1px solid #ccc",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      現在: {theme === "light" ? "☀️ ライト" : "🌙 ダーク"} モード（クリックで切替）
    </button>
  );
}
