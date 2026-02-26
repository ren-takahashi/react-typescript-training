# Chapter 06: useEffect と副作用

## この章のゴール

- **副作用（Side Effect）** の概念を理解する
- `useEffect` Hook の使い方と依存配列を理解する
- クリーンアップ関数の役割を理解する
- よくある `useEffect` の使用パターンを実装する

## この章で扱う技術

| タグ | 内容 |
|------|------|
| `【React】` | useEffect, 副作用, クリーンアップ |
| `【JavaScript】` | setInterval, fetch, addEventListener |
| `【Next.js】` | `"use client"`（useEffect は Client Component でのみ使用） |

---

## 6-1. 副作用（Side Effect）とは？ 【React】

React コンポーネントの主な仕事は **UI の描画（レンダリング）** です。  
それ以外の処理、つまり **レンダリングに直接関係ない処理** を **副作用（Side Effect）** と呼びます。

### 副作用の例

| 副作用の種類 | 具体例 |
|------------|--------|
| データ取得 | API にリクエストを送る |
| DOM の操作 | ドキュメントのタイトルを変更する |
| タイマー | `setInterval` / `setTimeout` |
| イベント登録 | `window.addEventListener` |
| ログ出力 | `console.log` で状態を記録する |
| 外部ストレージ | `localStorage` への読み書き |

これらの処理をレンダリングの中に直接書くと問題が起きます。  
`useEffect` を使って、**レンダリングとは分離して安全に実行**します。

> **💡 PHP と比較**: PHP のコンストラクタやフックに似た概念です。  
> 「この処理はページ表示時に1回だけ実行したい」「条件が変わったら再実行したい」といった制御ができます。

---

## 6-2. useEffect の基本構文 【React】

```tsx
"use client";
import { useEffect } from "react";

function MyComponent() {
  useEffect(() => {
    // ここに副作用の処理を書く
    console.log("副作用が実行された");
  }, [依存する値]); // ← 依存配列（Dependency Array）

  return <div>...</div>;
}
```

### 依存配列による実行タイミングの違い

| 書き方 | 実行タイミング |
|--------|-------------|
| `useEffect(() => { ... }, [])` | **初回レンダリング時のみ**（マウント時） |
| `useEffect(() => { ... }, [count])` | **初回 + `count` が変わるたび** |
| `useEffect(() => { ... })` | **毎回のレンダリング後**（⚠️ 通常使わない） |

---

## 6-3. 実践 1: ドキュメントタイトルを変更する

**ファイル: `src/components/TitleChanger.tsx`**（新規作成）

```tsx
"use client";
import { useState, useEffect } from "react";

export default function TitleChanger() {
  const [count, setCount] = useState(0);

  // 【React】useEffect: count が変わるたびにドキュメントタイトルを更新
  useEffect(() => {
    // 【JavaScript】document.title でブラウザのタブタイトルを変更
    document.title = `カウント: ${count}`;
    console.log(`useEffect 実行: count = ${count}`);
  }, [count]); // ← count が変わるたびに実行

  return (
    <div style={{ padding: "16px" }}>
      <h3>ドキュメントタイトル変更</h3>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <p style={{ fontSize: "14px", color: "#666" }}>
        ブラウザのタブのタイトルが変わるのを確認してください
      </p>
    </div>
  );
}
```

**ファイル: `src/app/page.tsx`**（更新）

```tsx
import TitleChanger from "@/components/TitleChanger";

export default function Home() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>useEffect の学習</h1>
      <TitleChanger />
    </div>
  );
}
```

### 確認ポイント

- ボタンを押すたびにブラウザのタブタイトルが「カウント: 1」「カウント: 2」… と変わる
- ブラウザの DevTools（F12）のコンソールに `useEffect 実行:` のログが出る

---

## 6-4. 実践 2: 初回のみ実行（マウント時）

依存配列を空 `[]` にすると、**コンポーネントが最初に表示された時の 1 回だけ** 実行されます。

**ファイル: `src/components/InitMessage.tsx`**（新規作成）

```tsx
"use client";
import { useState, useEffect } from "react";

export default function InitMessage() {
  const [message, setMessage] = useState("読み込み中...");

  // 【React】空の依存配列 → 初回レンダリング時のみ実行
  useEffect(() => {
    console.log("InitMessage: マウント時に1回だけ実行");

    // 実際の現場では、ここで API からデータを取得することが多い
    // 今回は setTimeout で API 通信をシミュレーション
    const timer = setTimeout(() => {
      setMessage("データの読み込みが完了しました！");
    }, 2000); // 2秒後に実行

    // 【React】クリーンアップ関数（次のセクションで詳しく解説）
    return () => {
      clearTimeout(timer);
    };
  }, []); // ← 空配列 = 初回のみ

  return (
    <div style={{ padding: "16px" }}>
      <h3>初回読み込み</h3>
      <p>{message}</p>
    </div>
  );
}
```

**ファイル: `src/app/page.tsx`**（更新）

```tsx
import TitleChanger from "@/components/TitleChanger";
import InitMessage from "@/components/InitMessage";

export default function Home() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>useEffect の学習</h1>
      <TitleChanger />
      <InitMessage />
    </div>
  );
}

```

---

## 6-5. クリーンアップ関数 【React】

`useEffect` の中で return する関数は **クリーンアップ関数** と呼ばれ、  
以下のタイミングで実行されます。

1. コンポーネントがアンマウント（画面から消える）された時
2. 依存配列の値が変わり、次の effect が実行される直前

### なぜクリーンアップが必要か？

タイマーやイベントリスナーを登録したまま放置すると、  
コンポーネントが消えた後もバックグラウンドで動き続けて **メモリリーク** を起こします。

**ファイル: `src/components/Clock.tsx`**（新規作成）

```tsx
"use client";
import { useState, useEffect } from "react";

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    console.log("Clock: タイマー開始");

    // 【JavaScript】setInterval: 一定間隔で処理を繰り返す
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000); // 1秒ごと

    // 【React】クリーンアップ関数: コンポーネントが消える時にタイマーを解除
    return () => {
      console.log("Clock: タイマー停止（クリーンアップ）");
      clearInterval(intervalId);
    };
  }, []); // 初回のみタイマーを設定

  return (
    <div style={{ padding: "16px" }}>
      <h3>現在時刻</h3>
      <p style={{ fontSize: "24px", fontFamily: "monospace" }}>
        {time.toLocaleTimeString("ja-JP")}
      </p>
    </div>
  );
}
```

**ファイル: `src/app/page.tsx`**（更新）
```tsx
import TitleChanger from "@/components/TitleChanger";
import InitMessage from "@/components/InitMessage";
import Clock from "@/components/Clock"; 

export default function Home() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>useEffect の学習</h1>
      <TitleChanger />
      <InitMessage />
      <Clock />
    </div>
  );
}
```

### クリーンアップが必要な主なケース

| 登録する処理 | クリーンアップ |
|------------|-------------|
| `setInterval(fn, ms)` | `clearInterval(id)` |
| `setTimeout(fn, ms)` | `clearTimeout(id)` |
| `window.addEventListener(event, fn)` | `window.removeEventListener(event, fn)` |
| WebSocket の接続 | `ws.close()` |

---

## 6-6. 実践 3: ウィンドウサイズを監視する

**ファイル: `src/components/WindowSize.tsx`**（新規作成）

```tsx
"use client";
import { useState, useEffect } from "react";

export default function WindowSize() {
  const [windowWidth, setWindowWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    // 初期値を設定
    setWindowWidth(window.innerWidth);
    setWindowHeight(window.innerHeight);

    // 【JavaScript】リサイズイベントを監視
    function handleResize() {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    }

    // イベントリスナーを登録
    window.addEventListener("resize", handleResize);

    // 【React】クリーンアップ: イベントリスナーを解除
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div style={{ padding: "16px" }}>
      <h3>ウィンドウサイズ</h3>
      <p>幅: {windowWidth}px / 高さ: {windowHeight}px</p>
      <p style={{ fontSize: "14px", color: "#666" }}>
        ブラウザのウィンドウをリサイズしてみてください
      </p>
    </div>
  );
}
```

**ファイル: `src/app/page.tsx`**（更新）
```tsx
import TitleChanger from "@/components/TitleChanger";
import InitMessage from "@/components/InitMessage";
import Clock from "@/components/Clock";
import WindowSize from "@/components/WindowSize";

export default function Home() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>useEffect の学習</h1>
      <TitleChanger />
      <InitMessage />
      <Clock />
      <WindowSize />
    </div>
  );
}
```

---

## 6-7. 実践 4: 依存配列に値を入れる

検索ワードが変わるたびに API を呼ぶ（今回はシミュレーション）パターンです。

**ファイル: `src/components/SearchSimulator.tsx`**（新規作成）

```tsx
"use client";
import { useState, useEffect } from "react";

export default function SearchSimulator() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 【React】searchTerm が変わるたびに「検索」を実行
  useEffect(() => {
    // 空文字の場合は検索しない
    if (searchTerm.trim() === "") {
      setResults([]);
      return;
    }

    setIsLoading(true);
    console.log(`検索中: "${searchTerm}"`);

    // API 通信のシミュレーション（500ms 後に結果を返す）
    const timer = setTimeout(() => {
      // ダミーの検索結果を生成
      const dummyResults = [
        `${searchTerm}に関する記事1`,
        `${searchTerm}の使い方`,
        `${searchTerm}入門ガイド`,
      ];
      setResults(dummyResults);
      setIsLoading(false);
    }, 500);

    // 【React】クリーンアップ: 前回のタイマーをキャンセル
    // これにより、素早く入力した場合に不要な「検索」が実行されない
    // （デバウンスの簡易的な実装）
    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]); // ← searchTerm が変わるたびに実行

  return (
    <div style={{ padding: "16px" }}>
      <h3>検索シミュレーション</h3>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="検索ワードを入力..."
        style={{ padding: "8px", width: "300px" }}
      />

      {isLoading && <p>検索中...</p>}

      {!isLoading && results.length > 0 && (
        <ul>
          {results.map((result, index) => (
            <li key={index}>{result}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

**ファイル: `src/app/page.tsx`**（更新）
```tsx
import TitleChanger from "@/components/TitleChanger";
import InitMessage from "@/components/InitMessage";
import Clock from "@/components/Clock";
import WindowSize from "@/components/WindowSize";
import SearchSimulator from "@/components/SearchSimulator";

export default function Home() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>useEffect の学習</h1>
      <TitleChanger />
      <InitMessage />
      <Clock />
      <WindowSize />
      <SearchSimulator />
    </div>
  );
}
```

### デバウンスのポイント

上のコードでは、`searchTerm` が変わるたびに前のタイマーをキャンセルして新しいタイマーを開始します。  
これにより、ユーザーが素早くタイプしている間は検索が実行されず、  
**入力が止まってから 500ms 後に検索が実行**されます。

```
入力: "R" → タイマー開始（500ms）
入力: "Re" → 前のタイマーをキャンセル → 新しいタイマー開始（500ms）
入力: "Rea" → 前のタイマーをキャンセル → 新しいタイマー開始（500ms）
入力: "Reac" → 前のタイマーをキャンセル → 新しいタイマー開始（500ms）
入力: "React" → 前のタイマーをキャンセル → 新しいタイマー開始（500ms）
[500ms 経過] → "React" で検索実行！
```

---

## 6-8. useEffect のよくある間違い

### 間違い 1: 依存配列の漏れ

```tsx
// ❌ NG: count を使っているのに依存配列に入れていない
useEffect(() => {
  console.log(`count is: ${count}`);
}, []); // ← count が変わっても再実行されない

// ✅ OK
useEffect(() => {
  console.log(`count is: ${count}`);
}, [count]);
```

> **💡 Tip**: ESLint の `react-hooks/exhaustive-deps` ルールが、  
> 依存配列に漏れがあると警告してくれます。警告は無視しないでください。

### 間違い 2: 依存配列なし（毎回実行）

```tsx
// ⚠️ 注意: 依存配列を書かないと、毎回のレンダリングで実行される
useEffect(() => {
  console.log("毎回実行される"); // 無限ループの原因になりやすい
}); // ← 依存配列がない
```

### 間違い 3: useEffect 内で State を更新して無限ループ

```tsx
// ❌ NG: State を更新 → 再レンダリング → useEffect 実行 → State を更新 → ...
useEffect(() => {
  setCount(count + 1); // 無限ループ！
}, [count]);
```

---

## 6-9. useEffect のフロー図

```
コンポーネントがマウント（画面に表示）
 │
 ├─ レンダリング（JSXを生成）
 │
 └─ useEffect が実行される（初回）
       │
       ├── State が更新される
       │     │
       │     ├─ 再レンダリング（JSXを再生成）
       │     │
       │     └─ 依存配列の値が変わっていたら:
       │           ├─ 前回のクリーンアップを実行
       │           └─ useEffect が再実行される
       │
       └── コンポーネントがアンマウント（画面から消える）
             │
             └─ クリーンアップ関数が実行される
```

---

## この章のまとめ

| 概念 | 技術 | 一言で |
|------|------|-------|
| 副作用 | 【React】 | レンダリング以外の処理（API 通信、タイマーなど） |
| useEffect | 【React】 | 副作用を安全に実行するための Hook |
| 依存配列 | 【React】 | `[]` = 初回のみ / `[x]` = x が変わるたび |
| クリーンアップ | 【React】 | useEffect の return で「後片付け」をする |
| デバウンス | 【JavaScript】 | 連続した入力をまとめて、最後の入力から一定時間後に処理する |

### 重要な理解

- `useEffect` は「レンダリングの後」に実行される
- 依存配列を正しく設定しないと、無限ループや古いデータ参照の原因になる
- **JSX の `onClick` などはクリーンアップ不要**（React が自動管理）
- **`addEventListener` で登録したものは必ずクリーンアップする**（手動管理）
- `useEffect` は Client Component（`"use client"`）でのみ使用可能

---

**前の章**: [Chapter 05: State（useState）とイベントハンドリング](./05-state-and-events.md)  
**次の章**: [Chapter 07: その他の主要 Hooks](./07-other-hooks.md)
