# Chapter 07: その他の主要 Hooks（useRef / useMemo / useCallback / useContext）

## この章のゴール

- `useRef` で DOM 要素にアクセスする方法を理解する
- `useMemo` / `useCallback` でパフォーマンスを最適化する方法を理解する
- `useContext` で Props Drilling を解決する方法を理解する

## この章で扱う技術

| タグ | 内容 |
|------|------|
| `【React】` | useRef, useMemo, useCallback, useContext, createContext |
| `【TypeScript】` | ジェネリクス（各 Hook の型引数） |
| `【Next.js】` | `"use client"`（すべて Client Component で使用） |

---

## 7-1. useRef 【React】

`useRef` は **再レンダリングをトリガーしない「値の保管箱」** です。  
主に以下の 2 つの用途で使います。

### 用途 1: DOM 要素にアクセスする

**ファイル: `src/components/FocusInput.tsx`**（新規作成）

```tsx
"use client";
import { useRef } from "react";

export default function FocusInput() {
  // 【React】useRef で DOM 要素への参照を作る
  // 【TypeScript】HTMLInputElement 型を指定し、初期値は null
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFocus() {
    // .current で実際の DOM 要素にアクセスできる
    inputRef.current?.focus(); // 入力欄にフォーカスを当てる
  }

  function handleClear() {
    if (inputRef.current) {
      inputRef.current.value = ""; // 入力値をクリア
      inputRef.current.focus();
    }
  }

  return (
    <div style={{ padding: "16px" }}>
      <h3>useRef: DOM アクセス</h3>
      {/* ref 属性で DOM 要素と useRef を紐付ける */}
      <input ref={inputRef} type="text" placeholder="ここに入力..." style={{ padding: "8px" }} />
      <button onClick={handleFocus}>フォーカス</button>
      <button onClick={handleClear}>クリア</button>
    </div>
  );
}
```

**ファイル: `src/app/page.tsx`**（更新）

```tsx
import FocusInput from "@/components/FocusInput";

export default function Home() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>useRef の学習</h1>
      <FocusInput />
    </div>
  );
}
```

### 用途 2: 再レンダリングしたくない値を保持する

`useState` と違い、`useRef` の値を変更しても **再レンダリングが起こりません**。

**ファイル: `src/components/RenderCounter.tsx`**（新規作成）

```tsx
"use client";
import { useRef, useState, useEffect } from "react";

export default function RenderCounter() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");
  
  // 【React】レンダリング回数をカウント
  // useStateと違い、useRefは値が変わっても再レンダリングしない
  const renderCount = useRef(0);

  useEffect(() => {
    // useEffect は、count や text が変わるたびに実行される（レンダリングの後に走る）

    // ↓ このインクリメント自体は再レンダリングを起こさないが、
    // 他の理由（count や text の変更）で再レンダリングが起きた時にuseEffectが走るので
    // この値が更新され、画面に反映される。
    renderCount.current += 1;
    console.log("レンダリングが発生しました！回数:", renderCount.current);
  });

  return (
    <div style={{ padding: "16px", border: "2px solid #ddd", borderRadius: "8px" }}>
      <h3>useRef: 値の保持</h3>
      <p><strong>カウント: {count}</strong></p>
      <p><strong>レンダリング回数: {renderCount.current}</strong></p>
      
      <button onClick={() => setCount(count + 1)}>カウント +1</button>
      
      <div style={{ marginTop: "16px" }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}  /* ← これが再レンダリングを起こす */
          placeholder="ここに入力してみて..."
          style={{ padding: "8px", width: "250px" }}
        />
        <p style={{ fontSize: "14px", color: "#666" }}>入力値: {text}</p>
      </div>
      
      <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#000", borderRadius: "4px", fontSize: "14px" }}>
        <p><strong>確認ポイント:</strong></p>
        <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
          <li><code>setText()</code> や <code>setCount()</code> が再レンダリングを起こす（useState の特徴）</li>
          <li>再レンダリング後に <code>useEffect</code> が実行され、<code>renderCount.current</code> が増える</li>
          <li><strong>重要:</strong> <code>renderCount.current += 1</code> 自体は再レンダリングを起こさない</li>
          <li>もし <code>renderCount</code> を useState で管理したら、値を変えるたびに再レンダリングが起きて無限ループになる</li>
        </ul>
      </div>
    </div>
  );
}
```

**ファイル: `src/app/page.tsx`**（更新）

```tsx
import FocusInput from "@/components/FocusInput";
import RenderCounter from "@/components/RenderCounter";

export default function Home() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>useRef の学習</h1>
      <FocusInput />
      <RenderCounter />
    </div>
  );
}
```

### useRef の動作を理解する

上のコードで何が起きているか、順を追って説明します：

#### 1. テキスト入力で何が起きるか

```
あなたが "A" と入力
  → setText("A") が実行される（useState）
  → setText() が再レンダリングを起こす ✅ ← ここが原因！
  → 再レンダリング後に useEffect が実行される
  → renderCount.current が 1 → 2 になる
  → でも renderCount.current += 1 自体は再レンダリングを起こさない ❌
  → すでに再レンダリングが起きているので、画面に「レンダリング回数: 2」と表示される
```

**重要：** 画面の数字が増えるのは、`renderCount.current += 1` のせいではなく、  
`setText()` が再レンダリングを起こしたから！

#### 2. もし renderCount を useState にしたらどうなる？

```tsx
// ❌ これは無限ループになる！
const [renderCount, setRenderCount] = useState(0);

useEffect(() => {
  setRenderCount(renderCount + 1); // setRenderCount が再レンダリングを起こす！
  // → 再レンダリングが起きる
  // → useEffect が再実行される
  // → setRenderCount がまた実行される
  // → また再レンダリング... 無限ループ！
});
```

#### 3. useRef のポイント

| タイミング | 動作 |
|----------|------|
| `renderCount.current += 1` を実行 | 値は変わるが、**これ自体は再レンダリングを起こさない** |
| `setText()` や `setCount()` を実行 | **これが再レンダリングを起こす**（useState の動作） |
| 再レンダリングが起きた時 | `renderCount.current` の**最新の値**が画面に表示される |

**まとめ：** 
- useRef は「値を変更しても再レンダリングしない」
- useState は「値を変更すると再レンダリングする」
- だから useRef は、レンダリング回数のカウントのような「裏で数えるだけ」の用途に使う
- useStateとuseEffectは、実装方法によっては無限ループになる可能性があるので注意。  
それを避けるためには、再レンダリングを起こさない useRef を使う。

### useState と useRef の使い分け

| | useState | useRef |
|---|---------|--------|
| 値が変わると再レンダリング？ | ✅ する | ❌ しない |
| 画面に表示する値？ | ✅ はい | ❌ いいえ（基本的に） |
| DOM アクセスに使う？ | ❌ | ✅ |
| 用途 | UI に反映するデータ | DOM 操作、タイマーID、前回の値の記憶 |

---

## 7-2. useMemo 【React】

`useMemo` は **計算結果をメモ化（キャッシュ）** する Hook です。  
重い計算を毎回のレンダリングで繰り返さないようにします。

**ファイル: `src/components/ExpensiveCalculation.tsx`**（新規作成）

```tsx
"use client";
import { useState, useMemo } from "react";

// 重い計算のシミュレーション
function calculateExpensiveValue(num: number): number {
  console.log("重い計算を実行中...");
  // わざと遅い処理をシミュレーション
  // Math.random() の代わりに単純なループにする（Hydration Error回避）
  let result = 0;
  for (let i = 0; i < num * 100000; i++) {
    result += i * 0.5;
  }
  return Math.round(result);
}

export default function ExpensiveCalculation() {
  const [count, setCount] = useState(10);
  const [text, setText] = useState("");

  // 【React】useMemo: count が変わった時だけ再計算する
  // text が変わっただけでは再計算しない
  const expensiveResult = useMemo(() => {
    return calculateExpensiveValue(count);
  }, [count]); // ← count が変わった時だけ再計算


  // const expensiveResult = calculateExpensiveValue(count);
  // ↑のようにuseMemo を使わないでuseState で管理していたら、
  // text を入力するたびに calculateExpensiveValue（毎回重い計算） が走ってしまう

  return (
    <div style={{ padding: "16px" }}>
      <h3>useMemo: メモ化</h3>
      <p>計算結果: {expensiveResult}</p>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => setCount(count + 1)}>計算値を増やす (count: {count})</button>
        <button onClick={() => setCount(10)} style={{ backgroundColor: "#f0f0f0" }}>リセット</button>
      </div>

      <div style={{ marginTop: "16px" }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="ここに入力しても再計算されない"
          style={{ padding: "8px", width: "300px" }}
        />
        <p>入力値: {text}</p>
      </div>
    </div>
  );
}
```

**ファイル: `src/app/page.tsx`**（更新）

```tsx
import FocusInput from "@/components/FocusInput";
import RenderCounter from "@/components/RenderCounter";
import ExpensiveCalculation from "@/components/ExpensiveCalculation";

export default function Home() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>useMemo の学習</h1>
      <FocusInput />
      <RenderCounter />
      <ExpensiveCalculation />
    </div>
  );
}
```

> **💡 注意**: `useMemo` は**パフォーマンスの最適化**のためのものです。  
> すべての値に使う必要はありません。重い計算やオブジェクトの生成が問題になった時に使いましょう。

---

## 7-3. useCallback 【React】

`useCallback` は **関数をメモ化** する Hook です。  
`useMemo` の「関数版」と考えてください。

**ファイル: `src/components/CallbackExample.tsx`**（新規作成）

```tsx
"use client";
import { useState, useCallback } from "react";

export default function CallbackExample() {
  const [count, setCount] = useState(0);

  // 【React】useCallback: 関数をメモ化する
  // count が変わらない限り、同じ関数の参照を返す
  const handleIncrement = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []); // 依存配列が空 = 常に同じ関数を返す

  // ※ setCount に関数を渡す形式（prev => prev + 1）にすると、
  //    count を依存配列に入れなくても最新の値を使える

  return (
    <div style={{ padding: "16px" }}>
      <h3>useCallback</h3>
      <p>カウント: {count}</p>
      <button onClick={handleIncrement}>+1</button>
    </div>
  );
}
```

**ファイル: `src/app/page.tsx`**（更新）

```tsx
import FocusInput from "@/components/FocusInput";
import RenderCounter from "@/components/RenderCounter";
import ExpensiveCalculation from "@/components/ExpensiveCalculation";
import CallbackExample from "@/components/CallbackExample";

export default function Home() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>useCallback の学習</h1>
      <FocusInput />
      <RenderCounter />
      <ExpensiveCalculation />
      <CallbackExample />
    </div>
  );
}
```

### useMemo と useCallback の関係

```tsx
// useCallback(fn, deps) は useMemo(() => fn, deps) と同じ
const memoizedFn = useCallback(() => { ... }, [deps]);
const memoizedFn = useMemo(() => () => { ... }, [deps]); // 同じ意味
```

> **💡 現場では**: `useMemo` / `useCallback` は「パフォーマンスが問題になったら使う」が基本方針です。  
> 最初からすべてに付ける必要はありません。

---

## 7-4. useContext 【React】

`useContext` は **コンポーネントツリー全体でデータを共有** する仕組みです。  
Chapter 04 で学んだ「Props Drilling（バケツリレー）」を解決します。

### Props Drilling の問題（おさらい）

```
App（テーマ情報を持つ）
  → Layout（テーマ情報を受け取り、そのまま渡す）← 使わないのに受け取る
    → Sidebar（テーマ情報を受け取り、そのまま渡す）← 使わないのに受け取る
      → ThemeButton（テーマ情報を使う）
```

### useContext での解決

```
App（テーマ情報を Provider で配信）
  → Layout（何も受け取る必要なし）
    → Sidebar（何も受け取る必要なし）
      → ThemeButton（useContext で直接テーマ情報を取得）
```

### 実装してみよう

**ステップ 1: Context を作成する**

**ファイル: `src/contexts/ThemeContext.tsx`**（新規作成）

```tsx
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
```

**ステップ 2: Provider でアプリを囲む**

**ファイル: `src/app/layout.tsx`**（更新）

```tsx
import type { Metadata } from "next";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "React Training",
  description: "React + TypeScript の学習",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        {/* 【React】ThemeProvider で囲むと、配下のどのコンポーネントからでも
            useTheme() でテーマ情報にアクセスできる */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**ステップ 3: データを使うコンポーネント**

**ファイル: `src/components/ThemeButton.tsx`**（新規作成）

```tsx
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
```

**ファイル: `src/components/ThemedCard.tsx`**（新規作成）

```tsx
"use client";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemedCard({ title, content }: { title: string; content: string }) {
  const { theme } = useTheme();

  return (
    <div style={{
      padding: "16px",
      margin: "8px 0",
      borderRadius: "8px",
      backgroundColor: theme === "light" ? "#fff" : "#444",
      color: theme === "light" ? "#333" : "#eee",
      border: `1px solid ${theme === "light" ? "#ddd" : "#666"}`,
    }}>
      <h3>{title}</h3>
      <p>{content}</p>
    </div>
  );
}
```

**ファイル: `src/app/page.tsx`**（更新）

```tsx
import ThemeButton from "@/components/ThemeButton";
import ThemedCard from "@/components/ThemedCard";

export default function Home() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>useContext の学習</h1>

      <ThemeButton />

      <ThemedCard title="カード 1" content="テーマが切り替わるカードです" />
      <ThemedCard title="カード 2" content="useContext でテーマを共有しています" />

      <p style={{ marginTop: "16px", fontSize: "14px", color: "#888" }}>
        ThemeButton と ThemedCard は、Props を介さずに同じテーマ情報を使っています
      </p>
    </div>
  );
}
```

---

## 7-5. useContext の使いどころ

| 使うべき場合 | 使わない方がいい場合 |
|-------------|-------------------|
| テーマ（ライト/ダーク） | 1～2階層の Props 受け渡し |
| ログイン状態 / ユーザー情報 | 頻繁に変わるデータ（パフォーマンス問題） |
| 言語設定（i18n） | コンポーネント内だけで完結するデータ |
| アプリ全体の設定 | 単純な親→子の Props で済む場合 |

> **💡 ポイント**: Context は「グローバル変数」のようなものです。  
> 便利ですが、使いすぎるとデータの流れが追いにくくなります。  
> **まず Props で渡す → 階層が深くて辛くなったら Context を検討** が基本方針です。

---

## この章のまとめ

| Hook | 技術 | 一言で |
|------|------|-------|
| useRef | 【React】 | 再レンダリングしない値の保管箱。DOM アクセスにも使う |
| useMemo | 【React】 | 計算結果をメモ化。依存が変わった時だけ再計算 |
| useCallback | 【React】 | 関数をメモ化。子コンポーネントへの不要な再レンダリングを防ぐ |
| useContext | 【React】 | コンポーネントツリー全体でデータを共有。Props Drilling を解決 |
| createContext | 【React】 | Context（データの配信チャンネル）を作る |

### Hooks のまとめ（これまで学んだもの）

| Hook | 用途 | 再レンダリング |
|------|------|-------------|
| useState | 状態管理 | ✅ する |
| useEffect | 副作用 | ー |
| useRef | 値の保持 / DOM | ❌ しない |
| useMemo | 計算のメモ化 | ー |
| useCallback | 関数のメモ化 | ー |
| useContext | グローバルデータ共有 | ✅ する |

---

**前の章**: [Chapter 06: useEffect と副作用](./06-useeffect.md)  
**次の章**: [Chapter 08: Next.js ルーティング（App Router）](./08-nextjs-routing.md)
