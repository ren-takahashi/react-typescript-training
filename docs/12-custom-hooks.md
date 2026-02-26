# Chapter 12: カスタム Hooks で共通ロジックを切り出す

## この章のゴール

- **カスタム Hook** とは何か、なぜ必要かを理解する
- 共通のロジックを Hook として切り出す方法を覚える
- 実用的なカスタム Hook を作って使えるようになる
- Hook のルールを理解する

## この章で扱う技術

| タグ | 内容 |
|------|------|
| `【React】` | カスタム Hooks, Hooks のルール |
| `【TypeScript】` | ジェネリクス、戻り値の型 |

---

## 12-1. カスタム Hook とは？ 【React】

**カスタム Hook** は、React の Hook（useState, useEffect など）を組み合わせて作る  
**再利用可能なロジック**です。

### なぜカスタム Hook が必要か？

複数のコンポーネントで同じロジックが繰り返される場合、カスタム Hook に切り出します。

```tsx
// ❌ 同じロジックが複数のコンポーネントに散らばる
function UserList() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => { /* fetch処理 */ }, []);
  // ...
}

function PostList() {
  const [data, setData] = useState(null);    // 同じ
  const [isLoading, setIsLoading] = useState(true);  // 同じ
  const [error, setError] = useState(null);   // 同じ
  useEffect(() => { /* fetch処理 */ }, []);   // 同じ
  // ...
}

// ✅ カスタム Hook に切り出す
function UserList() {
  const { data, isLoading, error } = useFetch<User[]>("/api/users");
  // ...
}

function PostList() {
  const { data, isLoading, error } = useFetch<Post[]>("/api/posts");
  // ...
}
```

> **💡 PHP と比較**: Service クラスや Trait でロジックを共通化するのに似ています。

### カスタム Hook のルール

1. **関数名は `use` で始める**（React がHookだと認識するために必須）
2. 内部で React の Hook を呼び出せる
3. コンポーネントまたは別の Hook の中からのみ呼び出せる（通常の関数からは呼べない）

---

## 12-2. 実践 1: useToggle（真偽値の切替）

最もシンプルなカスタム Hook から始めましょう。

**ファイル: `src/hooks/useToggle.ts`**（新規作成）

```typescript
"use client";
// 【React】カスタム Hook: 真偽値を切り替える
import { useState, useCallback } from "react";

// 【TypeScript】戻り値の型を明示
type UseToggleReturn = {
  value: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
};

export function useToggle(initialValue: boolean = false): UseToggleReturn {
  const [value, setValue] = useState(initialValue);

  // 【React】useCallback で関数をメモ化
  const toggle = useCallback(() => setValue((prev) => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
}
```

**使用例コンポーネント:**

**ファイル: `src/components/ToggleExample.tsx`**（新規作成）

```tsx
"use client";
import { useToggle } from "@/hooks/useToggle";

export default function ToggleExample() {
  const modal = useToggle(false);
  const darkMode = useToggle(false);

  return (
    <div>
      <h3>useToggle の使用例</h3>

      <button onClick={modal.toggle}>
        モーダル: {modal.value ? "開いている" : "閉じている"}
      </button>

      <button onClick={darkMode.toggle}>
        ダークモード: {darkMode.value ? "ON" : "OFF"}
      </button>

      {modal.value && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            backgroundColor: "#fff",
            padding: "24px",
            borderRadius: "8px",
          }}>
            <h3>モーダルの中身</h3>
            <p>カスタム Hook でモーダルの開閉を管理しています。</p>
            <button onClick={modal.setFalse}>閉じる</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**ページで使用する:**

**ファイル: `src/app/hooks-demo/toggle/page.tsx`**（新規作成）

```tsx
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
```

---

## 12-3. 実践 2: useFetch（データ取得の共通化）

**ファイル: `src/hooks/useFetch.ts`**（新規作成）

```typescript
"use client";
import { useState, useEffect } from "react";

// 【TypeScript】ジェネリクスで戻り値のデータ型を柔軟にする
type UseFetchReturn<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

// 【React】カスタム Hook: API からデータを取得する
export function useFetch<T>(url: string): UseFetchReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);

  useEffect(() => {
    // アンマウント時にリクエストをキャンセルするためのフラグ
    let isCancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // コンポーネントがまだマウントされている場合のみ State を更新
        if (!isCancelled) {
          // result.data がある場合はそれを使い、なければ result をそのまま使う
          setData(result.data !== undefined ? result.data : result);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "不明なエラー");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    // 【React】クリーンアップ: コンポーネントがアンマウントされたらキャンセル
    return () => {
      isCancelled = true;
    };
  }, [url, fetchCount]); // url か fetchCount が変わったら再取得

  // 再取得関数
  function refetch() {
    setFetchCount((prev) => prev + 1);
  }

  return { data, isLoading, error, refetch };
}
```

**使用例コンポーネント:**

**ファイル: `src/components/UserListWithHook.tsx`**（新規作成）

```tsx
"use client";
import { useFetch } from "@/hooks/useFetch";
import type { User } from "@/types";

export default function UserListWithHook() {
  // 【React】カスタム Hook を使うと、3行でデータ取得が完了！
  const { data: users, isLoading, error, refetch } = useFetch<User[]>("/api/users");

  if (isLoading) return <p>読み込み中...</p>;
  if (error) return <p style={{ color: "red" }}>エラー: {error}</p>;
  if (!users) return <p>データがありません</p>;

  return (
    <div>
      <h3>ユーザー一覧（useFetch使用）</h3>
      <button onClick={refetch}>再読み込み</button>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}（{user.role}）</li>
        ))}
      </ul>
    </div>
  );
}
```

**ページで使用する:**

**ファイル: `src/app/hooks-demo/fetch/page.tsx`**（新規作成）

```tsx
import UserListWithHook from "@/components/UserListWithHook";
import Link from "next/link";

export default function FetchDemoPage() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>useFetch デモ</h1>
      <UserListWithHook />
      <div style={{ marginTop: "16px" }}>
        <Link href="/">← ホームに戻る</Link>
      </div>
    </div>
  );
}
```

---

## 12-4. 実践 3: useLocalStorage（ブラウザに値を保存）

**ファイル: `src/hooks/useLocalStorage.ts`**（新規作成）

```typescript
"use client";
import { useState, useEffect } from "react";

// 【React】カスタム Hook: localStorage とStateを同期する
// 【TypeScript】ジェネリクスで保存するデータの型を指定
export function useLocalStorage<T>(key: string, initialValue: T) {
  // 初期値の取得: localStorage にデータがあればそれを使う
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Server Component では window が存在しないため、チェックが必要
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // 値が変わるたびに localStorage に保存
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error("localStorage への保存に失敗:", error);
    }
  }, [key, storedValue]);

  // useState と同じインターフェースで返す
  return [storedValue, setStoredValue] as const;
  // 【TypeScript】as const: タプル型として推論させる
  // これがないと (T | SetStateAction<T>)[] という配列型になる
}
```

**使用例コンポーネント:**

**ファイル: `src/components/SettingsWithStorage.tsx`**（新規作成）

```tsx
"use client";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function SettingsWithStorage() {
  // 【React】useState と同じように使えるが、値がブラウザに保存される
  const [fontSize, setFontSize] = useLocalStorage("fontSize", 16);
  const [userName, setUserName] = useLocalStorage("userName", "");

  return (
    <div>
      <h3>設定（ブラウザに保存されます）</h3>

      <div style={{ marginBottom: "16px" }}>
        <label>フォントサイズ: {fontSize}px</label>
        <br />
        <input
          type="range"
          min={12}
          max={24}
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label>ユーザー名:</label>
        <br />
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </div>

      <p style={{ fontSize: `${fontSize}px` }}>
        こんにちは、{userName || "ゲスト"}さん！（このテキストのサイズが変わります）
      </p>

      <p style={{ color: "#666", fontSize: "14px" }}>
        ※ ブラウザをリロードしても設定が保持されます
      </p>
    </div>
  );
}
```

**ページで使用する:**

**ファイル: `src/app/hooks-demo/storage/page.tsx`**（新規作成）

```tsx
import SettingsWithStorage from "@/components/SettingsWithStorage";
import Link from "next/link";

export default function StorageDemoPage() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>useLocalStorage デモ</h1>
      <SettingsWithStorage />
      <div style={{ marginTop: "16px" }}>
        <Link href="/">← ホームに戻る</Link>
      </div>
    </div>
  );
}
```

---

## 12-5. 実践 4: useDebounce（入力の遅延処理）

**ファイル: `src/hooks/useDebounce.ts`**（新規作成）

```typescript
"use client";
import { useState, useEffect } from "react";

// 【React】カスタム Hook: 値の変更を遅延させる（デバウンス）
// Chapter 06 で学んだデバウンスを再利用可能な Hook として抽出
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // delay ミリ秒後に値を更新
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // value が変わったら前のタイマーをキャンセル
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

**使用例コンポーネント:**

**ファイル: `src/components/DebouncedSearch.tsx`**（新規作成）

```tsx
"use client";
import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useFetch } from "@/hooks/useFetch";
import type { User } from "@/types";

export default function DebouncedSearch() {
  const [searchTerm, setSearchTerm] = useState("");

  // 【React】入力値を 500ms 遅延させる
  // ユーザーがタイピングを止めてから 500ms 後に API を呼ぶ
  const debouncedSearch = useDebounce(searchTerm, 500);

  // デバウンスされた値で API を呼ぶ
  const { data: users, isLoading } = useFetch<User[]>(
    `/api/users${debouncedSearch ? `?name=${debouncedSearch}` : ""}`
  );

  return (
    <div>
      <h3>デバウンス検索</h3>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="ユーザーを検索..."
        style={{ padding: "8px", width: "300px", marginBottom: "16px" }}
      />

      <p style={{ fontSize: "14px", color: "#666" }}>
        入力値: &quot;{searchTerm}&quot; / API送信値: &quot;{debouncedSearch}&quot;
      </p>

      {isLoading && <p>検索中...</p>}

      {users && (
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.name}（{user.role}）</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

**ページで使用する:**

**ファイル: `src/app/hooks-demo/debounce/page.tsx`**（新規作成）

```tsx
import DebouncedSearch from "@/components/DebouncedSearch";
import Link from "next/link";

export default function DebounceDemoPage() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>useDebounce デモ</h1>
      <DebouncedSearch />
      <div style={{ marginTop: "16px" }}>
        <Link href="/">← ホームに戻る</Link>
      </div>
    </div>
  );
}
```

**全デモページへのナビゲーション:**

**ファイル: `src/app/hooks-demo/page.tsx`**（新規作成）

```tsx
import Link from "next/link";

export default function HooksDemoPage() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>カスタム Hooks デモ</h1>
      <p>Chapter 12 で作成したカスタム Hooks の動作を確認できます。</p>

      <nav style={{ marginTop: "24px" }}>
        <h2>デモ一覧</h2>
        <ul>
          <li style={{ marginBottom: "8px" }}>
            <Link href="/hooks-demo/toggle">useToggle - 真偽値の切替</Link>
          </li>
          <li style={{ marginBottom: "8px" }}>
            <Link href="/hooks-demo/fetch">useFetch - データ取得</Link>
          </li>
          <li style={{ marginBottom: "8px" }}>
            <Link href="/hooks-demo/storage">useLocalStorage - ブラウザに保存</Link>
          </li>
          <li style={{ marginBottom: "8px" }}>
            <Link href="/hooks-demo/debounce">useDebounce - 入力の遅延処理</Link>
          </li>
        </ul>
      </nav>

      <div style={{ marginTop: "16px" }}>
        <Link href="/">← ホームに戻る</Link>
      </div>
    </div>
  );
}
```

---

## 12-6. Hooks のルール 【React】

カスタム Hook を作る際に守るべきルールがあります。

### ルール 1: Hook は関数のトップレベルで呼ぶ

```tsx
// ❌ NG: 条件分岐の中で Hook を使わない
function MyComponent({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (isLoggedIn) {
    const [name, setName] = useState(""); // ← NG！
  }
}

// ❌ NG: ループの中で Hook を使わない
function MyComponent({ items }: { items: string[] }) {
  for (const item of items) {
    const [value, setValue] = useState(item); // ← NG！
  }
}

// ✅ OK: 常にトップレベルで呼ぶ
function MyComponent({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [name, setName] = useState("");
  // 条件分岐は Hook の「後」で行う
  if (!isLoggedIn) return <p>ログインしてください</p>;
  return <p>{name}</p>;
}
```

### ルール 2: Hook はコンポーネントかカスタム Hook の中でのみ使う

```tsx
// ❌ NG: 通常の関数の中で使わない
function formatData() {
  const [data, setData] = useState(null); // ← NG！
}

// ✅ OK: コンポーネントの中で使う
function MyComponent() {
  const [data, setData] = useState(null); // ← OK
}

// ✅ OK: カスタム Hook の中で使う（関数名が use で始まる）
function useMyData() {
  const [data, setData] = useState(null); // ← OK
}
```

---

## 12-7. hooks ディレクトリの構成

```
src/hooks/
├── useToggle.ts          ← 真偽値の切替
├── useFetch.ts           ← API データ取得
├── useLocalStorage.ts    ← ブラウザへのデータ保存
├── useDebounce.ts        ← 入力の遅延処理
└── index.ts              ← 再エクスポート（任意）
```

**ファイル: `src/hooks/index.ts`**（新規作成・任意）

```typescript
// 【JavaScript / TypeScript】まとめて export すると import が楽になる
export { useToggle } from "./useToggle";
export { useFetch } from "./useFetch";
export { useLocalStorage } from "./useLocalStorage";
export { useDebounce } from "./useDebounce";
```

```tsx
// 個別に import する場合
import { useToggle } from "@/hooks/useToggle";
import { useFetch } from "@/hooks/useFetch";

// まとめて import する場合（index.ts がある場合）
import { useToggle, useFetch } from "@/hooks";
```

---

## この章のまとめ

| カスタム Hook | 用途 | 技術 |
|-------------|------|------|
| useToggle | 真偽値の切替（モーダル、メニュー） | 【React】 |
| useFetch | API データ取得の共通化 | 【React】 |
| useLocalStorage | ブラウザに設定値を保存 | 【React + JavaScript】 |
| useDebounce | 入力の遅延処理 | 【React】 |

### 重要な理解

- カスタム Hook は `use` で始まる関数
- **ロジックの再利用**が目的（UIの再利用はコンポーネント）
- React の Hook のルール（トップレベル、コンポーネントかHookの中でのみ）を守る
- ジェネリクスを使うと、型安全で汎用的な Hook が作れる

---

**前の章**: [Chapter 11: フォーム実装とバリデーション](./11-forms-and-validation.md)  
**次の章**: [Chapter 13: 総合演習 ― Todo アプリ開発](./13-final-exercise.md)
