# Chapter 09: レイアウトと Server / Client Components

## この章のゴール

- `layout.tsx` を使った **共通レイアウト** の仕組みを理解する
- **Server Component** と **Client Component** の違いと使い分けを理解する
- `loading.tsx` / `error.tsx` / `not-found.tsx` の使い方を覚える
- 現場のコードで「なぜここに `"use client"` があるのか」を説明できるようになる

## この章で扱う技術

| タグ | 内容 |
|------|------|
| `【Next.js】` | layout.tsx, loading.tsx, error.tsx, not-found.tsx |
| `【Next.js + React】` | Server Components, Client Components |
| `【React】` | Suspense（loading の内部概念） |

---

## 9-1. layout.tsx の仕組み 【Next.js】

`layout.tsx` は、**そのディレクトリ以下のすべてのページで共有される枠組み（レイアウト）** です。

```
src/app/layout.tsx        ← 全ページに適用されるルートレイアウト
src/app/page.tsx           ← / のページ（layout の中に表示される）
src/app/about/page.tsx     ← /about のページ（同じ layout の中に表示される）
src/app/settings/
├── layout.tsx             ← /settings 以下だけに適用されるレイアウト
├── page.tsx
└── profile/page.tsx       ← settings の layout + root の layout が適用される
```

### ネストされたレイアウト

レイアウトは **入れ子（ネスト）** になります。

```
RootLayout（src/app/layout.tsx）
  └── SettingsLayout（src/app/settings/layout.tsx）
        └── ProfilePage（src/app/settings/profile/page.tsx）
```

---

## 9-2. ルートレイアウトの確認と更新

**ファイル: `src/app/layout.tsx`**（更新）

```tsx
import type { Metadata } from "next";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Navigation from "@/components/Navigation";
import "./globals.css";

// 【Next.js】metadata: ページのメタ情報（<title> や <meta>）
export const metadata: Metadata = {
  title: "React Training App",
  description: "React + TypeScript + Next.js の学習アプリ",
};

// 【Next.js + React】ルートレイアウト
// すべてのページがこのレイアウトの中に表示される
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, fontFamily: "sans-serif" }}>
        <ThemeProvider>
          {/* ナビゲーションは全ページに表示される */}
          <Navigation />
          {/* children にページの中身が入る */}
          <main style={{ padding: "16px" }}>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 確認ポイント

- すべてのページで `Navigation` が上部に表示される
- ページ遷移しても Navigation は再レンダリングされない（レイアウトの利点）

---

## 9-3. ネストされたレイアウトを作る

設定ページ専用のレイアウト（サイドバー付き）を作ります。

**ファイル: `src/app/settings/layout.tsx`**（新規作成）

```tsx
// 【Next.js】/settings 以下のページに適用されるレイアウト
import Link from "next/link";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: "24px" }}>
      {/* サイドバー */}
      <aside style={{
        width: "200px",
        borderRight: "1px solid #ddd",
        paddingRight: "16px",
      }}>
        <h2 style={{ fontSize: "18px" }}>設定メニュー</h2>
        <nav>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ marginBottom: "8px" }}>
              <Link href="/settings/profile">プロフィール</Link>
            </li>
            <li style={{ marginBottom: "8px" }}>
              <Link href="/settings/notifications">通知</Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* メインコンテンツ（各ページの中身） */}
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}
```

### レイアウトの重なり

`/settings/profile` を表示した場合、以下のように入れ子になります。

```
RootLayout（全体枠: <html>, <body>, <Navigation>）
  └── SettingsLayout（サイドバー付きレイアウト）
        └── ProfilePage（プロフィール設定の中身）
```

---

## 9-4. Server Component と Client Component 【Next.js + React】

Next.js App Router の**最も重要な概念の一つ**です。

### Server Component（デフォルト）

`src/app/` 内のコンポーネントは、デフォルトで **Server Component** です。  
**サーバー側で実行**され、完成した HTML がブラウザに送られます。

```tsx
// Server Component（デフォルト、"use client" を書かない）
export default function ServerPage() {
  // ✅ サーバーで実行されるので、以下が可能
  // - データベースに直接アクセス
  // - ファイルシステムにアクセス
  // - 機密情報（APIキーなど）を安全に使用

  // ❌ サーバーで実行されるので、以下が不可能
  // - useState / useEffect / useRef（ブラウザの機能）
  // - onClick / onChange（ブラウザのイベント）
  // - window / document（ブラウザの API）

  return <div>サーバーで描画されたコンポーネント</div>;
}
```

### Client Component

`"use client"` を書くと **Client Component** になります。  
**ブラウザ側で実行**されます。

```tsx
"use client";
// Client Component（ブラウザで実行される）

import { useState } from "react";

export default function ClientPage() {
  // ✅ ブラウザで実行されるので、以下が可能
  // - useState / useEffect / useRef
  // - onClick / onChange
  // - window / document

  // ❌ 以下は不可能
  // - データベースへの直接アクセス
  // - サーバー環境の機密情報の使用
  
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

### 使い分け早見表

| 機能 | Server Component | Client Component |
|------|:---------------:|:----------------:|
| `"use client"` | 不要 | **必要** |
| useState / useEffect | ❌ | ✅ |
| onClick / onChange | ❌ | ✅ |
| async/await（データ取得） | ✅ | △（useEffect 内で） |
| データベース直接アクセス | ✅ | ❌ |
| ブラウザ API（window等） | ❌ | ✅ |
| バンドルサイズ | 小さい | 大きい |

### コンポーネントツリーでの配置

```
Server Component（ページ: page.tsx）
  ├── Server Component（データ表示する部分）
  └── Client Component（"use client" = ユーザー操作がある部分）
        └── Client Component（Client の中は自動的に Client）
```

> **💡 設計指針**:  
> **可能な限り Server Component を使い、ユーザー操作が必要な部分だけ Client Component にする。**  
> これにより、ブラウザに送る JavaScript の量を最小限に抑えられます。

---

## 9-5. Server Component と Client Component を組み合わせる

**ファイル: `src/app/users/page.tsx`**（更新）

```tsx
// 【Next.js】Server Component（デフォルト）
// データの取得はサーバー側で行う
import Link from "next/link";
import UserSearch from "@/components/UserSearch";

// ダミーデータ（本来はデータベースから取得）
const users = [
  { id: 1, name: "田中太郎", role: "エンジニア" },
  { id: 2, name: "山田花子", role: "デザイナー" },
  { id: 3, name: "佐藤一郎", role: "マネージャー" },
  { id: 4, name: "鈴木次郎", role: "エンジニア" },
  { id: 5, name: "高橋三郎", role: "デザイナー" },
];

// この関数は Server Component なので、サーバー側で実行される
export default function UsersPage() {
  return (
    <div>
      <h1>ユーザー一覧</h1>

      {/* Client Component（検索は "use client" が必要） */}
      <UserSearch users={users} />

      <Link href="/">← ホームに戻る</Link>
    </div>
  );
}
```

**ファイル: `src/components/UserSearch.tsx`**（新規作成）

```tsx
"use client"; // ← useState を使うので Client Component

import { useState } from "react";
import Link from "next/link";

type User = {
  id: number;
  name: string;
  role: string;
};

type UserSearchProps = {
  users: User[]; // Server Component からデータを受け取る
};

export default function UserSearch({ users }: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // 検索でフィルタリング
  const filteredUsers = users.filter((user) =>
    user.name.includes(searchTerm) || user.role.includes(searchTerm)
  );

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="名前 or 役職で検索..."
        style={{ padding: "8px", marginBottom: "16px", width: "300px" }}
      />

      <ul>
        {filteredUsers.map((user) => (
          <li key={user.id}>
            <Link href={`/users/${user.id}`}>
              {user.name}（{user.role}）
            </Link>
          </li>
        ))}
      </ul>

      {filteredUsers.length === 0 && (
        <p style={{ color: "#999" }}>該当するユーザーがいません</p>
      )}
    </div>
  );
}
```

### ポイント

- `page.tsx`（Server Component）でデータを用意し、Props として渡す
- `UserSearch`（Client Component）でユーザー操作（検索）を処理する
- **データ取得はサーバー側、インタラクションはクライアント側**に分離する設計

---

## 9-6. loading.tsx（ローディング UI） 【Next.js】

**ファイル: `src/app/users/loading.tsx`**（新規作成）

```tsx
// 【Next.js】loading.tsx: ページの読み込み中に表示される UI
// React の Suspense 機能を内部的に利用している
export default function Loading() {
  return (
    <div style={{ padding: "16px" }}>
      <p>読み込み中...</p>
      {/* 実際のプロジェクトではスピナーやスケルトンUIを表示する */}
      <div style={{
        width: "40px",
        height: "40px",
        border: "4px solid #eee",
        borderTop: "4px solid #333",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }} />
    </div>
  );
}
```

> **📝 補足**: `loading.tsx` は、そのディレクトリの `page.tsx` が読み込まれるまでの間、  
> 自動的に表示されます。開発中はページが高速に読み込まれるため見えにくいですが、  
> API からデータを取得する場合に効果を発揮します。

---

## 9-7. error.tsx（エラーハンドリング） 【Next.js】

**ファイル: `src/app/users/error.tsx`**（新規作成）

```tsx
"use client"; // ← error.tsx は必ず Client Component

// 【Next.js】error.tsx: ページでエラーが発生した時に表示される UI
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void; // エラーからの復帰を試みる関数
}) {
  return (
    <div style={{ padding: "16px" }}>
      <h2>エラーが発生しました</h2>
      <p style={{ color: "red" }}>{error.message}</p>
      {/* reset() でエラー前の状態に戻すことを試みる */}
      <button onClick={reset}>もう一度試す</button>
    </div>
  );
}
```

> **📝 注意**: `error.tsx` は **必ず `"use client"` を付ける**必要があります。  
> これは Next.js の仕様です。

---

## 9-8. not-found.tsx（404 ページ） 【Next.js】

**ファイル: `src/app/not-found.tsx`**（新規作成）

```tsx
// 【Next.js】not-found.tsx: 存在しないページにアクセスされた時に表示
import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ padding: "16px", textAlign: "center" }}>
      <h1 style={{ fontSize: "48px" }}>404</h1>
      <h2>ページが見つかりません</h2>
      <p>お探しのページは存在しないか、移動された可能性があります。</p>
      <Link href="/" style={{ color: "#0070f3" }}>
        ホームに戻る
      </Link>
    </div>
  );
}
```

---

## 9-9. 特別なファイルの一覧まとめ 【Next.js】

| ファイル | 役割 | "use client" |
|---------|------|:----------:|
| `page.tsx` | ページの中身 | 任意 |
| `layout.tsx` | 共通レイアウト | 任意 |
| `loading.tsx` | 読み込み中の表示 | 任意 |
| `error.tsx` | エラー時の表示 | **必須** |
| `not-found.tsx` | 404 ページ | 任意 |
| `template.tsx` | layout に似るが、遷移のたびに再マウント | 任意 |

---

## この章のまとめ

| 概念 | 技術 | 一言で |
|------|------|-------|
| layout.tsx | 【Next.js】 | 共通レイアウト。ネスト可能。遷移しても再レンダリングされない |
| Server Component | 【Next.js + React】 | サーバーで実行。データ取得向き。デフォルト |
| Client Component | 【Next.js + React】 | ブラウザで実行。ユーザー操作向き。`"use client"` が必要 |
| loading.tsx | 【Next.js】 | ページ読み込み中に自動表示される UI |
| error.tsx | 【Next.js】 | エラー時に表示。必ず Client Component |
| not-found.tsx | 【Next.js】 | 404 ページ |

### 重要な理解

- **デフォルトは Server Component**。`"use client"` を書いた時だけ Client Component になる
- 設計方針: **サーバーでできることはサーバーで。ブラウザにはUIの操作だけ任せる**
- layout.tsx はページ遷移しても再マウントされないため、パフォーマンスが良い

---

**前の章**: [Chapter 08: Next.js ルーティング（App Router）](./08-nextjs-routing.md)  
**次の章**: [Chapter 10: API Routes とデータ取得](./10-api-routes-and-data-fetching.md)
