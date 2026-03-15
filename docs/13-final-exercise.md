# Chapter 13: 総合演習 ── Todo アプリ開発

## この章のゴール

これまでの全章で学んだ知識を組み合わせて、**CRUD 機能を持つ Todo アプリ**を  
**段階的に** 実装。

### 使う技術・概念の一覧

| 章 | 概念 | この演習での使いどころ |
|----|------|----------------------|
| Ch02 | 型定義・interface | Todo の型、Props の型 |
| Ch03 | JSX・コンポーネント | 画面パーツの分割 |
| Ch04 | Props | コンポーネント間のデータ受け渡し |
| Ch05 | useState・イベント | Todo の追加・編集・削除 |
| Ch06 | useEffect | 初回データ取得 |
| Ch07 | useRef / useCallback | フォーカス制御、コールバック最適化 |
| Ch08 | ルーティング | 一覧ページ・詳細ページ |
| Ch09 | レイアウト・SC/CC | 共通ヘッダー、Server/Client 使い分け |
| Ch10 | API Routes | Todo の CRUD API |
| Ch11 | フォーム・バリデーション | 新規追加・編集フォーム |
| Ch12 | カスタム Hooks | useTodos / useForm |

---

## 学習の進め方（重要！）

### 📝 段階的な実装方式

このチュートリアルは **5つのステップ** に分かれています：

```
ステップ1: Todo を表示する（最小限）
  ↓ 動作確認 ✅
ステップ2: Todo を追加する
  ↓ 動作確認 ✅
ステップ3: 完了トグル・削除機能
  ↓ 動作確認 ✅
ステップ4: フィルター機能
  ↓ 動作確認 ✅
ステップ5: 詳細ページと編集機能
  ↓ 完成
```

**各ステップで必ず動作確認してから次へ進んでください。**

---

## 1. 完成イメージ

```
/todos          → Todo 一覧（追加フォーム + リスト表示）
/todos/[id]     → Todo 詳細・編集ページ
```

### 最終的な機能一覧

- ✅ Todo の一覧表示
- ✅ Todo の新規追加（タイトル + 説明）
- ✅ Todo の完了 / 未完了トグル
- ✅ Todo の編集（タイトル + 説明）
- ✅ Todo の削除
- ✅ フィルター（すべて / 未完了 / 完了済み）

---

## 2. 最終的なファイル構成

```
src/
├── app/
│   ├── layout.tsx              ← ルートレイアウト
│   ├── page.tsx                ← トップページ（/todos へリダイレクト）
│   └── todos/
│       ├── page.tsx            ← Todo 一覧ページ
│       ├── loading.tsx         ← ローディング表示
│       └── [id]/
│           └── page.tsx        ← Todo 詳細・編集ページ
├── components/
│   ├── Header.tsx              ← 共通ヘッダー
│   ├── TodoForm.tsx            ← 新規追加フォーム
│   ├── TodoList.tsx            ← Todo リスト
│   ├── TodoItem.tsx            ← Todo 1件の表示
│   ├── TodoFilter.tsx          ← フィルターボタン
│   └── TodoEditForm.tsx        ← 編集フォーム
├── hooks/
│   ├── useTodos.ts             ← Todo CRUD ロジック
│   └── useForm.ts              ← フォーム管理ロジック
├── types/
│   └── index.ts                ← 型定義
└── data/
    └── todos.json              ← モック初期データ
```

---

# ステップ1: Todo を表示する（最小限）

まずは「Todo の一覧を表示する」だけの最小限の機能を作ります。

## 1-1. 型定義を作る

`src/types/index.ts` を以下の内容に**書き換え**（または追記）:

```typescript
// Todo の型定義
export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// フィルターの種類（後で使う）
export type TodoFilter = "all" | "active" | "completed";
```

## 1-2. モックデータを作る

`src/data/todos.json`:

```json
[
  {
    "id": "1",
    "title": "Next.js のチュートリアルを完了する",
    "description": "公式ドキュメントの App Router セクションを一通り読む",
    "completed": false,
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-01-15T09:00:00.000Z"
  },
  {
    "id": "2",
    "title": "TypeScript の型定義を練習する",
    "description": "interface と type の使い分けを理解し、ユーティリティ型を試す",
    "completed": true,
    "createdAt": "2024-01-14T10:30:00.000Z",
    "updatedAt": "2024-01-15T08:00:00.000Z"
  },
  {
    "id": "3",
    "title": "React Hooks を復習する",
    "description": "useState, useEffect, useRef, useMemo, useCallback を一通り書く",
    "completed": false,
    "createdAt": "2024-01-16T14:00:00.000Z",
    "updatedAt": "2024-01-16T14:00:00.000Z"
  }
]
```

## 1-3. API を作る（GET のみ）

`src/app/api/todos/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { Todo } from "@/types";
import initialTodos from "@/data/todos.json";

// メモリ上にデータを保持
let todos: Todo[] = [...initialTodos];

// GET /api/todos - 一覧取得
export function GET() {
  const sorted = [...todos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json(sorted);
}
```

## 1-4. シンプルなコンポーネントを作る

### Header コンポーネント

`src/components/Header.tsx`:

```tsx
import Link from "next/link";

export default function Header() {
  return (
    <header style={{
      backgroundColor: "#1a1a2e",
      color: "#ffffff",
      padding: "16px 24px",
    }}>
      <Link href="/todos" style={{ color: "#ffffff", textDecoration: "none" }}>
        <h1 style={{ margin: 0, fontSize: "20px" }}>📝 Todo App</h1>
      </Link>
    </header>
  );
}
```

### TodoList コンポーネント（シンプル版）

`src/components/TodoList.tsx`:

```tsx
"use client";

import { Todo } from "@/types";

interface TodoListProps {
  todos: Todo[];
}

export default function TodoList({ todos }: TodoListProps) {
  if (todos.length === 0) {
    return <p style={{ textAlign: "center", color: "#888", padding: "32px 0" }}>Todo がありません</p>;
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
      {todos.map((todo) => (
        <div
          key={todo.id}
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #eee",
            backgroundColor: todo.completed ? "#f8f9fa" : "#ffffff",
          }}
        >
          <div style={{
            textDecoration: todo.completed ? "line-through" : "none",
            color: todo.completed ? "#999" : "#333",
            fontSize: "16px",
            fontWeight: "bold",
          }}>
            {todo.title}
          </div>
          {todo.description && (
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>
              {todo.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
```

## 1-5. ページを作る

### layout.tsx を更新

`src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Todo App",
  description: "React + TypeScript + Next.js 学習用 Todo アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, fontFamily: "sans-serif" }}>
        <Header />
        <main style={{ maxWidth: "720px", margin: "0 auto", padding: "24px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
```

### page.tsx を更新（リダイレクト）

`src/app/page.tsx`:

```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/todos");
}
```

### Todos ページ（シンプル版）

`src/app/todos/page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { Todo } from "@/types";
import TodoList from "@/components/TodoList";

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTodos() {
      const res = await fetch("/api/todos");
      const data: Todo[] = await res.json();
      setTodos(data);
      setIsLoading(false);
    }
    fetchTodos();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: "24px", marginBottom: "24px" }}>Todo 一覧</h1>
      {isLoading ? (
        <p style={{ textAlign: "center", color: "#888" }}>読み込み中...</p>
      ) : (
        <TodoList todos={todos} />
      )}
    </div>
  );
}
```

## ✅ ステップ1の動作確認

```bash
# 開発サーバーを起動
npm run dev
```

ブラウザで `http://localhost:3000` にアクセス:
- ✅ `/todos` にリダイレクトされる
- ✅ 3件の Todo が表示される
- ✅ 完了済みの Todo に取り消し線がつく

**動作確認できたら次へ！**

---

# ステップ2: Todo を追加する

次に「Todo を追加する」機能を実装します。

## 2-1. 型定義を追加

`src/types/index.ts` に追記:

```typescript
// 新規作成時の入力
export type CreateTodoInput = Pick<Todo, "title" | "description">;
```

## 2-2. API に POST を追加

`src/app/api/todos/route.ts` に POST を追加:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { Todo, CreateTodoInput } from "@/types";
import initialTodos from "@/data/todos.json";

let todos: Todo[] = [...initialTodos];

export function GET() {
  const sorted = [...todos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json(sorted);
}

// 👇 追加
export async function POST(request: NextRequest) {
  const body: CreateTodoInput = await request.json();

  if (!body.title || body.title.trim() === "") {
    return NextResponse.json({ error: "タイトルは必須です" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const newTodo: Todo = {
    id: String(Date.now()),
    title: body.title.trim(),
    description: body.description?.trim() ?? "",
    completed: false,
    createdAt: now,
    updatedAt: now,
  };

  todos.push(newTodo);
  return NextResponse.json(newTodo, { status: 201 });
}
```

## 2-3. TodoForm コンポーネントを作る

`src/components/TodoForm.tsx`:

```tsx
"use client";

import { useState, FormEvent } from "react";
import { CreateTodoInput } from "@/types";

interface TodoFormProps {
  onAdd: (input: CreateTodoInput) => Promise<void>;
}

export default function TodoForm({ onAdd }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (title.trim() === "") {
      setError("タイトルを入力してください");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({ title, description });
      setTitle("");
      setDescription("");
    } catch {
      setError("追加に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "24px" }}>
      <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>新しい Todo を追加</h2>

      <div style={{ marginBottom: "8px" }}>
        <input
          type="text"
          placeholder="タイトル（必須）"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            border: error ? "2px solid #e74c3c" : "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />
        {error && <p style={{ color: "#e74c3c", fontSize: "13px", marginTop: "4px" }}>{error}</p>}
      </div>

      <div style={{ marginBottom: "8px" }}>
        <input
          type="text"
          placeholder="説明（任意）"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          padding: "10px 24px",
          backgroundColor: "#2ecc71",
          color: "#ffffff",
          border: "none",
          borderRadius: "4px",
          fontSize: "16px",
          cursor: isSubmitting ? "not-allowed" : "pointer",
          opacity: isSubmitting ? 0.6 : 1,
        }}
      >
        {isSubmitting ? "追加中..." : "追加する"}
      </button>
    </form>
  );
}
```

## 2-4. ページに TodoForm を追加

`src/app/todos/page.tsx` を更新:

```tsx
"use client";

import { useState, useEffect } from "react";
import { Todo, CreateTodoInput } from "@/types";
import TodoForm from "@/components/TodoForm";
import TodoList from "@/components/TodoList";

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTodos() {
      const res = await fetch("/api/todos");
      const data: Todo[] = await res.json();
      setTodos(data);
      setIsLoading(false);
    }
    fetchTodos();
  }, []);

  // 👇 追加
  const handleAdd = async (input: CreateTodoInput) => {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("追加に失敗しました");
    const newTodo: Todo = await res.json();
    setTodos((prev) => [newTodo, ...prev]);
  };

  return (
    <div>
      <h1 style={{ fontSize: "24px", marginBottom: "24px" }}>Todo 一覧</h1>
      
      {/* 👇 追加 */}
      <TodoForm onAdd={handleAdd} />

      {isLoading ? (
        <p style={{ textAlign: "center", color: "#888" }}>読み込み中...</p>
      ) : (
        <TodoList todos={todos} />
      )}
    </div>
  );
}
```

## ✅ ステップ2の動作確認

- ✅ タイトルを入力して「追加する」→ リストに追加される
- ✅ タイトル未入力で「追加する」→ エラーメッセージ表示
- ✅ 追加した Todo がリストの先頭に表示される

**動作確認できたら次へ！**

---

# ステップ3: 完了トグル・削除機能

Todo の基本的な操作を追加します。

## 3-1. 型定義を追加

`src/types/index.ts` に追記:

```typescript
// 更新時の入力
export type UpdateTodoInput = Partial<Pick<Todo, "title" | "description" | "completed">>;
```

## 3-2. API を追加

`src/app/api/todos/[id]/route.ts` を新規作成:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { Todo, UpdateTodoInput } from "@/types";
import initialTodos from "@/data/todos.json";

let todos: Todo[] = [...initialTodos];

// PATCH /api/todos/[id] - 更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Todo が見つかりません" }, { status: 404 });
  }

  const body: UpdateTodoInput = await request.json();
  const updated: Todo = {
    ...todos[index],
    ...(body.title !== undefined && { title: body.title.trim() }),
    ...(body.description !== undefined && { description: body.description.trim() }),
    ...(body.completed !== undefined && { completed: body.completed }),
    updatedAt: new Date().toISOString(),
  };

  todos[index] = updated;
  return NextResponse.json(updated);
}

// DELETE /api/todos/[id] - 削除
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Todo が見つかりません" }, { status: 404 });
  }

  todos.splice(index, 1);
  return NextResponse.json({ message: "削除しました" });
}
```

## 3-3. TodoItem コンポーネントを作る

`src/components/TodoItem.tsx`:

```tsx
"use client";

import { Todo } from "@/types";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        borderBottom: "1px solid #eee",
        backgroundColor: todo.completed ? "#f8f9fa" : "#ffffff",
      }}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        style={{ width: "20px", height: "20px", cursor: "pointer" }}
      />

      <div style={{ flex: 1 }}>
        <div
          style={{
            textDecoration: todo.completed ? "line-through" : "none",
            color: todo.completed ? "#999" : "#333",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {todo.title}
        </div>
        {todo.description && (
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>
            {todo.description}
          </p>
        )}
      </div>

      <button
        onClick={() => {
          if (window.confirm("本当に削除しますか？")) {
            onDelete(todo.id);
          }
        }}
        style={{
          padding: "6px 12px",
          backgroundColor: "#e74c3c",
          color: "#ffffff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "13px",
        }}
      >
        削除
      </button>
    </div>
  );
}
```

## 3-4. TodoList を更新

`src/components/TodoList.tsx` を更新:

```tsx
"use client";

import { Todo } from "@/types";
import TodoItem from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;  // 👈 追加
  onDelete: (id: string) => void;  // 👈 追加
}

export default function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return <p style={{ textAlign: "center", color: "#888", padding: "32px 0" }}>Todo がありません</p>;
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
```

## 3-5. ページにトグル・削除機能を追加

`src/app/todos/page.tsx` を更新:

```tsx
"use client";

import { useState, useEffect } from "react";
import { Todo, CreateTodoInput } from "@/types";
import TodoForm from "@/components/TodoForm";
import TodoList from "@/components/TodoList";

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTodos() {
      const res = await fetch("/api/todos");
      const data: Todo[] = await res.json();
      setTodos(data);
      setIsLoading(false);
    }
    fetchTodos();
  }, []);

  const handleAdd = async (input: CreateTodoInput) => {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("追加に失敗しました");
    const newTodo: Todo = await res.json();
    setTodos((prev) => [newTodo, ...prev]);
  };

  // 👇 追加
  const handleToggle = async (id: string) => {
    const target = todos.find((t) => t.id === id);
    if (!target) return;

    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !target.completed }),
    });
    if (!res.ok) throw new Error("更新に失敗しました");
    const updated: Todo = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  // 👇 追加
  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("削除に失敗しました");
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div>
      <h1 style={{ fontSize: "24px", marginBottom: "24px" }}>Todo 一覧</h1>
      <TodoForm onAdd={handleAdd} />
      {isLoading ? (
        <p style={{ textAlign: "center", color: "#888" }}>読み込み中...</p>
      ) : (
        <TodoList todos={todos} onToggle={handleToggle} onDelete={handleDelete} />
      )}
    </div>
  );
}
```

## ✅ ステップ3の動作確認

- ✅ チェックボックスをクリック → 完了/未完了が切り替わる
- ✅ 「削除」ボタン → 確認ダイアログ → 削除される
- ✅ 完了済みの Todo に取り消し線

**動作確認できたら次へ！**

---

# ステップ4: フィルター機能

Todo を絞り込む機能を追加します。

## 4-1. TodoFilter コンポーネントを作る

`src/components/TodoFilter.tsx`:(新規作成)

```tsx
"use client";

import { TodoFilter as FilterType } from "@/types";

interface TodoFilterProps {
  current: FilterType;
  counts: { all: number; active: number; completed: number };
  onChange: (filter: FilterType) => void;
}

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "active", label: "未完了" },
  { value: "completed", label: "完了済み" },
];

export default function TodoFilter({ current, counts, onChange }: TodoFilterProps) {
  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
      {FILTER_OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          style={{
            padding: "8px 16px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: current === value ? "#1a1a2e" : "#ffffff",
            color: current === value ? "#ffffff" : "#333333",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          {label}（{counts[value]}）
        </button>
      ))}
    </div>
  );
}
```

## 4-2. ページにフィルターを追加

`src/app/todos/page.tsx` を更新:

```tsx
"use client";

import { useState, useEffect } from "react";
import { Todo, CreateTodoInput, TodoFilter as FilterType } from "@/types";
import TodoForm from "@/components/TodoForm";
import TodoList from "@/components/TodoList";
import TodoFilter from "@/components/TodoFilter";

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");  // 👈 追加

  useEffect(() => {
    async function fetchTodos() {
      const res = await fetch("/api/todos");
      const data: Todo[] = await res.json();
      setTodos(data);
      setIsLoading(false);
    }
    fetchTodos();
  }, []);

  const handleAdd = async (input: CreateTodoInput) => {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("追加に失敗しました");
    const newTodo: Todo = await res.json();
    setTodos((prev) => [newTodo, ...prev]);
  };

  const handleToggle = async (id: string) => {
    const target = todos.find((t) => t.id === id);
    if (!target) return;

    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !target.completed }),
    });
    if (!res.ok) throw new Error("更新に失敗しました");
    const updated: Todo = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("削除に失敗しました");
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  // 👇 追加：フィルター処理
  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  // 👇 追加：カウント
  const counts = {
    all: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  };

  return (
    <div>
      <h1 style={{ fontSize: "24px", marginBottom: "24px" }}>Todo 一覧</h1>
      <TodoForm onAdd={handleAdd} />
      
      {/* フィルター */}
      <TodoFilter current={filter} counts={counts} onChange={setFilter} />

      {isLoading ? (
        <p style={{ textAlign: "center", color: "#888" }}>読み込み中...</p>
      ) : (
        <TodoList todos={filteredTodos} onToggle={handleToggle} onDelete={handleDelete} />
      )}
    </div>
  );
}
```

## ✅ ステップ4の動作確認

- ✅ 「すべて」ボタン → 全ての Todo が表示
- ✅ 「未完了」ボタン → 未完了のみ表示
- ✅ 「完了済み」ボタン → 完了済みのみ表示
- ✅ 各ボタンの件数が正しい

**動作確認できたら次へ！**

---

# ステップ5: 詳細ページと編集機能

最後に、詳細表示と編集機能を追加します。

## 5-1. API に GET を追加

`src/app/api/todos/[id]/route.ts` に追記:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { Todo, UpdateTodoInput } from "@/types";
import initialTodos from "@/data/todos.json";

let todos: Todo[] = [...initialTodos];

// 👇 追加
export function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return params.then(({ id }) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) {
      return NextResponse.json({ error: "Todo が見つかりません" }, { status: 404 });
    }
    return NextResponse.json(todo);
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Todo が見つかりません" }, { status: 404 });
  }

  const body: UpdateTodoInput = await request.json();
  const updated: Todo = {
    ...todos[index],
    ...(body.title !== undefined && { title: body.title.trim() }),
    ...(body.description !== undefined && { description: body.description.trim() }),
    ...(body.completed !== undefined && { completed: body.completed }),
    updatedAt: new Date().toISOString(),
  };

  todos[index] = updated;
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Todo が見つかりません" }, { status: 404 });
  }

  todos.splice(index, 1);
  return NextResponse.json({ message: "削除しました" });
}
```

## 5-2. TodoItem にリンクを追加

`src/components/TodoItem.tsx` を更新:

```tsx
"use client";

import Link from "next/link";  // 👈 追加
import { Todo } from "@/types";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        borderBottom: "1px solid #eee",
        backgroundColor: todo.completed ? "#f8f9fa" : "#ffffff",
      }}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        style={{ width: "20px", height: "20px", cursor: "pointer" }}
      />

      <div style={{ flex: 1 }}>
        {/* 👇 Link で囲む */}
        <Link
          href={`/todos/${todo.id}`}
          style={{
            textDecoration: todo.completed ? "line-through" : "none",
            color: todo.completed ? "#999" : "#333",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {todo.title}
        </Link>
        {todo.description && (
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>
            {todo.description}
          </p>
        )}
      </div>

      <button
        onClick={() => {
          if (window.confirm("本当に削除しますか？")) {
            onDelete(todo.id);
          }
        }}
        style={{
          padding: "6px 12px",
          backgroundColor: "#e74c3c",
          color: "#ffffff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "13px",
        }}
      >
        削除
      </button>
    </div>
  );
}
```

## 5-3. TodoEditForm を作る

`src/components/TodoEditForm.tsx`:

```tsx
"use client";

import { FormEvent, useState } from "react";
import { Todo, UpdateTodoInput } from "@/types";

interface TodoEditFormProps {
  todo: Todo;
  onSave: (id: string, input: UpdateTodoInput) => Promise<void>;
  onCancel: () => void;
}

export default function TodoEditForm({ todo, onSave, onCancel }: TodoEditFormProps) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (title.trim() === "") {
      setError("タイトルを入力してください");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(todo.id, { title: title.trim(), description: description.trim() });
    } catch {
      setError("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: "12px" }}>
        <label htmlFor="edit-title" style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>
          タイトル
        </label>
        <input
          id="edit-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError("");
          }}
          style={{
            width: "100%",
            padding: "10px",
            border: error ? "2px solid #e74c3c" : "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />
        {error && <p style={{ color: "#e74c3c", fontSize: "13px", marginTop: "4px" }}>{error}</p>}
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label htmlFor="edit-description" style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>
          説明
        </label>
        <textarea
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "16px",
            boxSizing: "border-box",
            resize: "vertical",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="submit"
          disabled={isSaving}
          style={{
            padding: "10px 24px",
            backgroundColor: "#3498db",
            color: "#ffffff",
            border: "none",
            borderRadius: "4px",
            cursor: isSaving ? "not-allowed" : "pointer",
            fontSize: "16px",
          }}
        >
          {isSaving ? "保存中..." : "保存する"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          style={{
            padding: "10px 24px",
            backgroundColor: "#95a5a6",
            color: "#ffffff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
```

## 5-4. 詳細ページを作る

`src/app/todos/[id]/page.tsx`:

```tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Todo, UpdateTodoInput } from "@/types";
import TodoEditForm from "@/components/TodoEditForm";

export default function TodoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [todo, setTodo] = useState<Todo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function fetchTodo() {
      try {
        const res = await fetch(`/api/todos/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Todo が見つかりません");
          } else {
            setError("取得に失敗しました");
          }
          return;
        }
        const data: Todo = await res.json();
        setTodo(data);
      } catch {
        setError("通信エラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTodo();
  }, [id]);

  const handleSave = useCallback(async (_id: string, input: UpdateTodoInput) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("更新に失敗しました");
    const updated: Todo = await res.json();
    setTodo(updated);
    setIsEditing(false);
  }, [id]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm("本当に削除しますか？")) return;
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("削除に失敗しました");
    router.push("/todos");
  }, [id, router]);

  if (isLoading) {
    return <p style={{ textAlign: "center", color: "#888" }}>読み込み中...</p>;
  }

  if (error || !todo) {
    return (
      <div style={{ textAlign: "center", padding: "32px" }}>
        <p style={{ color: "#e74c3c", fontSize: "18px" }}>{error || "Todo が見つかりません"}</p>
        <Link href="/todos" style={{ color: "#3498db" }}>← 一覧に戻る</Link>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div>
        <h1 style={{ fontSize: "24px", marginBottom: "24px" }}>Todo を編集</h1>
        <TodoEditForm todo={todo} onSave={handleSave} onCancel={() => setIsEditing(false)} />
      </div>
    );
  }

  return (
    <div>
      <Link href="/todos" style={{ color: "#3498db", textDecoration: "none", fontSize: "14px" }}>
        ← 一覧に戻る
      </Link>

      <div style={{ marginTop: "16px", padding: "24px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h1 style={{ fontSize: "24px", margin: 0 }}>{todo.title}</h1>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: "12px",
              fontSize: "13px",
              backgroundColor: todo.completed ? "#d4edda" : "#fff3cd",
              color: todo.completed ? "#155724" : "#856404",
            }}
          >
            {todo.completed ? "完了" : "未完了"}
          </span>
        </div>

        {todo.description && (
          <p style={{ color: "#555", lineHeight: 1.6, marginTop: "16px" }}>{todo.description}</p>
        )}

        <div style={{ marginTop: "16px", fontSize: "13px", color: "#999" }}>
          <p>作成日: {new Date(todo.createdAt).toLocaleString("ja-JP")}</p>
          <p>更新日: {new Date(todo.updatedAt).toLocaleString("ja-JP")}</p>
        </div>

        <div style={{ marginTop: "24px", display: "flex", gap: "8px" }}>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: "10px 24px",
              backgroundColor: "#3498db",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            編集する
          </button>
          <button
            onClick={handleDelete}
            style={{
              padding: "10px 24px",
              backgroundColor: "#e74c3c",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}
```

## ✅ ステップ5の動作確認

- ✅ Todo のタイトルをクリック → 詳細ページに遷移
- ✅ 「編集する」ボタン → 編集フォームが表示
- ✅ タイトル・説明を編集して「保存する」→ 更新される
- ✅ 「キャンセル」→ 編集がキャンセルされる
- ✅ 「削除する」→ 削除されて一覧に戻る

---

# 🎉 完成！

すべての機能が動作したら **Todo アプリ完成** です！

## 動作確認チェックリスト

| # | 操作 | 期待される動作 |
|---|------|---------------|
| 1 | ページを開く | モックデータの 3 件が表示される |
| 2 | タイトルを入力して「追加する」 | 新しい Todo がリストの先頭に追加される |
| 3 | タイトル未入力で「追加する」 | バリデーションエラーが表示される |
| 4 | チェックボックスをクリック | 完了/未完了が切り替わる（取り消し線） |
| 5 | フィルター「未完了」をクリック | 未完了の Todo だけ表示される |
| 6 | フィルター「完了済み」をクリック | 完了済みの Todo だけ表示される |
| 7 | Todo タイトルをクリック | 詳細ページに遷移する |
| 8 | 詳細ページで「編集する」 | 編集フォームが表示される |
| 9 | 編集フォームで保存 | 内容が更新されて詳細表示に戻る |
| 10 | 「削除する」→ 確認 OK | 削除されて一覧に戻る |

---

# 技術ふりかえりマップ

ここまでの実装で使った技術を、章と紐づけて整理しましょう。

```
src/types/index.ts
  └── interface, Pick, Partial, type .............. Ch02 TypeScript基礎

src/data/todos.json
  └── モックデータ ................................ Ch10 API Routes

src/app/api/todos/route.ts
  └── GET, POST, NextResponse .................... Ch10 API Routes (Next.js)

src/app/api/todos/[id]/route.ts
  └── 動的ルート, PATCH, DELETE .................. Ch08 ルーティング + Ch10

src/components/Header.tsx
  └── Server Component, Link ..................... Ch09, Ch08

src/components/TodoFilter.tsx
  └── Props, map, 条件付きスタイル ............... Ch04, Ch03

src/components/TodoForm.tsx
  └── フォーム, バリデーション ................... Ch05, Ch11

src/components/TodoItem.tsx
  └── Props, イベント, Link ...................... Ch04, Ch05, Ch08

src/components/TodoList.tsx
  └── リスト, key, 条件分岐 ..................... Ch03

src/components/TodoEditForm.tsx
  └── 制御コンポーネント, フォーム ............... Ch05, Ch11

src/app/todos/page.tsx
  └── Client Component, useState, useEffect ...... Ch05, Ch06, Ch09

src/app/todos/[id]/page.tsx
  └── useParams, useRouter, useEffect ............ Ch08, Ch06
```

---

# 追加チャレンジ（やってみよう）

基本の Todo アプリが動いたら、以下の機能追加に挑戦してみましょう。

### チャレンジ 1: カスタム Hooks でリファクタリング

Chapter 12 で学んだカスタム Hooks を使って、`todos/page.tsx` のロジックを切り出す。

**`src/hooks/useTodos.ts` を作成:**

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { Todo, CreateTodoInput, TodoFilter } from "@/types";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<TodoFilter>("all");

  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch("/api/todos");
    const data: Todo[] = await res.json();
    setTodos(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = useCallback(async (input: CreateTodoInput) => {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("追加に失敗しました");
    const newTodo: Todo = await res.json();
    setTodos((prev) => [newTodo, ...prev]);
  }, []);

  const toggleTodo = useCallback(async (id: string) => {
    const target = todos.find((t) => t.id === id);
    if (!target) return;

    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !target.completed }),
    });
    if (!res.ok) throw new Error("更新に失敗しました");
    const updated: Todo = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, [todos]);

  const deleteTodo = useCallback(async (id: string) => {
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("削除に失敗しました");
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const counts = {
    all: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  };

  return {
    todos: filteredTodos,
    counts,
    isLoading,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
}
```

**ページが超シンプルに:**

```tsx
"use client";

import { useTodos } from "@/hooks/useTodos";
import TodoForm from "@/components/TodoForm";
import TodoList from "@/components/TodoList";
import TodoFilter from "@/components/TodoFilter";

export default function TodosPage() {
  const { todos, counts, isLoading, filter, setFilter, addTodo, toggleTodo, deleteTodo } = useTodos();

  return (
    <div>
      <h1 style={{ fontSize: "24px", marginBottom: "24px" }}>Todo 一覧</h1>
      <TodoForm onAdd={addTodo} />
      <TodoFilter current={filter} counts={counts} onChange={setFilter} />
      {isLoading ? (
        <p style={{ textAlign: "center", color: "#888" }}>読み込み中...</p>
      ) : (
        <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
      )}
    </div>
  );
}
```

### チャレンジ 2: データ共有の改善

現状、`route.ts` と `[id]/route.ts` でデータが共有されていません。  
共有ストアを作って改善しましょう。

**`src/lib/todoStore.ts` を作成:**

```typescript
import { Todo } from "@/types";
import initialTodos from "@/data/todos.json";

let todos: Todo[] = [...initialTodos];

export function getTodos(): Todo[] {
  return todos;
}

export function setTodos(newTodos: Todo[]): void {
  todos = newTodos;
}
```

**各 API で使う:**

```typescript
import { getTodos, setTodos } from "@/lib/todoStore";

export function GET() {
  const todos = getTodos();
  // ...
}
```

### チャレンジ 3: ローカルストレージに保存

API の代わりに、ブラウザのローカルストレージにデータを保存する。  
サーバーが不要になり、ページをリロードしてもデータが消えない。

> **ポイント**: Next.js は SSR（サーバーサイドレンダリング）を行うため、  
> `localStorage` は**ブラウザでのみ存在**する。サーバー側で実行されると `ReferenceError` になる。  
> `useEffect` の中で使うことで、クライアント側でのみ実行されることが保証できる。

#### 3-1. 汎用 `useLocalStorage` フックを作る

`src/hooks/useLocalStorage.ts`:

```typescript
"use client";

import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // SSR 対策: 初期値はそのまま使い、クライアントでは localStorage から読む
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error("localStorage の読み込み失敗:", error);
    }
  }, [key]);

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("localStorage への書き込み失敗:", error);
    }
  };

  return [storedValue, setValue] as const;
}
```

**ポイント解説:**
- `useState<T>(initialValue)` → 型パラメータ `T` で任意の型に対応（ジェネリクス）
- `useEffect` 内で読み込む → SSR 時はスキップ、クライアント初回レンダー後に読む
- `as const` → `[storedValue, setValue]` をタプルとして型推論させる

#### 3-2. `useTodos` を localStorage 版に書き換える

`src/hooks/useTodos.ts` を以下に**全て書き換え**:

```typescript
"use client";

import { useCallback, useMemo } from "react";
import { Todo, CreateTodoInput, TodoFilter, UpdateTodoInput } from "@/types";
import { useLocalStorage } from "./useLocalStorage";
import initialTodos from "@/data/todos.json";

export function useTodos() {
  const [todos, setTodos] = useLocalStorage<Todo[]>("todos", [...initialTodos]);
  const [filter, setFilter] = useLocalStorage<TodoFilter>("todos-filter", "all");

  const addTodo = useCallback((input: CreateTodoInput) => {
    const now = new Date().toISOString();
    const newTodo: Todo = {
      id: String(Date.now()),
      title: input.title.trim(),
      description: input.description?.trim() ?? "",
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    setTodos((prev) => [newTodo, ...prev]);
  }, [setTodos]);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() }
          : t
      )
    );
  }, [setTodos]);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, [setTodos]);

  const updateTodo = useCallback((id: string, input: UpdateTodoInput) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              ...(input.title !== undefined && { title: input.title.trim() }),
              ...(input.description !== undefined && { description: input.description.trim() }),
              ...(input.completed !== undefined && { completed: input.completed }),
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  }, [setTodos]);

  const filteredTodos = useMemo(() => todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  }), [todos, filter]);

  const counts = useMemo(() => ({
    all: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  }), [todos]);

  return {
    todos: filteredTodos,
    allTodos: todos,
    counts,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
  };
}
```

**API 版との違い:**
| | API 版 | localStorage 版 |
|--|--------|----------------|
| データ取得 | `fetch("/api/todos")` | `localStorage.getItem` |
| データ更新 | `fetch(url, { method: "PATCH" })` | `setState` → 自動保存 |
| 非同期処理 | 必要（`async/await`）| 不要（同期処理） |
| サーバー | 必要 | 不要 |

#### 3-3. ページを更新する

`src/app/todos/page.tsx` を更新（`useTodos` フックを使う版に切り替え）:

```tsx
"use client";

import { useTodos } from "@/hooks/useTodos";
import TodoForm from "@/components/TodoForm";
import TodoList from "@/components/TodoList";
import TodoFilter from "@/components/TodoFilter";

export default function TodosPage() {
  const { todos, counts, filter, setFilter, addTodo, toggleTodo, deleteTodo } = useTodos();

  // localStorage 版は非同期でないので onAdd の型を合わせる
  const handleAdd = async (input: Parameters<typeof addTodo>[0]) => {
    addTodo(input);
  };

  return (
    <div>
      <h1 style={{ fontSize: "24px", marginBottom: "24px" }}>Todo 一覧</h1>
      <TodoForm onAdd={handleAdd} />
      <TodoFilter current={filter} counts={counts} onChange={setFilter} />
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
    </div>
  );
}
```

#### 3-4. 詳細ページを更新する

`src/app/todos/[id]/page.tsx` では、`useTodos` の `allTodos` と `updateTodo` を使う:

```tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { UpdateTodoInput } from "@/types";
import TodoEditForm from "@/components/TodoEditForm";
import { useTodos } from "@/hooks/useTodos";

export default function TodoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [isEditing, setIsEditing] = useState(false);

  const { allTodos, updateTodo, deleteTodo } = useTodos();
  const todo = allTodos.find((t) => t.id === id);

  const handleSave = async (_id: string, input: UpdateTodoInput) => {
    updateTodo(id, input);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!window.confirm("本当に削除しますか？")) return;
    deleteTodo(id);
    router.push("/todos");
  };

  if (!todo) {
    return (
      <div style={{ textAlign: "center", padding: "32px" }}>
        <p style={{ color: "#e74c3c", fontSize: "18px" }}>Todo が見つかりません</p>
        <Link href="/todos" style={{ color: "#3498db" }}>← 一覧に戻る</Link>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div>
        <h1 style={{ fontSize: "24px", marginBottom: "24px" }}>Todo を編集</h1>
        <TodoEditForm todo={todo} onSave={handleSave} onCancel={() => setIsEditing(false)} />
      </div>
    );
  }

  return (
    <div>
      <Link href="/todos" style={{ color: "#3498db", textDecoration: "none", fontSize: "14px" }}>
        ← 一覧に戻る
      </Link>
      <div style={{ marginTop: "16px", padding: "24px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h1 style={{ fontSize: "24px" }}>{todo.title}</h1>
        {todo.description && <p style={{ color: "#555" }}>{todo.description}</p>}
        <div style={{ marginTop: "24px", display: "flex", gap: "8px" }}>
          <button onClick={() => setIsEditing(true)} style={{ padding: "10px 24px", backgroundColor: "#3498db", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            編集する
          </button>
          <button onClick={handleDelete} style={{ padding: "10px 24px", backgroundColor: "#e74c3c", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}
```

> ここでチャレンジ 2 との大きな違いに注目。API 版は一覧と詳細でデータが分離していたが、  
> localStorage 版は同じ `useTodos` フックを使うので**データが共有される**。  
> 詳細ページで編集すると一覧にも反映される。

#### ✅ チャレンジ3の動作確認

- ✅ ページをリロードしても Todo が消えない
- ✅ 詳細ページで編集 → 一覧に戻ると反映されている
- ✅ ブラウザの DevTools → Application → Local Storage で保存データを確認できる

---

### チャレンジ 4: 期限（Due Date）を追加

Todo に期限日を追加し、期限切れの Todo を赤色で目立たせる。

#### 4-1. 型定義を更新する

`src/types/index.ts` の `Todo` インターフェースに `dueDate` を追加:

```typescript
export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;          // 👈 追加（任意項目なので ?）
  createdAt: string;
  updatedAt: string;
}

// CreateTodoInput にも追加
export type CreateTodoInput = Pick<Todo, "title" | "description" | "dueDate">;

// UpdateTodoInput にも追加
export type UpdateTodoInput = Partial<Pick<Todo, "title" | "description" | "completed" | "dueDate">>;
```

#### 4-2. モックデータを更新する

`src/data/todos.json` にサンプルの期限日を追加（2件だけ設定し、1件は意図的に期限切れにする）:

```json
[
  {
    "id": "1",
    "title": "Next.js のチュートリアルを完了する",
    "description": "公式ドキュメントの App Router セクションを一通り読む",
    "completed": false,
    "dueDate": "2024-01-20",
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-01-15T09:00:00.000Z"
  },
  {
    "id": "2",
    "title": "TypeScript の型定義を練習する",
    "description": "interface と type の使い分けを理解し、ユーティリティ型を試す",
    "completed": true,
    "dueDate": "2024-01-18",
    "createdAt": "2024-01-14T10:30:00.000Z",
    "updatedAt": "2024-01-15T08:00:00.000Z"
  },
  {
    "id": "3",
    "title": "React Hooks を復習する",
    "description": "useState, useEffect, useRef, useMemo, useCallback を一通り書く",
    "completed": false,
    "createdAt": "2024-01-16T14:00:00.000Z",
    "updatedAt": "2024-01-16T14:00:00.000Z"
  }
]
```

#### 4-3. API を更新する

`src/app/api/todos/route.ts` の POST ハンドラーで `dueDate` を受け取る:

```typescript
export async function POST(request: NextRequest) {
  const body: CreateTodoInput = await request.json();

  if (!body.title || body.title.trim() === "") {
    return NextResponse.json({ error: "タイトルは必須です" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const newTodo: Todo = {
    id: String(Date.now()),
    title: body.title.trim(),
    description: body.description?.trim() ?? "",
    completed: false,
    ...(body.dueDate && { dueDate: body.dueDate }),  // 👈 追加
    createdAt: now,
    updatedAt: now,
  };

  todos.push(newTodo);
  return NextResponse.json(newTodo, { status: 201 });
}
```

`src/app/api/todos/[id]/route.ts` の PATCH ハンドラーにも追加:

```typescript
const updated: Todo = {
  ...todos[index],
  ...(body.title !== undefined && { title: body.title.trim() }),
  ...(body.description !== undefined && { description: body.description.trim() }),
  ...(body.completed !== undefined && { completed: body.completed }),
  ...(body.dueDate !== undefined && { dueDate: body.dueDate }),  // 👈 追加
  updatedAt: new Date().toISOString(),
};
```

#### 4-4. 期限判定のユーティリティを作る

`src/lib/dateUtils.ts` を新規作成:

```typescript
// 今日の日付（時間なし）と比較するためのヘルパー
export function isOverdue(dueDate: string | undefined, completed: boolean): boolean {
  if (!dueDate || completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
```

#### 4-5. TodoItem を更新する

`src/components/TodoItem.tsx` に期限表示と期限切れスタイルを追加:

```tsx
"use client";

import Link from "next/link";
import { Todo } from "@/types";
import { isOverdue, formatDate } from "@/lib/dateUtils";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const overdue = isOverdue(todo.dueDate, todo.completed);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        borderBottom: "1px solid #eee",
        backgroundColor: overdue ? "#fff5f5" : todo.completed ? "#f8f9fa" : "#ffffff",  // 👈 期限切れは薄赤
      }}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        style={{ width: "20px", height: "20px", cursor: "pointer" }}
      />

      <div style={{ flex: 1 }}>
        <Link
          href={`/todos/${todo.id}`}
          style={{
            textDecoration: todo.completed ? "line-through" : "none",
            color: overdue ? "#c0392b" : todo.completed ? "#999" : "#333",  // 👈 期限切れは赤文字
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {todo.title}
        </Link>
        {todo.description && (
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>
            {todo.description}
          </p>
        )}
        {/* 👇 期限表示 */}
        {todo.dueDate && (
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: overdue ? "#c0392b" : "#888" }}>
            {overdue ? "⚠️ 期限切れ: " : "期限: "}
            {formatDate(todo.dueDate)}
          </p>
        )}
      </div>

      <button
        onClick={() => {
          if (window.confirm("本当に削除しますか？")) {
            onDelete(todo.id);
          }
        }}
        style={{
          padding: "6px 12px",
          backgroundColor: "#e74c3c",
          color: "#ffffff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "13px",
        }}
      >
        削除
      </button>
    </div>
  );
}
```

#### 4-6. TodoForm を更新する

`src/components/TodoForm.tsx` に日付入力を追加:

```tsx
// handleSubmit 内の onAdd 呼び出しを更新
await onAdd({ title, description, dueDate: dueDate || undefined });
```

フォームに `dueDate` のステートと入力欄を追加:

```tsx
const [dueDate, setDueDate] = useState("");

// ... JSX の説明入力欄の下に追加 ...
<div style={{ marginBottom: "8px" }}>
  <input
    type="date"
    value={dueDate}
    onChange={(e) => setDueDate(e.target.value)}
    min={new Date().toISOString().split("T")[0]}  // 今日以降のみ選択可
    style={{
      width: "100%",
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      fontSize: "16px",
      boxSizing: "border-box",
    }}
  />
  <p style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>期限日（任意）</p>
</div>
```

また `handleSubmit` 内でリセット時に `setDueDate("")` も追加する。

#### 4-7. TodoEditForm を更新する

`src/components/TodoEditForm.tsx` にも同様に `dueDate` の編集欄を追加:

```tsx
const [dueDate, setDueDate] = useState(todo.dueDate ?? "");

// handleSubmit 内の onSave 呼び出しを更新
await onSave(todo.id, {
  title: title.trim(),
  description: description.trim(),
  dueDate: dueDate || undefined,
});

// JSX に追加（説明欄の下）
<div style={{ marginBottom: "16px" }}>
  <label htmlFor="edit-dueDate" style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>
    期限日
  </label>
  <input
    id="edit-dueDate"
    type="date"
    value={dueDate}
    onChange={(e) => setDueDate(e.target.value)}
    style={{
      width: "100%",
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      fontSize: "16px",
      boxSizing: "border-box",
    }}
  />
</div>
```

#### 4-8. 詳細ページに期限を表示する

`src/app/todos/[id]/page.tsx` の詳細表示部分に期限情報を追加:

```tsx
import { isOverdue, formatDate } from "@/lib/dateUtils";

// 詳細カードの中、作成日の上あたりに追加
{todo.dueDate && (
  <p style={{
    marginTop: "12px",
    color: isOverdue(todo.dueDate, todo.completed) ? "#c0392b" : "#555",
    fontWeight: isOverdue(todo.dueDate, todo.completed) ? "bold" : "normal",
  }}>
    {isOverdue(todo.dueDate, todo.completed) ? "⚠️ 期限切れ: " : "期限: "}
    {formatDate(todo.dueDate)}
  </p>
)}
```

#### ✅ チャレンジ4の動作確認

- ✅ 新しい Todo 追加時に期限日を入力できる
- ✅ 期限が設定された Todo には期限日が表示される
- ✅ 期限切れの Todo（未完了のみ）が赤色で表示される
- ✅ 完了済みの期限切れ Todo は赤くならない（`isOverdue` で `completed` チェック済み）
- ✅ 詳細ページでも期限日の編集・表示ができる

---

# 学習のまとめ

## 身についたこと

| スキル | 具体的にできること |
|--------|-------------------|
| **TypeScript で型を定義** | interface, type, ユーティリティ型を使いこなせる |
| **React コンポーネント設計** | 適切な粒度で分割し、Props で繋げられる |
| **Hooks を活用** | useState / useEffect を使い分けられる |
| **Next.js ルーティング** | ファイルベースルーティングと動的ルートを実装できる |
| **API Routes** | RESTful な API を Next.js 内に実装できる |
| **フォーム実装** | バリデーション付きのフォームを作れる |

## 現場コードを読むための心得

1. **まずファイル構成を見る** → どこに何があるか把握する
2. **型定義を見る** → データの形を理解する
3. **page.tsx から読む** → ページの全体像を掴む
4. **コンポーネントを辿る** → 画面の部品を理解する
5. **API Routes を見る** → サーバー側の処理を理解する

## 次のステップ

- **CSS フレームワーク**: Tailwind CSS を導入してスタイリングを効率化
- **状態管理ライブラリ**: Zustand や Jotai でグローバル状態管理
- **テスト**: Jest + React Testing Library でコンポーネントテスト
- **認証**: NextAuth.js でログイン機能を追加
- **データベース**: Prisma + SQLite で永続化

---

お疲れさまでした！🎉  
**段階的に実装しながら Todo アプリを完成**させました。

各ステップで動作確認しながら進めたので、どの部分がどう動いているか理解しやすかったはずです。  
ここで作った Todo アプリは、現場のプロジェクトの縮小版です。  

**このコードを自在に読み書きできれば、現場のコードも怖くありません。**

---

[← Chapter 12: カスタム Hooks](./12-custom-hooks.md) | [目次に戻る](./README.md)

