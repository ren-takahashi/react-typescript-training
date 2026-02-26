# Chapter 03: JSX とコンポーネント

## この章のゴール

- JSX（TSX）の基本構文を理解する
- React の「コンポーネント」の概念を理解する
- コンポーネントの作成・組み合わせ（コンポジション）ができるようになる
- 条件分岐レンダリング、リストレンダリングを書けるようになる

## この章で扱う技術

| タグ | 内容 |
|------|------|
| `【React】` | JSX、関数コンポーネント、Fragment |
| `【JavaScript】` | アロー関数、テンプレートリテラル、配列メソッド（map） |
| `【TypeScript】` | .tsx 拡張子 |

---

## 3-1. JSX とは何か？ 【React】

**JSX（JavaScript XML）** は React が導入した構文拡張です。  
JavaScript の中に HTML のようなタグを書く ことができます。

TypeScript で JSX を使う場合、拡張子は `.tsx` にします（これを TSX とも呼びます）。

```tsx
// これが JSX（一見 HTML に見えるが、JavaScript の式として評価される）
const element = <h1>Hello, World!</h1>;
```

### JSX の正体

JSX はブラウザが直接理解できるものではありません。  
コンパイル時に JavaScript の関数呼び出しに変換されます。

```tsx
// JSX で書いた場合
const element = <h1 className="title">Hello</h1>;

// ↓ コンパイルすると以下の JavaScript になる（内部的な処理）
const element = React.createElement("h1", { className: "title" }, "Hello");
```

つまり JSX は **React.createElement() の省略記法（シンタックスシュガー）** です。

---

## 3-2. JSX の基本ルール 【React】

### ルール 1: 必ず 1 つの親要素で囲む

```tsx
// ❌ NG: 複数の要素を並べて返せない
function Bad() {
  return (
    <h1>タイトル</h1>
    <p>本文</p>
  );
}

// ✅ OK: div で囲む
function Good1() {
  return (
    <div>
      <h1>タイトル</h1>
      <p>本文</p>
    </div>
  );
}

// ✅ OK: Fragment（空タグ）で囲む（余計な DOM 要素を増やさない）
function Good2() {
  return (
    <>
      <h1>タイトル</h1>
      <p>本文</p>
    </>
  );
}
```

> **📝 補足**: `<>...</>` は **Fragment** と呼ばれる React の機能です。  
> 余計な `<div>` を増やしたくない場合に使います。

### ルール 2: JavaScript の式は `{}` で囲む

```tsx
function Greeting() {
  const name = "田中";
  const today = new Date().toLocaleDateString("ja-JP");

  return (
    <div>
      {/* 変数の埋め込み */}
      <h1>こんにちは、{name}さん</h1>

      {/* JavaScript の式（計算やメソッド呼び出し） */}
      <p>今日は {today} です</p>

      {/* 三項演算子も書ける */}
      <p>状態: {true ? "アクティブ" : "非アクティブ"}</p>
    </div>
  );
}
```

### ルール 3: HTML との違い

| HTML | JSX (React) | 理由 |
|------|-------------|------|
| `class="..."` | `className="..."` | `class` は JavaScript の予約語 |
| `for="..."` | `htmlFor="..."` | `for` は JavaScript の予約語 |
| `<br>` | `<br />` | 閉じタグが必須 |
| `<img src="...">` | `<img src="..." />` | 閉じタグが必須 |
| `style="color: red"` | `style={{ color: "red" }}` | オブジェクトで指定する |
| `<!-- コメント -->` | `{/* コメント */}` | JS式としてコメントを書く |

---

## 3-3. 関数コンポーネント 【React】

**コンポーネント** とは、**UI の部品**です。  
React では **関数**でコンポーネントを作ります（関数コンポーネント）。

### 最小のコンポーネント

以下のファイルを作成して、実際にブラウザで確認しましょう。

**ファイル: `src/app/page.tsx`**（既存のファイルを上書き）

```tsx
// 【React】関数コンポーネント
// - 関数名は大文字で始める（PascalCase）← React のルール
// - JSX を return する
function Welcome() {
  return <h1>ようこそ！React の世界へ</h1>;
}

// 【Next.js】page.tsx で export default した関数がページになる
export default function Home() {
  return (
    <div>
      {/* 【React】コンポーネントをタグのように使う */}
      <Welcome />
      <p>ここからコンポーネントの学習を始めます。</p>
    </div>
  );
}
```

### コンポーネントのルール

1. **関数名は大文字で始める**（PascalCase）  
   小文字で始めると HTML タグと見分けがつかなくなる

2. **JSX を return する**  
   画面に表示したい UI を返す

3. **タグのように使える**  
   `<Welcome />` のように自分で定義したコンポーネントを呼び出せる

---

## 3-4. コンポーネントを別ファイルに分ける

実際の現場では、コンポーネントは**ファイルごとに分けるのが一般的**です。

### ファイル構成

```
src/
├── app/
│   └── page.tsx          ← ページ（コンポーネントを使う側）
└── components/           ← コンポーネント置き場を新規作成
    ├── Header.tsx
    └── Footer.tsx
```

**ファイル: `src/components/Header.tsx`**（新規作成）

```tsx
// 【React】ヘッダーコンポーネント
// 【JavaScript】export default で外部から import 可能にする
export default function Header() {
  return (
    <header style={{ backgroundColor: "#333", color: "#fff", padding: "16px" }}>
      <h1>My Learning App</h1>
    </header>
  );
}
```

**ファイル: `src/components/Footer.tsx`**（新規作成）

```tsx
// 【React】フッターコンポーネント
export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#eee", padding: "16px", marginTop: "32px" }}>
      <p>© 2025 React Training</p>
    </footer>
  );
}
```

**ファイル: `src/app/page.tsx`**（更新）

```tsx
// 【JavaScript / TypeScript】他のファイルからコンポーネントを import する
// @/ は src/ ディレクトリを指すエイリアス（tsconfig.json で設定済み）
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div>
      <Header />
      <main style={{ padding: "16px" }}>
        <h2>ようこそ！</h2>
        <p>コンポーネントを組み合わせてページを作っています。</p>
      </main>
      <Footer />
    </div>
  );
}
```

### 確認ポイント

- `Header` と `Footer` は **独立した部品** として定義し、`page.tsx` で **組み合わせて** 使っている
- これが **コンポジション（合成）** と呼ばれる React の基本パターン
- `@/components/Header` の `@/` は `src/` を指す **パスエイリアス**（TypeScript / Next.js の設定）

---

## 3-5. 条件分岐レンダリング 【React / JavaScript】

コンポーネントの中で、条件によって表示を切り替えることができます。

**ファイル: `src/app/page.tsx`**（更新）

```tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  // 試しに true / false を切り替えてみてください
  const isLoggedIn = true;
  const notifications = 3;

  return (
    <div>
      <Header />
      <main style={{ padding: "16px" }}>

        {/* パターン 1: 三項演算子 【JavaScript】 */}
        <p>{isLoggedIn ? "ログイン中です" : "ログインしてください"}</p>

        {/* パターン 2: && 演算子（条件が true の時だけ表示）【JavaScript】 */}
        {isLoggedIn && <p>ようこそ！マイページへ</p>}

        {/* パターン 3: && 演算子で数値を使う場合の注意 */}
        {/* ❌ 危険: notifications が 0 の時、"0" が画面に表示される */}
        {/* {notifications && <p>通知あり</p>} */}

        {/* ✅ 安全: 明示的に boolean に変換する */}
        {notifications > 0 && <p>{notifications}件の通知があります</p>}

      </main>
      <Footer />
    </div>
  );
}
```

### 条件分岐のパターンまとめ

| パターン | 使い所 |
|---------|--------|
| `条件 ? A : B` | 2つの表示を切り替える |
| `条件 && <要素>` | 条件が true の時だけ表示する |
| `if / else`（JSX の外） | 複雑な条件分岐 |

---

## 3-6. リストレンダリング（配列を画面に表示） 【React / JavaScript】

配列のデータを画面に表示するには、JavaScript の `map()` メソッドを使います。

**ファイル: `src/app/page.tsx`**（更新）

```tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  // 表示するデータ（配列）
  const fruits = ["りんご", "バナナ", "みかん", "ぶどう"];

  const users = [
    { id: 1, name: "田中太郎", role: "エンジニア" },
    { id: 2, name: "山田花子", role: "デザイナー" },
    { id: 3, name: "佐藤一郎", role: "マネージャー" },
  ];

  return (
    <div>
      <Header />
      <main style={{ padding: "16px" }}>

        <h2>フルーツ一覧</h2>
        <ul>
          {/* 【JavaScript】map() で配列の各要素を JSX に変換 */}
          {/* 【React】key は React がリストの変更を追跡するために必要 */}
          {fruits.map((fruit, index) => (
            <li key={index}>{fruit}</li>
          ))}
        </ul>

        <h2>ユーザー一覧</h2>
        <ul>
          {/* key にはユニークな値を使う（id がベスト） */}
          {users.map((user) => (
            <li key={user.id}>
              {user.name}（{user.role}）
            </li>
          ))}
        </ul>

      </main>
      <Footer />
    </div>
  );
}
```

### key について 【React】

- `map()` でリストを描画する際、各要素に `key` 属性が**必須**
- React が要素の追加・削除・並び替えを効率的に処理するために使う
- **一意な値**（`id` など）を使うのがベスト
- 配列のインデックス（`index`）は並び替えがない場合のみ使用可

---

## 3-7. コンポーネントをリストで使う

リストの各要素を独立したコンポーネントにすると、より整理されたコードになります。

**ファイル: `src/components/UserCard.tsx`**（新規作成）

```tsx
// 【React】ユーザー情報を表示するカードコンポーネント
// ※ Props（外部から渡すデータ）については次の Chapter で詳しく学びます
export default function UserCard(props: { name: string; role: string }) {
  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "8px",
    }}>
      <h3>{props.name}</h3>
      <p>{props.role}</p>
    </div>
  );
}
```

**ファイル: `src/app/page.tsx`**（更新）

```tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserCard from "@/components/UserCard";

export default function Home() {
  const users = [
    { id: 1, name: "田中太郎", role: "エンジニア" },
    { id: 2, name: "山田花子", role: "デザイナー" },
    { id: 3, name: "佐藤一郎", role: "マネージャー" },
  ];

  return (
    <div>
      <Header />
      <main style={{ padding: "16px" }}>
        <h2>ユーザー一覧</h2>
        {users.map((user) => (
          <UserCard key={user.id} name={user.name} role={user.role} />
        ))}
      </main>
      <Footer />
    </div>
  );
}
```

---

## この章のまとめ

| 概念 | 技術 | 一言で |
|------|------|-------|
| JSX / TSX | 【React】 | JavaScript の中に HTML ライクなタグを書ける構文 |
| 関数コンポーネント | 【React】 | JSX を返す関数。UI の部品。大文字で始める |
| Fragment (`<>`) | 【React】 | 余計な DOM を増やさずに複数要素をまとめる |
| `{}` 式の埋め込み | 【React / JavaScript】 | JSX 内で JavaScript の値や式を使う |
| 条件分岐レンダリング | 【React / JavaScript】 | 三項演算子や `&&` で表示を切り替える |
| リストレンダリング | 【React / JavaScript】 | `map()` で配列をJSXのリストに変換。`key` が必須 |
| コンポジション | 【React】 | 小さなコンポーネントを組み合わせて画面を作る |
| import / export | 【JavaScript】 | ファイル間でコンポーネントをやり取りする |

### 重要な理解

- **React はコンポーネントベース**。画面全体を1つのファイルに書くのではなく、小さな部品を組み合わせて画面を作る
- JSX は HTML に似ているが **JavaScript の式**。`className`、閉じタグ、`{}` の挿入などのルールがある
- `map()` と `key` の組み合わせはほぼ毎日使うパターン

---

**前の章**: [Chapter 02: TypeScript の基本的な型と構文](./02-typescript-basics.md)  
**次の章**: [Chapter 04: Props と型定義](./04-props-and-types.md)
