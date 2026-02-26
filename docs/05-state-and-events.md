# Chapter 05: State（useState）とイベントハンドリング

## この章のゴール

- React の **State（状態管理）** の概念を理解する
- `useState` Hook を使ってコンポーネントの状態を管理できるようになる
- ボタンクリックやテキスト入力などの **イベントハンドリング** を実装できるようになる
- **`"use client"` ディレクティブ** が必要な理由を理解する

## この章で扱う技術

| タグ | 内容 |
|------|------|
| `【React】` | useState, イベントハンドリング, 再レンダリング |
| `【Next.js】` | `"use client"` ディレクティブ |
| `【TypeScript】` | イベント型、ジェネリクス（useState の型引数） |

---

## 5-1. State とは何か？ 【React】

**State（ステート）** は、コンポーネントが**内部で保持する変更可能なデータ**です。

### Props と State の違い

| | Props | State |
|---|-------|-------|
| データの流れ | 親 → 子 | コンポーネント内部 |
| 変更可能？ | ❌ 変更できない（読み取り専用） | ✅ 変更できる |
| 用途 | 外部から設定を渡す | ユーザー操作で変わるデータを管理 |
| 例 | ユーザー名、色、サイズ | 入力フォームの値、開閉状態、カウント |

### なぜ普通の変数ではダメなのか？

```tsx
// ❌ NG: 普通の変数を変えても画面は更新されない
function Counter() {
  let count = 0;

  function handleClick() {
    count += 1;  // 変数は変わるが、画面は再描画されない！
    console.log(count);  // コンソールには表示されるが...
  }

  return <button onClick={handleClick}>カウント: {count}</button>;
  // ↑ 画面は常に "カウント: 0" のまま
}
```

React は **State が変更された時だけ、画面を再描画（再レンダリング）** します。  
普通の変数を変えても React はそれを知る手段がないため、画面が更新されません。

---

## 5-2. "use client" ディレクティブ 【Next.js】

**重要**: `useState` を使うにはそのコンポーネントを **Client Component** にする必要があります。

Next.js の App Router では、デフォルトですべてのコンポーネントが **Server Component** です。  
Server Component は サーバー側で実行されるため、ブラウザの機能（ユーザー操作、State）を使えません。

`useState` やイベントハンドリングを使うには、ファイルの先頭に `"use client"` と書きます。

```tsx
"use client"; // ← これを書くと Client Component になる
// 【Next.js】Server Component と Client Component の切り替え

import { useState } from "react";
// ↑ "use client" がないと useState は使えない
```

> **📝 覚えておくこと**:
> - **Server Component（デフォルト）**: データの取得、メタデータの設定など → useState / onClick 使用不可
> - **Client Component（"use client"）**: ユーザー操作、State、ブラウザ API → useState / onClick 使用可能
> - 詳しくは Chapter 09 で学びます

---

## 5-3. useState の基本 【React】

**ファイル: `src/components/Counter.tsx`**（新規作成）

```tsx
"use client"; // 【Next.js】Client Component にする（useState を使うため）

// 【React】useState は React が提供する「Hook」の一つ
import { useState } from "react";

export default function Counter() {
  // 【React】useState の構文
  // const [現在の値, 値を更新する関数] = useState(初期値);
  //
  // 【TypeScript】useState<number>(0) のように型を指定できるが、
  // 初期値から推論されるので、この場合は省略可能
  const [count, setCount] = useState(0);

  // ↑ この1行で以下が得られる:
  // - count: 現在のカウント値（number 型）
  // - setCount: count を更新する関数（(value: number) => void 型）

  return (
    <div style={{ padding: "16px" }}>
      <p>カウント: {count}</p>
      {/* 【React】onClick でボタンクリック時の処理を指定 */}
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(0)}>リセット</button>
    </div>
  );
}
```

**ファイル: `src/app/page.tsx`**（更新）

```tsx
import Counter from "@/components/Counter";

export default function Home() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>State の学習</h1>
      <Counter />
    </div>
  );
}
```

### 動作確認

1. ブラウザでページを開く
2. 「+1」ボタンをクリック → カウントが増える
3. 「-1」ボタンをクリック → カウントが減る
4. 「リセット」ボタンをクリック → 0 に戻る

### 何が起きているか

1. `setCount(count + 1)` が呼ばれる
2. React が「State が変わった」ことを検知する
3. React がコンポーネント関数を **もう一度実行する**（再レンダリング）
4. 新しい `count` の値で JSX が生成される
5. 画面が更新される

---

## 5-4. useState の型を明示する場合 【TypeScript】

初期値から型を推論できない場合（`null` が入りうるなど）は、型引数を明示します。

```tsx
"use client";
import { useState } from "react";

export default function Example() {
  // 初期値が null の場合、型引数が必要
  // 【TypeScript】ジェネリクスで型を指定
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 文字列リテラルの Union 型
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  // オブジェクト型
  type User = { name: string; email: string };
  const [user, setUser] = useState<User | null>(null);

  return <div>...</div>;
}
```

> **💡 ポイント**: `useState("")` や `useState(0)` のように初期値が明確な場合は型引数を省略してOK。  
> `useState(null)` のように型が不明確な場合は `useState<string | null>(null)` のように書きましょう。

---

## 5-5. イベントハンドリング 【React】

### ボタンのクリックイベント

```tsx
"use client";
import { useState } from "react";

export default function ClickExample() {
  const [message, setMessage] = useState("まだクリックされていません");

  // 【React】イベントハンドラ関数を定義
  // 関数名は `handle〇〇` にするのが慣例
  function handleClick() {
    setMessage("ボタンがクリックされました！");
  }

  // アロー関数でも OK
  const handleReset = () => {
    setMessage("まだクリックされていません");
  };

  return (
    <div>
      <p>{message}</p>
      {/* 関数の参照を渡す（()を付けない） */}
      <button onClick={handleClick}>クリック</button>
      <button onClick={handleReset}>リセット</button>

      {/* インラインで書くこともできる（短い処理向け） */}
      <button onClick={() => setMessage("インラインで設定！")}>
        インライン
      </button>
    </div>
  );
}
```

> **⚠️ よくあるミス**:
> ```tsx
> // ❌ NG: handleClick() と () を付けると「即実行」されてしまう
> <button onClick={handleClick()}>クリック</button>
>
> // ✅ OK: 関数の「参照」を渡す（呼び出すのではない）
> <button onClick={handleClick}>クリック</button>
> ```

---

## 5-6. テキスト入力のイベント 【React / TypeScript】

**ファイル: `src/components/TextInput.tsx`**（新規作成）

```tsx
"use client";
import { useState } from "react";

export default function TextInput() {
  const [inputValue, setInputValue] = useState("");
  const [submittedValue, setSubmittedValue] = useState("");

  // 【React / TypeScript】onChange イベントの型
  // React.ChangeEvent<HTMLInputElement> は React が定める型
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    // event.target.value で入力された値を取得
    setInputValue(event.target.value);
  }

  function handleSubmit() {
    setSubmittedValue(inputValue);
    setInputValue(""); // 入力欄をクリア
  }

  return (
    <div style={{ padding: "16px" }}>
      <h3>テキスト入力</h3>

      {/* 【React】value と onChange を組み合わせる = 制御コンポーネント */}
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="名前を入力してください"
        style={{ padding: "8px", marginRight: "8px" }}
      />

      <button onClick={handleSubmit}>送信</button>

      {/* リアルタイムに入力値を表示 */}
      <p>入力中: {inputValue}</p>

      {/* 送信された値を表示 */}
      {submittedValue && (
        <p style={{ color: "green" }}>送信された値: {submittedValue}</p>
      )}
    </div>
  );
}
```

**ファイル: `src/app/page.tsx`**（更新）

```tsx
import Counter from "@/components/Counter";
import TextInput from "@/components/TextInput";

export default function Home() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>State とイベントの学習</h1>
      <Counter />
      <hr />
      <TextInput />
    </div>
  );
}
```

### 制御コンポーネント（Controlled Component）【React】

上の `<input>` のように、**React の State で入力値を管理するパターン**を**制御コンポーネント**と呼びます。

```tsx
<input
  value={inputValue}      // ← State の値を表示
  onChange={handleChange}  // ← 入力があったら State を更新
/>
```

- `value` = State の値を反映
- `onChange` = ユーザーの入力でStateを更新

この2つがセットになることで、**React が入力値を完全にコントロール**します。

---

## 5-7. よく使うイベントの型一覧 【React / TypeScript】

| イベント | JSX 属性 | TypeScript の型 |
|---------|---------|----------------|
| クリック | `onClick` | `React.MouseEvent<HTMLButtonElement>` |
| テキスト入力 | `onChange` | `React.ChangeEvent<HTMLInputElement>` |
| セレクトボックス | `onChange` | `React.ChangeEvent<HTMLSelectElement>` |
| テキストエリア | `onChange` | `React.ChangeEvent<HTMLTextAreaElement>` |
| フォーム送信 | `onSubmit` | `React.FormEvent<HTMLFormElement>` |
| キー入力 | `onKeyDown` | `React.KeyboardEvent<HTMLInputElement>` |
| フォーカス | `onFocus` / `onBlur` | `React.FocusEvent<HTMLInputElement>` |

> **💡 Tip**: 型を覚える必要はありません。  
> VS Code でイベントハンドラの `event` にマウスをホバーすると、推論された型が表示されます。

---

## 5-8. State の更新に関する注意点 【React】

### 注意 1: State の更新は非同期

```tsx
function handleClick() {
  setCount(count + 1);
  console.log(count); // ← まだ古い値が表示される！（更新は非同期）
}
```

### 注意 2: オブジェクトや配列の State は「新しいオブジェクト」で置き換える

```tsx
"use client";
import { useState } from "react";

type User = { name: string; age: number };

function UserEditor() {
  const [user, setUser] = useState<User>({ name: "田中", age: 30 });

  function handleAgeUp() {
    // ❌ NG: オブジェクトを直接変更しても React は検知できない
    // user.age += 1;
    // setUser(user);

    // ✅ OK: 新しいオブジェクトを作って渡す（スプレッド構文を使う）
    setUser({ ...user, age: user.age + 1 });
    // { ...user } で既存のプロパティをすべてコピーし、age だけ上書きする
  }

  return (
    <div>
      <p>{user.name}（{user.age}歳）</p>
      <button onClick={handleAgeUp}>1歳増やす</button>
    </div>
  );
}
```

### 注意 3: 配列の State も同様

```tsx
const [items, setItems] = useState<string[]>(["A", "B", "C"]);

// 追加
setItems([...items, "D"]);

// 削除（filter で新しい配列を返す）
// filterでB以外を残す = B を削除
setItems(items.filter((item) => item !== "B"));

// 更新（map で新しい配列を返す）
// mapで要素をすべて返すが、"A" のみ "A+" に置き換える（三項演算子を使用）
setItems(items.map((item) => (item === "A" ? "A+" : item)));
```

> **💡 ポイント**: React では State のオブジェクトや配列を**直接変更（ミューテーション）しない**。  
> 必ず**新しいオブジェクト/配列を作って `set` 関数に渡す**。これを **イミュータブル（不変）な更新** と呼びます。

---

## 5-9. 実践：Todo リストを作ってみよう

簡単な Todo リストを作って、State とイベントの使い方を総合的に練習しましょう。

**ファイル: `src/components/TodoList.tsx`**（新規作成）

```tsx
"use client";
import { useState } from "react";

// 【TypeScript】Todo の型定義
type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

export default function TodoList() {
  // 【React】複数の State を管理
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");

  // Todo を追加する
  function handleAdd() {
    if (inputValue.trim() === "") return; // 空文字は追加しない

    const newTodo: Todo = {
      id: Date.now(), // ユニークな ID（簡易的に現在時刻を使う）
      text: inputValue,
      completed: false,
    };

    // 【React】配列の State を更新（スプレッド構文で新しい配列を作る）
    setTodos([...todos, newTodo]);
    setInputValue(""); // 入力欄をクリア
  }

  // Todo の完了状態を切り替える
  function handleToggle(id: number) {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

  // Todo を削除する
  function handleDelete(id: number) {
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  // 【React】Enter キーで追加
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      handleAdd();
    }
  }

  return (
    <div style={{ padding: "16px", maxWidth: "500px" }}>
      <h2>Todo リスト</h2>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="やることを入力..."
          style={{ flex: 1, padding: "8px" }}
        />
        <button onClick={handleAdd}>追加</button>
      </div>

      {/* Todo がない場合のメッセージ */}
      {todos.length === 0 && (
        <p style={{ color: "#999" }}>まだ Todo がありません</p>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => (
          <li
            key={todo.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px",
              borderBottom: "1px solid #eee",
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id)}
            />
            <span
              style={{
                flex: 1,
                textDecoration: todo.completed ? "line-through" : "none",
                color: todo.completed ? "#999" : "#333",
              }}
            >
              {todo.text}
            </span>
            <button
              onClick={() => handleDelete(todo.id)}
              style={{ color: "red", border: "none", cursor: "pointer" }}
            >
              削除
            </button>
          </li>
        ))}
      </ul>

      {/* 統計情報 */}
      {todos.length > 0 && (
        <p style={{ fontSize: "14px", color: "#666" }}>
          合計: {todos.length} 件 / 完了: {todos.filter((t) => t.completed).length} 件
        </p>
      )}
    </div>
  );
}
```

**ファイル: `src/app/page.tsx`**（更新）

```tsx
import TodoList from "@/components/TodoList";

export default function Home() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>Todo アプリ</h1>
      <TodoList />
    </div>
  );
}
```

---

## 5-10. 子から親へデータを渡す（コールバック Props） 【React】

Props は親→子の一方通行ですが、**関数を Props として渡す**ことで、子コンポーネントから親にデータを通知できます。

```tsx
// 親コンポーネント
"use client";
import { useState } from "react";

function Parent() {
  const [selectedColor, setSelectedColor] = useState("未選択");

  // 子に渡す関数（コールバック）
  function handleColorSelect(color: string) {
    setSelectedColor(color);
  }

  return (
    <div>
      <p>選択された色: {selectedColor}</p>
      {/* 関数を Props として渡す */}
      <ColorPicker onSelect={handleColorSelect} />
    </div>
  );
}

// 子コンポーネント
type ColorPickerProps = {
  onSelect: (color: string) => void;  // 【TypeScript】関数の型
};

function ColorPicker({ onSelect }: ColorPickerProps) {
  return (
    <div>
      <button onClick={() => onSelect("赤")}>赤</button>
      <button onClick={() => onSelect("青")}>青</button>
      <button onClick={() => onSelect("緑")}>緑</button>
    </div>
  );
}
```

### ポイント

- 関数の Props 名は慣例的に `on〇〇`（例: `onSelect`, `onChange`, `onSubmit`）
- TypeScript の型: `(引数: 型) => void` で関数の型を表す
- 子コンポーネントの中で親から渡された関数を呼ぶと、親の State が更新される

---

## この章のまとめ

| 概念 | 技術 | 一言で |
|------|------|-------|
| State | 【React】 | コンポーネント内部で管理する変更可能なデータ |
| useState | 【React】 | State を宣言する Hook。`[値, 更新関数] = useState(初期値)` |
| "use client" | 【Next.js】 | Client Component にするための宣言。useState / イベントに必要 |
| イベントハンドリング | 【React】 | `onClick`, `onChange` などでユーザー操作を処理 |
| 制御コンポーネント | 【React】 | `value` + `onChange` で React が入力値を管理 |
| イミュータブル更新 | 【React】 | State のオブジェクト/配列は直接変更せず、新しく作って渡す |
| コールバック Props | 【React】 | 関数を Props として渡し、子→親にデータを通知 |
| イベント型 | 【TypeScript】 | `React.ChangeEvent<HTMLInputElement>` など |

---

**前の章**: [Chapter 04: Props と型定義](./04-props-and-types.md)  
**次の章**: [Chapter 06: useEffect と副作用](./06-useeffect.md)
