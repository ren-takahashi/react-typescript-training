# Chapter 10: API Routes とデータ取得（モック JSON 使用）

## この章のゴール

- Next.js の **Route Handlers（API Routes）** でバックエンド API を作る
- **JSON ファイルをモックデータ** として使う方法を覚える
- Server Component でのデータ取得と Client Component でのデータ取得を理解する
- **ローディング・エラー状態** のハンドリングを実装する

## この章で扱う技術

| タグ | 内容 |
|------|------|
| `【Next.js】` | Route Handlers (API Routes), Server Component でのデータ取得 |
| `【React】` | useEffect でのクライアントサイドデータ取得、状態管理 |
| `【TypeScript】` | API レスポンスの型定義 |
| `【JavaScript】` | fetch API, async/await, JSON |

---

## 10-1. Route Handlers（API Routes）とは 【Next.js】

Next.js では、`src/app/api/` ディレクトリ内に `route.ts` ファイルを作ることで、  
**バックエンドの API エンドポイント** を作れます。

```
src/app/api/
├── users/
│   └── route.ts          → GET /api/users, POST /api/users
└── users/[id]/
    └── route.ts          → GET /api/users/123
```

> **💡 PHP と比較**: PHP でコントローラーを作るのに似ていますが、  
> ルーティングはファイルベースで自動的に設定されます。

---

## 10-2. モック JSON データの作成

まず、API のレスポンスとして返すダミーデータを JSON ファイルとして準備します。

**ファイル: `src/data/users.json`**（新規作成）

```json
[
  {
    "id": 1,
    "name": "田中太郎",
    "email": "tanaka@example.com",
    "role": "エンジニア",
    "department": "開発部",
    "joinedAt": "2020-04-01"
  },
  {
    "id": 2,
    "name": "山田花子",
    "email": "yamada@example.com",
    "role": "デザイナー",
    "department": "デザイン部",
    "joinedAt": "2021-07-15"
  },
  {
    "id": 3,
    "name": "佐藤一郎",
    "email": "sato@example.com",
    "role": "マネージャー",
    "department": "開発部",
    "joinedAt": "2018-01-10"
  },
  {
    "id": 4,
    "name": "鈴木次郎",
    "email": "suzuki@example.com",
    "role": "エンジニア",
    "department": "インフラ部",
    "joinedAt": "2022-03-01"
  },
  {
    "id": 5,
    "name": "高橋三郎",
    "email": "takahashi@example.com",
    "role": "デザイナー",
    "department": "デザイン部",
    "joinedAt": "2023-09-01"
  }
]
```

**ファイル: `src/data/posts.json`**（新規作成）

```json
[
  {
    "id": 1,
    "title": "React Hooks 入門",
    "content": "useState と useEffect の基本的な使い方を解説します。",
    "authorId": 1,
    "publishedAt": "2025-01-15",
    "tags": ["React", "Hooks", "入門"]
  },
  {
    "id": 2,
    "title": "TypeScript の型システム",
    "content": "TypeScript の型システムの基本と実践的な使い方を紹介します。",
    "authorId": 2,
    "publishedAt": "2025-02-20",
    "tags": ["TypeScript", "型"]
  },
  {
    "id": 3,
    "title": "Next.js App Router 完全ガイド",
    "content": "Next.js 14 以降の App Router の使い方を徹底解説します。",
    "authorId": 1,
    "publishedAt": "2025-03-10",
    "tags": ["Next.js", "App Router"]
  }
]
```

---

## 10-3. 共通の型定義ファイルを作る 【TypeScript】

**ファイル: `src/types/index.ts`**（新規作成）

```typescript
// 【TypeScript】アプリ全体で使う型を一箇所にまとめる

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  joinedAt: string;
};

export type Post = {
  id: number;
  title: string;
  content: string;
  authorId: number;
  publishedAt: string;
  tags: string[];
};

// API レスポンスの型
export type ApiResponse<T> = {
  data: T;
  message: string;
};

export type ApiErrorResponse = {
  error: string;
  message: string;
};
```

---

## 10-4. API Route を作る（GET） 【Next.js】

**ファイル: `src/app/api/users/route.ts`**（新規作成）

```typescript
// 【Next.js】Route Handler: GET /api/users
// このファイルは「サーバー側」で実行される

import { NextResponse } from "next/server";
import usersData from "@/data/users.json";
import type { User, ApiResponse } from "@/types";

// 【Next.js】GET メソッドのハンドラ
// PHP でいう Controller のメソッドに相当
export async function GET(request: Request) {
  // 【JavaScript】URL からクエリパラメータを取得
  const { searchParams } = new URL(request.url);
  const department = searchParams.get("department");
  const role = searchParams.get("role");

  // フィルタリング
  let users: User[] = usersData;

  if (department) {
    users = users.filter((user) => user.department === department);
  }
  if (role) {
    users = users.filter((user) => user.role === role);
  }

  // 【Next.js】NextResponse.json() で JSON レスポンスを返す
  const response: ApiResponse<User[]> = {
    data: users,
    message: "ユーザー一覧を取得しました",
  };

  return NextResponse.json(response);
}
```

**ファイル: `src/app/api/users/[id]/route.ts`**（新規作成）

```typescript
// 【Next.js】Route Handler: GET /api/users/:id
import { NextResponse } from "next/server";
import usersData from "@/data/users.json";
import type { User, ApiResponse, ApiErrorResponse } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = parseInt(id, 10);

  // ユーザーを検索
  const user = usersData.find((u) => u.id === userId) as User | undefined;

  if (!user) {
    const errorResponse: ApiErrorResponse = {
      error: "NOT_FOUND",
      message: `ID: ${id} のユーザーが見つかりません`,
    };
    return NextResponse.json(errorResponse, { status: 404 });
  }

  const response: ApiResponse<User> = {
    data: user,
    message: "ユーザー情報を取得しました",
  };

  return NextResponse.json(response);
}
```

### 動作確認

ブラウザで以下の URL にアクセスしてみてください。

- `http://localhost:3000/api/users` → 全ユーザーの JSON
- `http://localhost:3000/api/users?role=エンジニア` → エンジニアだけ
- `http://localhost:3000/api/users/1` → 田中太郎の JSON
- `http://localhost:3000/api/users/999` → 404 エラー

---

## 10-5. 投稿の API Route も作る

**ファイル: `src/app/api/posts/route.ts`**（新規作成）

```typescript
// 【Next.js】Route Handler: GET /api/posts
import { NextResponse } from "next/server";
import postsData from "@/data/posts.json";
import type { Post, ApiResponse } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag");

  let posts: Post[] = postsData;

  if (tag) {
    posts = posts.filter((post) => post.tags.includes(tag));
  }

  const response: ApiResponse<Post[]> = {
    data: posts,
    message: "投稿一覧を取得しました",
  };

  return NextResponse.json(response);
}
```

---

## 10-6. Server Component でデータを取得する 【Next.js】

Server Component は `async` 関数にできるため、**直接 `await` でデータを取得**できます。

**ファイル: `src/app/users/page.tsx`**（更新）

```tsx
// 【Next.js】Server Component でのデータ取得
import Link from "next/link";
import type { User, ApiResponse } from "@/types";
import UserSearch from "@/components/UserSearch";

// 【Next.js】サーバー側で API を呼ぶ関数
async function getUsers(): Promise<User[]> {
  // 注意: Server Component から自身の API Route を呼ぶ場合は
  // 完全な URL が必要（本番環境では環境変数で管理する）
  // ここではモックデータを直接 import する方がシンプル

  // 方法 1: JSON ファイルを直接 import（推奨・シンプル）
  const usersData = (await import("@/data/users.json")).default;
  return usersData as User[];
}

// 【Next.js】async 関数でページを定義
export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div>
      <h1>ユーザー一覧（{users.length}人）</h1>

      {/* Client Component にデータを渡す */}
      <UserSearch users={users} />

      <Link href="/">← ホームに戻る</Link>
    </div>
  );
}
```

---

## 10-7. Client Component でデータを取得する 【React】

Client Component では `useEffect` + `fetch` でデータを取得します。

**ファイル: `src/app/posts/page.tsx`**（新規作成）

```tsx
// 【Next.js】このページでは Client Component を使う
// （クライアントサイドでのデータ取得パターンを学ぶため）
import PostList from "@/components/PostList";

export default function PostsPage() {
  return (
    <div>
      <h1>投稿一覧</h1>
      <PostList />
    </div>
  );
}
```

**ファイル: `src/components/PostList.tsx`**（新規作成）

```tsx
"use client";
import { useState, useEffect } from "react";
import type { Post, ApiResponse } from "@/types";

export default function PostList() {
  // 【React】3つの状態を管理: データ、ローディング、エラー
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 【React】useEffect でマウント時にデータを取得
  useEffect(() => {
    async function fetchPosts() {
      try {
        setIsLoading(true);
        setError(null);

        // 【JavaScript】fetch API で自身の API Route を呼ぶ
        const response = await fetch("/api/posts");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 【TypeScript】レスポンスの型を指定
        const result: ApiResponse<Post[]> = await response.json();
        setPosts(result.data);
      } catch (err) {
        // 【TypeScript】err は unknown 型なので、型チェックが必要
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("不明なエラーが発生しました");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, []); // 空配列 = 初回のみ

  // ローディング中
  if (isLoading) {
    return <p>投稿を読み込み中...</p>;
  }

  // エラー時
  if (error) {
    return (
      <div style={{ color: "red" }}>
        <p>エラー: {error}</p>
        <button onClick={() => window.location.reload()}>再読み込み</button>
      </div>
    );
  }

  // データ表示
  return (
    <div>
      {posts.map((post) => (
        <article
          key={post.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ margin: "0 0 8px 0" }}>{post.title}</h2>
          <p style={{ color: "#666" }}>{post.content}</p>
          <div style={{ display: "flex", gap: "8px" }}>
            {post.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  backgroundColor: "#e3f2fd",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <p style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
            投稿日: {post.publishedAt}
          </p>
        </article>
      ))}
    </div>
  );
}
```

---

## 10-8. Server Component vs Client Component でのデータ取得

| | Server Component | Client Component |
|---|-----------------|-----------------|
| データ取得方法 | `async/await` で直接取得 | `useEffect` + `fetch` |
| ローディング表示 | `loading.tsx` で自動 | State で手動管理 |
| SEO | ✅ HTML に含まれる | ❌ JS 実行後に表示 |
| ユーザー操作 | ❌ できない | ✅ フィルタ、検索など |
| 推奨 | **データ表示がメイン** | **ユーザー操作が必要** |

> **💡 現場での方針**:
> - 静的にデータを表示するだけ → **Server Component**
> - ユーザーの操作で動的にデータを変える → **Client Component**
> - Server Component でデータを取得し、Client Component に渡すのがベストプラクティス

---

## 10-9. POST API Route（データの作成） 【Next.js】

**ファイル: `src/app/api/posts/route.ts`**（更新）

```typescript
import { NextResponse } from "next/server";
import postsData from "@/data/posts.json";
import type { Post, ApiResponse } from "@/types";

// 既存の GET ハンドラ
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag");

  let posts: Post[] = postsData;

  if (tag) {
    posts = posts.filter((post) => post.tags.includes(tag));
  }

  const response: ApiResponse<Post[]> = {
    data: posts,
    message: "投稿一覧を取得しました",
  };

  return NextResponse.json(response);
}

// 【Next.js】POST メソッドのハンドラ（新規追加）
export async function POST(request: Request) {
  // 【JavaScript】リクエストボディを JSON として解析
  const body = await request.json();

  // 【TypeScript】受け取ったデータの型チェック（簡易版）
  const { title, content, authorId, tags } = body as {
    title: string;
    content: string;
    authorId: number;
    tags: string[];
  };

  // バリデーション
  if (!title || !content) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "title と content は必須です" },
      { status: 400 }
    );
  }

  // 新しい投稿を作成（実際のアプリではデータベースに保存する）
  const newPost: Post = {
    id: Date.now(), // 簡易的な ID 生成
    title,
    content,
    authorId: authorId || 1,
    publishedAt: new Date().toISOString().split("T")[0],
    tags: tags || [],
  };

  // 注意: JSON ファイルには実際には保存されない（メモリ上の処理のみ）
  // 実際のアプリではデータベースに INSERT する

  const response: ApiResponse<Post> = {
    data: newPost,
    message: "投稿を作成しました",
  };

  return NextResponse.json(response, { status: 201 });
}
```

---

## 10-10. ナビゲーションに投稿ページを追加

**ファイル: `src/components/Navigation.tsx`**（更新）

`navItems` に投稿ページを追加してください。

```tsx
const navItems = [
  { href: "/", label: "ホーム" },
  { href: "/about", label: "About" },
  { href: "/users", label: "ユーザー" },
  { href: "/posts", label: "投稿" },    // ← 追加
  { href: "/settings", label: "設定" },
];
```

---

## この章のまとめ

| 概念 | 技術 | 一言で |
|------|------|-------|
| Route Handlers | 【Next.js】 | `api/` 配下の `route.ts` でバックエンド API を実装 |
| NextResponse | 【Next.js】 | APIレスポンスを返すためのユーティリティ |
| GET / POST | 【Next.js】 | HTTP メソッドに対応する関数を export する |
| fetch | 【JavaScript】 | HTTP リクエストを送る標準 API |
| async/await | 【JavaScript】 | 非同期処理を同期的に書く構文 |
| モック JSON | ー | ダミーデータとしてJSONファイルを使う |
| 型定義ファイル | 【TypeScript】 | `src/types/` に共通の型をまとめる |
| ローディング/エラー状態 | 【React】 | 3つの State（data, isLoading, error）で管理 |

### 重要な理解

- Next.js では **フロントエンドとバックエンドを1つのプロジェクトで開発**できる
- API Route は **サーバー側で実行**される（ブラウザには送られない）
- データ取得は **Server Component が推奨**。Client Component は操作が必要な場合のみ
- 型定義を共通化すると、API とフロントエンドで型の不整合が起きにくい

---

**前の章**: [Chapter 09: レイアウトと Server / Client Components](./09-nextjs-layout-and-components.md)  
**次の章**: [Chapter 11: フォーム実装とバリデーション](./11-forms-and-validation.md)
