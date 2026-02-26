# Chapter 13: 総合演習 ── Todo アプリ開発

## この章のゴール

これまでの全章で学んだ知識を組み合わせて、**CRUD 機能を持つ Todo アプリ**を  
ゼロから実装します。

完成後は「どのファイルがどの役割か」「どのコードがどの技術か」を  
**自分の言葉で説明できる**ことを目指します。

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

## 1. 完成イメージ

```
/todos          → Todo 一覧（追加フォーム + リスト表示）
/todos/[id]     → Todo 詳細・編集ページ
```

### 機能一覧

- ✅ Todo の一覧表示
- ✅ Todo の新規追加（タイトル + 説明）
- ✅ Todo の完了 / 未完了トグル
- ✅ Todo の編集（タイトル + 説明）
- ✅ Todo の削除
- ✅ フィルター（すべて / 未完了 / 完了済み）

---

## 2. ファイル構成

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

## 3. 型定義を作る 【TypeScript】

> **📝 PHP との対応**: PHP の Entity / DTO クラスに相当します。

`src/types/index.ts` を以下の内容に**書き換え**（または追記）します。

```typescript
// Todo の型定義
export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;   // ISO 8601 形式
  updatedAt: string;
}

// 新規作成時の入力（id, createdAt, updatedAt はサーバーが付与）
export type CreateTodoInput = Pick<Todo, "title" | "description">;

// 更新時の入力（部分更新を許容）
export type UpdateTodoInput = Partial<Pick<Todo, "title" | "description" | "completed">>;

// フィルターの種類
export type TodoFilter = "all" | "active" | "completed";
```

**ポイント解説**:

- `Pick<Todo, "title" | "description">` → Todo から `title` と `description` だけを取り出した型（Ch02 で学んだユーティリティ型）
- `Partial<...>` → すべてのプロパティをオプショナル（`?`）にする
- これにより **「新規作成には title 必須」「更新は部分更新OK」** を型で表現

---

## 4. モックデータを用意する

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

---

## 5. API Routes を作る 【Next.js】

### 5-1. 一覧取得 + 新規作成

`src/app/api/todos/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { Todo, CreateTodoInput } from "@/types";
import initialTodos from "@/data/todos.json";

// メモリ上にデータを保持（サーバー再起動でリセットされる）
let todos: Todo[] = [...initialTodos];

// GET /api/todos
export function GET() {
  // 作成日の降順（新しい順）で返す
  const sorted = [...todos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json(sorted);
}

// POST /api/todos
export async function POST(request: NextRequest) {
  const body: CreateTodoInput = await request.json();

  // バリデーション
  if (!body.title || body.title.trim() === "") {
    return NextResponse.json(
      { error: "タイトルは必須です" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const newTodo: Todo = {
    id: String(Date.now()),  // 簡易的なID生成
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

> **📝 PHP との対応**:  
> `GET()` = Laravel の `index()` メソッド  
> `POST()` = Laravel の `store()` メソッド  
> メモリ上の配列 = DB テーブルの代わり

### 5-2. 個別取得 + 更新 + 削除

`src/app/api/todos/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { Todo, UpdateTodoInput } from "@/types";
import initialTodos from "@/data/todos.json";

// ⚠️ 注意: この変数は route.ts と共有されません（モジュールが別）
// 本来は DB や外部ストアを使うが、学習用なので簡易的にここでも初期化
let todos: Todo[] = [...initialTodos];

// 共有ストアにするための関数（後述の改善で差し替え可能）
// ここでは簡易版として同じ初期データを使う

// GET /api/todos/[id]
export function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return params.then(({ id }) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) {
      return NextResponse.json(
        { error: "Todo が見つかりません" },
        { status: 404 }
      );
    }
    return NextResponse.json(todo);
  });
}

// PATCH /api/todos/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    return NextResponse.json(
      { error: "Todo が見つかりません" },
      { status: 404 }
    );
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

// DELETE /api/todos/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    return NextResponse.json(
      { error: "Todo が見つかりません" },
      { status: 404 }
    );
  }

  todos.splice(index, 1);
  return NextResponse.json({ message: "削除しました" });
}
```

> **📝 PHP との対応**:  
> `GET` = `show()` / `PATCH` = `update()` / `DELETE` = `destroy()`  
> `params.id` = Laravel のルートパラメータ `$id`

### 5-3. データ共有の改善（オプション）

上記の 2 ファイルではモジュールが分かれているため、データが共有されません。  
これを解決するには **共有ストアモジュール** を作ります。

`src/lib/todoStore.ts`:

```typescript
import { Todo } from "@/types";
import initialTodos from "@/data/todos.json";

// アプリ全体で共有されるインメモリストア
// （サーバー再起動でリセットされる）
let todos: Todo[] = [...initialTodos];

export function getTodos(): Todo[] {
  return todos;
}

export function setTodos(newTodos: Todo[]): void {
  todos = newTodos;
}
```

**改善後の使い方**:

```typescript
// route.ts 内で
import { getTodos, setTodos } from "@/lib/todoStore";

export function GET() {
  const todos = getTodos();
  // ...
}

export async function POST(request: NextRequest) {
  const todos = getTodos();
  // ... newTodo を作成
  setTodos([...todos, newTodo]);
  // ...
}
```

> 各 API ファイルを `todoStore` を使う形に書き換えれば、  
> 作成・更新・削除がすべてのエンドポイントに反映されます。

---

## 6. カスタム Hooks を作る 【React】

### 6-1. useTodos — Todo の CRUD ロジック

`src/hooks/useTodos.ts`:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { Todo, CreateTodoInput, UpdateTodoInput, TodoFilter } from "@/types";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TodoFilter>("all");

  // ---------- 一覧取得 ----------
  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/todos");
      if (!res.ok) throw new Error("取得に失敗しました");
      const data: Todo[] = await res.json();
      setTodos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // ---------- 新規追加 ----------
  const addTodo = useCallback(async (input: CreateTodoInput) => {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "追加に失敗しました");
    }
    const newTodo: Todo = await res.json();
    // 先頭に追加（新しい順）
    setTodos((prev) => [newTodo, ...prev]);
  }, []);

  // ---------- 完了トグル ----------
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

  // ---------- 更新 ----------
  const updateTodo = useCallback(async (id: string, input: UpdateTodoInput) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("更新に失敗しました");
    const updated: Todo = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  // ---------- 削除 ----------
  const deleteTodo = useCallback(async (id: string) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("削除に失敗しました");
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ---------- フィルター適用 ----------
  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true; // "all"
  });

  // ---------- 集計 ----------
  const counts = {
    all: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  };

  return {
    todos: filteredTodos,
    counts,
    isLoading,
    error,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    refetch: fetchTodos,
  };
}
```

**ポイント解説**:

- `useCallback` で関数をメモ化 → 子コンポーネントの不要な再レンダリングを防止（Ch07）
- `useState` のジェネリクスで型安全（Ch05）
- `useEffect` で初回データ取得（Ch06）
- フィルターロジックもこの Hook に集約 → **コンポーネントはUIに集中**

### 6-2. useForm — フォーム管理ロジック

`src/hooks/useForm.ts`:

```typescript
"use client";

import { useState, useCallback } from "react";

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => Promise<void> | void;
}

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((name: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // 入力時にそのフィールドのエラーをクリア
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    // バリデーション
    if (validate) {
      const validationErrors = validate(values);
      const hasErrors = Object.keys(validationErrors).length > 0;
      if (hasErrors) {
        setErrors(validationErrors);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    setValues,
  };
}
```

---

## 7. コンポーネントを作る 【React】

### 7-1. Header（共通ヘッダー）

`src/components/Header.tsx`:

```tsx
import Link from "next/link";

// Server Component（状態を持たない純粋な表示）
export default function Header() {
  return (
    <header style={{
      backgroundColor: "#1a1a2e",
      color: "#ffffff",
      padding: "16px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}>
      <Link href="/todos" style={{ color: "#ffffff", textDecoration: "none" }}>
        <h1 style={{ margin: 0, fontSize: "20px" }}>📝 Todo App</h1>
      </Link>
      <nav>
        <Link
          href="/todos"
          style={{ color: "#e0e0e0", textDecoration: "none" }}
        >
          Todo 一覧
        </Link>
      </nav>
    </header>
  );
}
```

### 7-2. TodoFilter（フィルターボタン）

`src/components/TodoFilter.tsx`:

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

**ポイント解説**:

- `FilterType` を `TodoFilter` と別名にしているのは、コンポーネント名と型名の衝突を避けるため
- `FILTER_OPTIONS` を配列にして `map` でレンダリング → ボタンが増えてもコード変更は最小限（Ch03）

### 7-3. TodoForm（新規追加フォーム）

`src/components/TodoForm.tsx`:

```tsx
"use client";

import { useRef, FormEvent } from "react";
import { useForm } from "@/hooks/useForm";
import { CreateTodoInput } from "@/types";

interface TodoFormProps {
  onAdd: (input: CreateTodoInput) => Promise<void>;
}

export default function TodoForm({ onAdd }: TodoFormProps) {
  const titleRef = useRef<HTMLInputElement>(null);

  const { values, errors, isSubmitting, handleChange, handleSubmit, reset } =
    useForm<CreateTodoInput & Record<string, unknown>>({
      initialValues: { title: "", description: "" },
      validate: (v) => {
        const errs: Partial<Record<string, string>> = {};
        if (!v.title || (v.title as string).trim() === "") {
          errs.title = "タイトルを入力してください";
        }
        return errs;
      },
      onSubmit: async (v) => {
        await onAdd({
          title: v.title as string,
          description: v.description as string,
        });
        reset();
        // 追加後にタイトル欄にフォーカスを戻す（useRef: Ch07）
        titleRef.current?.focus();
      },
    });

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <form onSubmit={onFormSubmit} style={{ marginBottom: "24px" }}>
      <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>新しい Todo を追加</h2>

      <div style={{ marginBottom: "8px" }}>
        <input
          ref={titleRef}
          type="text"
          placeholder="タイトル（必須）"
          value={values.title as string}
          onChange={(e) => handleChange("title", e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            border: errors.title ? "2px solid #e74c3c" : "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />
        {errors.title && (
          <p style={{ color: "#e74c3c", fontSize: "13px", marginTop: "4px" }}>
            {errors.title}
          </p>
        )}
      </div>

      <div style={{ marginBottom: "8px" }}>
        <input
          type="text"
          placeholder="説明（任意）"
          value={values.description as string}
          onChange={(e) => handleChange("description", e.target.value)}
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

### 7-4. TodoItem（1件の Todo 表示）

`src/components/TodoItem.tsx`:

```tsx
"use client";

import Link from "next/link";
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
      {/* 完了チェックボックス */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        style={{ width: "20px", height: "20px", cursor: "pointer" }}
      />

      {/* タイトル・説明 */}
      <div style={{ flex: 1 }}>
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
          <p style={{
            margin: "4px 0 0",
            fontSize: "13px",
            color: "#888",
          }}>
            {todo.description}
          </p>
        )}
      </div>

      {/* 削除ボタン */}
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

### 7-5. TodoList（リスト表示）

`src/components/TodoList.tsx`:

```tsx
"use client";

import { Todo } from "@/types";
import TodoItem from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <p style={{ textAlign: "center", color: "#888", padding: "32px 0" }}>
        Todo がありません
      </p>
    );
  }

  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: "8px",
      overflow: "hidden",
    }}>
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

### 7-6. TodoEditForm（編集フォーム）

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
      await onSave(todo.id, {
        title: title.trim(),
        description: description.trim(),
      });
    } catch {
      setError("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: "12px" }}>
        <label
          htmlFor="edit-title"
          style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}
        >
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
        {error && (
          <p style={{ color: "#e74c3c", fontSize: "13px", marginTop: "4px" }}>
            {error}
          </p>
        )}
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="edit-description"
          style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}
        >
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

---

## 8. ページを組み立てる 【Next.js】

### 8-1. ルートレイアウトにヘッダーを追加

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

### 8-2. トップページ（ / → /todos へリダイレクト）

`src/app/page.tsx`:

```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/todos");
}
```

### 8-3. Todo 一覧ページ

`src/app/todos/page.tsx`:

```tsx
"use client";

import { useTodos } from "@/hooks/useTodos";
import TodoForm from "@/components/TodoForm";
import TodoList from "@/components/TodoList";
import TodoFilter from "@/components/TodoFilter";

export default function TodosPage() {
  const {
    todos,
    counts,
    isLoading,
    error,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
    deleteTodo,
  } = useTodos();

  return (
    <div>
      <h1 style={{ fontSize: "24px", marginBottom: "24px" }}>Todo 一覧</h1>

      {/* 新規追加フォーム */}
      <TodoForm onAdd={addTodo} />

      {/* フィルター */}
      <TodoFilter current={filter} counts={counts} onChange={setFilter} />

      {/* エラー表示 */}
      {error && (
        <p style={{
          color: "#e74c3c",
          padding: "12px",
          backgroundColor: "#fdf0ef",
          borderRadius: "4px",
        }}>
          ⚠️ {error}
        </p>
      )}

      {/* ローディング or リスト */}
      {isLoading ? (
        <p style={{ textAlign: "center", color: "#888" }}>読み込み中...</p>
      ) : (
        <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
      )}
    </div>
  );
}
```

### 8-4. Todo 詳細・編集ページ

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

  // データ取得
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

  // 更新処理
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

  // 削除処理
  const handleDelete = useCallback(async () => {
    if (!window.confirm("本当に削除しますか？")) return;
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("削除に失敗しました");
    router.push("/todos");
  }, [id, router]);

  // --- ローディング ---
  if (isLoading) {
    return <p style={{ textAlign: "center", color: "#888" }}>読み込み中...</p>;
  }

  // --- エラー ---
  if (error || !todo) {
    return (
      <div style={{ textAlign: "center", padding: "32px" }}>
        <p style={{ color: "#e74c3c", fontSize: "18px" }}>
          {error || "Todo が見つかりません"}
        </p>
        <Link href="/todos" style={{ color: "#3498db" }}>
          ← 一覧に戻る
        </Link>
      </div>
    );
  }

  // --- 編集モード ---
  if (isEditing) {
    return (
      <div>
        <h1 style={{ fontSize: "24px", marginBottom: "24px" }}>Todo を編集</h1>
        <TodoEditForm
          todo={todo}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  // --- 詳細表示 ---
  return (
    <div>
      <Link
        href="/todos"
        style={{ color: "#3498db", textDecoration: "none", fontSize: "14px" }}
      >
        ← 一覧に戻る
      </Link>

      <div style={{
        marginTop: "16px",
        padding: "24px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}>
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
          <p style={{ color: "#555", lineHeight: 1.6, marginTop: "16px" }}>
            {todo.description}
          </p>
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

### 8-5. ローディング表示

`src/app/todos/loading.tsx`:

```tsx
export default function Loading() {
  return (
    <div style={{ textAlign: "center", padding: "48px" }}>
      <p style={{ color: "#888", fontSize: "18px" }}>読み込み中...</p>
    </div>
  );
}
```

---

## 9. 動作確認

```bash
# Docker コンテナ内で開発サーバーを起動
docker compose exec app npm run dev
```

ブラウザで `http://localhost:3000` にアクセスすると、`/todos` にリダイレクトされます。

### 確認チェックリスト

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

## 10. 技術ふりかえりマップ

ここまでの実装で使った技術を、章と紐づけて整理しましょう。

```
src/types/index.ts
  └── interface, Pick, Partial, type .............. Ch02 TypeScript基礎

src/data/todos.json
  └── モックデータ ................................ Ch10 API Routes

src/lib/todoStore.ts
  └── モジュール共有パターン ...................... JavaScript / Node.js

src/app/api/todos/route.ts
  └── GET, POST, NextResponse .................... Ch10 API Routes (Next.js)

src/app/api/todos/[id]/route.ts
  └── 動的ルート, PATCH, DELETE .................. Ch08 ルーティング + Ch10

src/hooks/useTodos.ts
  └── useState, useEffect, useCallback ........... Ch05, Ch06, Ch07, Ch12

src/hooks/useForm.ts
  └── ジェネリクス, useCallback .................. Ch02, Ch07, Ch12

src/components/Header.tsx
  └── Server Component, Link ..................... Ch09, Ch08

src/components/TodoFilter.tsx
  └── Props, map, 条件付きスタイル ............... Ch04, Ch03

src/components/TodoForm.tsx
  └── useRef, フォーム, バリデーション ........... Ch07, Ch11

src/components/TodoItem.tsx
  └── Props, イベント, Link ...................... Ch04, Ch05, Ch08

src/components/TodoList.tsx
  └── リスト, key, 条件分岐 ..................... Ch03

src/components/TodoEditForm.tsx
  └── 制御コンポーネント, フォーム ............... Ch05, Ch11

src/app/todos/page.tsx
  └── Client Component, カスタムHook使用 ......... Ch09, Ch12

src/app/todos/[id]/page.tsx
  └── useParams, useRouter, useEffect ............ Ch08, Ch06
```

---

## 11. 追加チャレンジ（やってみよう）

基本の Todo アプリが動いたら、以下の機能追加に挑戦してみましょう。

### チャレンジ 1: 期限（Due Date）を追加

```typescript
// types/index.ts に追加
export interface Todo {
  // ...既存プロパティ
  dueDate?: string;  // ISO 8601 形式（オプショナル）
}
```

- フォームに日付入力（`<input type="date">`）を追加
- 期限切れの Todo は赤色で表示
- 期限順でソートするフィルターを追加

### チャレンジ 2: カテゴリ（タグ）を追加

```typescript
export interface Todo {
  // ...既存プロパティ
  tags: string[];
}
```

- タグの追加・削除 UI を実装
- タグでフィルタリングする機能を追加

### チャレンジ 3: ローカルストレージに保存

- Ch12 で作った `useLocalStorage` を使う
- API Routes の代わりに、ブラウザのローカルストレージにデータを保存
- ページをリロードしてもデータが消えないことを確認

### チャレンジ 4: ダークモード対応

- Ch07 で学んだ `useContext` で ThemeContext を作成
- ヘッダーにテーマ切り替えボタンを設置
- 全コンポーネントのスタイルをテーマに応じて切り替え

---

## 12. 学習のまとめ

### 身についたこと

この Todo アプリを完成させた時点で、以下の力が身についています。

| スキル | 具体的にできること |
|--------|-------------------|
| **TypeScript で型を定義** | interface, type, ユーティリティ型を使いこなせる |
| **React コンポーネント設計** | 適切な粒度で分割し、Props で繋げられる |
| **Hooks を活用** | useState / useEffect / useRef / useCallback を使い分けられる |
| **カスタム Hooks** | ロジックを切り出して再利用可能にできる |
| **Next.js ルーティング** | ファイルベースルーティングと動的ルートを実装できる |
| **API Routes** | RESTful な API を Next.js 内に実装できる |
| **フォーム実装** | バリデーション付きのフォームを作れる |

### 現場コードを読むための心得

1. **まずファイル構成を見る** → どこに何があるか把握する（Ch01）
2. **型定義を見る** → データの形を理解する（Ch02）
3. **page.tsx から読む** → ページの全体像を掴む（Ch08, Ch09）
4. **コンポーネントを辿る** → 画面の部品を理解する（Ch03, Ch04）
5. **Hooks を読む** → 状態管理とロジックを理解する（Ch05-Ch07, Ch12）
6. **API Routes を見る** → サーバー側の処理を理解する（Ch10）

### 次のステップ

- **CSS フレームワーク**: Tailwind CSS を導入してスタイリングを効率化
- **状態管理ライブラリ**: Zustand や Jotai でグローバル状態管理
- **テスト**: Jest + React Testing Library でコンポーネントテスト
- **認証**: NextAuth.js でログイン機能を追加
- **データベース**: Prisma + SQLite で永続化

---

お疲れさまでした！🎉  
全 14 章を通じて、React + TypeScript + Next.js の基礎を一通り学びました。  
ここで作った Todo アプリは、現場のプロジェクトの縮小版です。  
**このコードを自在に読み書きできれば、現場のコードも怖くありません。**

---

[← Chapter 12: カスタム Hooks](./12-custom-hooks.md) | [目次に戻る](./README.md)
