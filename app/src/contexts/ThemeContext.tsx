"use client";
// 【React】createContext で Context（データの配信チャンネル）を作る
import { createContext, useContext, useState } from "react";

// 【TypeScript】Context で共有するデータの型
type ThemeContextType = {
  theme: "light" | "dark";
  toggleTheme: () => void;
};

// 【React】Context オブジェクトを作成
// 初期値は undefined にしておき、Provider で実際の値を渡す
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 【React】Provider コンポーネント（データを配信する側）
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  return (
    // value に渡したデータが、配下のすべてのコンポーネントで使える
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 【React】カスタムフック: useContext をラップして使いやすくする
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
