# Chapter 08: Next.js ルーティング（App Router）

## この章のゴール

- Next.js の **ファイルベースルーティング** の仕組みを理解する
- 複数のページを作成してページ間を遷移できるようにする
- **動的ルーティング**（URLパラメータ）を使えるようになる
- `Link` コンポーネントと `useRouter` の使い方を覚える

## この章で扱う技術

| タグ | 内容 |
|------|------|
| `【Next.js】` | App Router, ファイルベースルーティング, Link, 動的ルート |
| `【React】` | コンポーネントとしてのページ |
| `【TypeScript】` | Params の型定義 |

---

## 8-1. ファイルベースルーティングとは 【Next.js】

Next.js の App Router では、**`src/app/` ディレクトリ内のフォルダ構成が、そのまま URL になります**。  
ルーティングの定義ファイル（PHP の routes.php のようなもの）を書く必要がありません。

```
src/app/
├── page.tsx                  →  /
├── about/
│   └── page.tsx              →  /about
├── users/
│   ├── page.tsx              →  /users
│   └── [id]/
│       └── page.tsx          →  /users/123  (動的ルート)
└── settings/
    ├── page.tsx              →  /settings
    └── profile/
        └── page.tsx          →  /settings/profile
```

> **💡 PHP（Laravel）と比較**:  
> Laravel では `Route::get('/users/{id}', [UserController::class, 'show'])` のようにルートを定義しますが、  
> Next.js ではフォルダを `users/[id]/` と作るだけで同等のルーティングが自動的に設定されます。

---

## 8-2. 複数のページを作る

### トップページ（既存）

**ファイル: `src/app/page.tsx`**

```tsx
// 【Next.js】src/app/page.tsx → URL: /
import Link from "next/link"; // 【Next.js】ページ遷移用コンポーネント

export default function Home() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>ホーム</h1>
      <p>Next.js のルーティングを学習中です。</p>

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
  );
}
```

### About ページ（新規）

**ファイル: `src/app/about/page.tsx`**（新規作成）

```tsx
// 【Next.js】src/app/about/page.tsx → URL: /about
import Link from "next/link";

export default function About() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>About</h1>
      <p>このアプリは React + TypeScript + Next.js の学習用です。</p>

      <h2>使用技術</h2>
      <ul>
        <li>Next.js（フレームワーク）</li>
        <li>React（UIライブラリ）</li>
        <li>TypeScript（型付き言語）</li>
      </ul>

      {/* 【Next.js】Link でトップページに戻る */}
      <Link href="/">← ホームに戻る</Link>
    </div>
  );
}
```

### ユーザー一覧ページ（新規）

**ファイル: `src/app/users/page.tsx`**（新規作成）

```tsx
// 【Next.js】src/app/users/page.tsx → URL: /users
import Link from "next/link";

// ダミーデータ
const users = [
  { id: 1, name: "田中太郎" },
  { id: 2, name: "山田花子" },
  { id: 3, name: "佐藤一郎" },
];

export default function UsersPage() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>ユーザー一覧</h1>

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {/* 【Next.js】動的なURLを構築してリンクする */}
            <Link href={`/users/${user.id}`}>
              {user.name}
            </Link>
          </li>
        ))}
      </ul>

      <Link href="/">← ホームに戻る</Link>
    </div>
  );
}
```

---

## 8-3. Link コンポーネント 【Next.js】

ページ遷移には HTML の `<a>` タグではなく、Next.js の `Link` コンポーネントを使います。

```tsx
import Link from "next/link"; // 【Next.js】

// ✅ Next.js の Link（推奨）
<Link href="/about">About</Link>

// ❌ HTML の <a> タグ（ページ全体がリロードされる）
<a href="/about">About</a>
```

### Link を使うべき理由

| | `<Link>` (Next.js) | `<a>` (HTML) |
|---|-------------------|-------------|
| ページ遷移方式 | クライアントサイド遷移（高速） | フルリロード（遅い） |
| State の保持 | ✅ 保持される | ❌ 失われる |
| プリフェッチ | ✅ リンク先を事前読み込み | ❌ なし |

> **💡 ポイント**: Next.js の `Link` は内部的にはクライアントサイドの JavaScript でページを切り替えるため、  
> ページ全体をリロードせずに高速に遷移できます。

---

## 8-4. 動的ルーティング（URL パラメータ） 【Next.js】

フォルダ名を `[パラメータ名]` にすると、そのパラメータに任意の値を受け取れます。

```
src/app/users/[id]/page.tsx → /users/1, /users/2, /users/abc ...
```

**ファイル: `src/app/users/[id]/page.tsx`**（新規作成）

```tsx
// 【Next.js】動的ルーティング
// URL: /users/1, /users/2 など
import Link from "next/link";

// ダミーのユーザーデータ
const usersData: Record<string, { name: string; email: string; role: string }> = {
  "1": { name: "田中太郎", email: "tanaka@example.com", role: "エンジニア" },
  "2": { name: "山田花子", email: "yamada@example.com", role: "デザイナー" },
  "3": { name: "佐藤一郎", email: "sato@example.com", role: "マネージャー" },
};

// 【Next.js / TypeScript】ページコンポーネントの Props の型
// App Router では params は Promise として渡される
type UserDetailPageProps = {
  params: Promise<{ id: string }>; // [id] フォルダ名に対応
};

// 【Next.js】async 関数でページを定義（Server Component）
export default async function UserDetailPage({ params }: UserDetailPageProps) {
  // 【Next.js】params から URL パラメータを取得
  const { id } = await params;
  const user = usersData[id];

  if (!user) {
    return (
      <div style={{ padding: "16px" }}>
        <h1>ユーザーが見つかりません</h1>
        <p>ID: {id} のユーザーは存在しません。</p>
        <Link href="/users">← ユーザー一覧に戻る</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px" }}>
      <h1>{user.name}</h1>
      <table style={{ borderCollapse: "collapse", marginTop: "16px" }}>
        <tbody>
          <tr>
            <td style={{ padding: "8px", fontWeight: "bold" }}>ID</td>
            <td style={{ padding: "8px" }}>{id}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px", fontWeight: "bold" }}>メール</td>
            <td style={{ padding: "8px" }}>{user.email}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px", fontWeight: "bold" }}>役職</td>
            <td style={{ padding: "8px" }}>{user.role}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: "16px" }}>
        <Link href="/users">← ユーザー一覧に戻る</Link>
      </div>
    </div>
  );
}
```

### 確認

- `http://localhost:3000/users/1` → 田中太郎の詳細
- `http://localhost:3000/users/2` → 山田花子の詳細
- `http://localhost:3000/users/999` → 「見つかりません」メッセージ

---

## 8-5. useRouter（プログラムによるページ遷移） 【Next.js】

ボタンクリック時など、**プログラム（コード）でページ遷移**したい場合は `useRouter` を使います。

**ファイル: `src/components/NavigationButton.tsx`**（新規作成）

```tsx
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
```

### ホームページに NavigationButton を追加

**ファイル: `src/app/page.tsx`**（既存を更新）

```tsx
// 【Next.js】src/app/page.tsx → URL: /
import Link from "next/link"; // 【Next.js】ページ遷移用コンポーネント
import NavigationButton from "../components/NavigationButton"; // 追加

export default function Home() {
  return (
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
  );
}
```

### Link と useRouter の使い分け

| | Link | useRouter |
|---|------|----------|
| 用途 | 通常のリンク | ボタンクリック後の遷移、条件付き遷移 |
| 書き方 | `<Link href="/about">` | `router.push("/about")` |
| アクセシビリティ | ✅ `<a>` タグとして描画される | ❌ ボタンなので注意が必要 |
| 推奨度 | **基本はこちら** | 特殊なケースのみ |

---

## 8-6. usePathname（現在のURLを取得） 【Next.js】

現在表示しているページの URL パスを取得できます。  
ナビゲーションの「現在地」をハイライトするのによく使います。

**ファイル: `src/components/Navigation.tsx`**（新規作成）

```tsx
"use client";
// 【Next.js】usePathname は next/navigation から import
import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { href: "/", label: "ホーム" },
  { href: "/about", label: "About" },
  { href: "/users", label: "ユーザー" },
  { href: "/settings", label: "設定" },
];

export default function Navigation() {
  // 【Next.js】現在のパスを取得
  const pathname = usePathname();

  return (
    <nav style={{
      display: "flex",
      gap: "16px",
      padding: "16px",
      backgroundColor: "#333",
    }}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          style={{
            color: pathname === item.href ? "#61dafb" : "#fff",
            textDecoration: "none",
            fontWeight: pathname === item.href ? "bold" : "normal",
          }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
```

### ホームページに Navigation を追加

**ファイル: `src/app/page.tsx`**（さらに更新）

```tsx
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
```

> **💡 確認ポイント**:  
> - ページ上部に `Navigation` が表示され、現在のページ（ホーム）が青色でハイライトされる
> - 他のページに移動すると、そのページがハイライトされる

---

## 8-7. 設定ページ（ネストされたルーティング）

**ファイル: `src/app/settings/page.tsx`**（新規作成）

```tsx
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
```

**ファイル: `src/app/settings/profile/page.tsx`**（新規作成）

```tsx
// 【Next.js】src/app/settings/profile/page.tsx → URL: /settings/profile
import Link from "next/link";

export default function ProfileSettingsPage() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>プロフィール設定</h1>
      <p>ここでプロフィールを編集できます。（実装は Chapter 11 で行います）</p>
      <Link href="/settings">← 設定に戻る</Link>
    </div>
  );
}
```

**ファイル: `src/app/settings/notifications/page.tsx`**（新規作成）

```tsx
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
```

---

## 8-8. 最終的なフォルダ構成

```
src/app/
├── page.tsx                        → /
├── about/
│   └── page.tsx                    → /about
├── users/
│   ├── page.tsx                    → /users
│   └── [id]/
│       └── page.tsx                → /users/:id
└── settings/
    ├── page.tsx                    → /settings
    ├── profile/
    │   └── page.tsx                → /settings/profile
    └── notifications/
        └── page.tsx                → /settings/notifications
```

---

## この章のまとめ

| 概念 | 技術 | 一言で |
|------|------|-------|
| ファイルベースルーティング | 【Next.js】 | フォルダ構造 = URL。設定ファイル不要 |
| page.tsx | 【Next.js】 | そのフォルダの URL に対応するページコンポーネント |
| Link | 【Next.js】 | 高速なページ遷移用コンポーネント。`<a>` の代わりに使う |
| 動的ルート `[id]` | 【Next.js】 | URL パラメータを受け取る。`params` で値を取得 |
| useRouter | 【Next.js】 | プログラムでページ遷移。Client Component で使用 |
| usePathname | 【Next.js】 | 現在の URL パスを取得。ナビゲーションのハイライトに使う |

### 重要な理解

- **Next.js のルーティングはファイルベース**。React 単体にはルーティングの仕組みがない
- `Link` と `useRouter` の使い分け: 基本は `Link`、プログラムで遷移が必要な時だけ `useRouter`
- 動的ルート `[id]` は PHP の `/users/{id}` に相当する

---

**前の章**: [Chapter 07: その他の主要 Hooks](./07-other-hooks.md)  
**次の章**: [Chapter 09: レイアウトと Server / Client Components](./09-nextjs-layout-and-components.md)
