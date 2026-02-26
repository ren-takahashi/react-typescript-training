# Chapter 04: Props と型定義

## この章のゴール

- Props（コンポーネントに渡すデータ）を理解する
- TypeScript で Props の型を定義できるようになる
- `children` Props の使い方を理解する
- 省略可能な Props（Optional Props）を使えるようになる

## この章で扱う技術

| タグ | 内容 |
|------|------|
| `【React】` | Props の概念、children |
| `【TypeScript】` | Props の型定義、type / interface |
| `【JavaScript】` | 分割代入（Destructuring） |

---

## 4-1. Props とは何か？ 【React】

**Props（プロップス）** は、コンポーネントに**外部からデータを渡す**仕組みです。  
HTML の属性（`<img src="...">` の `src`）に似ています。

```
親コンポーネント
  ↓ Props（データを渡す）
子コンポーネント
```

### PHP との比較

```php
// PHP: 関数の引数
function greet(string $name): string {
    return "こんにちは、{$name}さん";
}
echo greet("田中");
```

```tsx
// React: Props（コンポーネントの引数）
function Greeting(props: { name: string }) {
  return <p>こんにちは、{props.name}さん</p>;
}
// 使い方: <Greeting name="田中" />
```

Props は**コンポーネント版の関数の引数**だと考えてください。

---

## 4-2. Props に型を付ける 【React + TypeScript】

Props の型定義は、TypeScript で React を書く際の**最も基本的なパターン**です。

**ファイル: `src/components/Greeting.tsx`**（新規作成）

```tsx
// 【TypeScript】Props の型を type で定義する
type GreetingProps = {
  name: string;
  age: number;
};

// 【React / TypeScript】Props の型を引数に指定する
// 【JavaScript】分割代入で props オブジェクトから取り出す
export default function Greeting({ name, age }: GreetingProps) {
  return (
    <div>
      <p>こんにちは、{name}さん（{age}歳）</p>
    </div>
  );
}
```

**ファイル: `src/app/page.tsx`**（更新）

```tsx
import Greeting from "@/components/Greeting";

export default function Home() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>Props の学習</h1>

      {/* 【React】Props を属性として渡す */}
      <Greeting name="田中太郎" age={30} />
      <Greeting name="山田花子" age={25} />

      {/* 文字列は "..." で、数値は {...} で渡す */}
      {/* ↓ 型が合わないとエラーになる */}
      {/* <Greeting name="佐藤" age="三十" />  ← TypeScript エラー */}
    </div>
  );
}
```

### Props の書き方パターン

```tsx
// パターン 1: 分割代入（推奨・現場で最も一般的）
function Greeting({ name, age }: GreetingProps) {
  return <p>{name}（{age}歳）</p>;
}

// パターン 2: props をそのまま受け取る
function Greeting(props: GreetingProps) {
  return <p>{props.name}（{props.age}歳）</p>;
}

// パターン 3: インラインで型を書く（小さなコンポーネント向け）
function Greeting({ name, age }: { name: string; age: number }) {
  return <p>{name}（{age}歳）</p>;
}
```

> **💡 現場では**: パターン 1（型を別途定義 + 分割代入）が最も多いです。

---

## 4-3. 省略可能な Props（Optional Props）【TypeScript】

すべての Props が毎回必要とは限りません。TypeScript の `?` で省略可能にできます。

**ファイル: `src/components/UserCard.tsx`**（更新）

```tsx
// 【TypeScript】? で省略可能なプロパティを定義
type UserCardProps = {
  name: string;          // 必須
  role: string;          // 必須
  avatarUrl?: string;    // 省略可能（string | undefined になる）
  isActive?: boolean;    // 省略可能
};

export default function UserCard({ name, role, avatarUrl, isActive = true }: UserCardProps) {
  // 【JavaScript】isActive = true → デフォルト値（省略された場合 true になる）

  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "8px",
      opacity: isActive ? 1 : 0.5, // 非アクティブなら半透明
    }}>
      {/* 【React / JavaScript】avatarUrl がある場合だけ画像を表示 */}
      {avatarUrl && <img src={avatarUrl} alt={name} width={48} height={48} />}
      <h3>{name}</h3>
      <p>{role}</p>
      <span style={{
        color: isActive ? "green" : "gray",
        fontSize: "12px",
      }}>
        {isActive ? "● アクティブ" : "● 非アクティブ"}
      </span>
    </div>
  );
}
```

**ファイル: `src/app/page.tsx`**（更新）

```tsx
import UserCard from "@/components/UserCard";

export default function Home() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>ユーザー一覧</h1>

      {/* すべての Props を指定 */}
      <UserCard name="田中太郎" role="エンジニア" isActive={true} />

      {/* 省略可能な Props は省略できる */}
      <UserCard name="山田花子" role="デザイナー" />

      {/* isActive を false にする */}
      <UserCard name="佐藤一郎" role="マネージャー" isActive={false} />
    </div>
  );
}
```

---

## 4-4. children Props 【React】

**`children`** は React の特別な Props で、コンポーネントの**開始タグと終了タグの間に書いた内容**が渡されます。

```tsx
// children なし（自己閉じタグ）
<UserCard name="田中" role="エンジニア" />

// children あり（開始タグと終了タグで囲む）
<Card>
  <p>ここが children として渡される</p>
</Card>
```

### 実装してみよう

**ファイル: `src/components/Card.tsx`**（新規作成）

```tsx
// 【TypeScript / React】children の型は React.ReactNode
type CardProps = {
  title: string;
  children: React.ReactNode;  // ← React が提供する型。JSX 要素やテキストなど何でも入る
};

export default function Card({ title, children }: CardProps) {
  return (
    <div style={{
      border: "1px solid #ccc",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "16px",
    }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {/* 【React】children が差し込まれる場所 */}
      <div>{children}</div>
    </div>
  );
}
```

**ファイル: `src/app/page.tsx`**（更新）

```tsx
import Card from "@/components/Card";

export default function Home() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>Card コンポーネント</h1>

      <Card title="お知らせ">
        {/* ↓ ここが children として Card に渡される */}
        <p>本日のメンテナンスは完了しました。</p>
        <p>ご不便をおかけしました。</p>
      </Card>

      <Card title="注意事項">
        <ul>
          <li>パスワードは定期的に変更してください</li>
          <li>共有PCではログアウトしてください</li>
        </ul>
      </Card>

      {/* children はテキストだけでも OK */}
      <Card title="シンプルなカード">
        これはテキストだけの children です。
      </Card>
    </div>
  );
}
```

### children を使う場面

- **レイアウト系コンポーネント**: カード、モーダル、サイドバーなど、「外枠」を提供して中身は使う側が決める
- **Next.js の layout.tsx**: まさに children を使って、レイアウトの中にページの中身を差し込んでいる

---

## 4-5. Props のバケツリレー問題（Props Drilling）

Props は**親から子へ一方通行**で渡されます。孫コンポーネントに渡したい場合、中間のコンポーネントを経由する必要があります。

```
App（userName を持っている）
  → Layout（userName を受け取り、そのまま Header に渡す）
    → Header（userName を使って表示する）
```

```tsx
// 中間の Layout は userName を使わないのに、受け取って渡す必要がある
function Layout({ userName }: { userName: string }) {
  return <Header userName={userName} />;
}
```

これを **Props Drilling（バケツリレー）** と呼び、階層が深くなると面倒になります。  
この問題は Chapter 07 の `useContext` で解決する方法を学びます。

---

## 4-6. 実践：プロフィールカードを作ってみよう

学んだことを組み合わせて、プロフィールカードコンポーネントを作りましょう。

**ファイル: `src/components/ProfileCard.tsx`**（新規作成）

```tsx
// 【TypeScript】Props の型定義
type ProfileCardProps = {
  name: string;
  email: string;
  department: string;
  bio?: string;           // 省略可能
  skills: string[];       // 文字列の配列
};

// 【React】関数コンポーネント
// 【JavaScript】分割代入でPropsを取り出す
export default function ProfileCard({
  name,
  email,
  department,
  bio,
  skills,
}: ProfileCardProps) {
  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "16px",
      maxWidth: "400px",
    }}>
      <h2 style={{ margin: "0 0 8px 0" }}>{name}</h2>
      <p style={{ color: "#666", margin: "4px 0" }}>{department}</p>
      <p style={{ margin: "4px 0" }}>📧 {email}</p>

      {/* 【React / JavaScript】bio がある場合だけ表示（条件分岐レンダリング） */}
      {bio && (
        <p style={{ fontStyle: "italic", color: "#555" }}>「{bio}」</p>
      )}

      <h4>スキル</h4>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {/* 【React / JavaScript】配列を map() でリスト表示 */}
        {skills.map((skill) => (
          <span
            key={skill}
            style={{
              backgroundColor: "#e3f2fd",
              padding: "4px 12px",
              borderRadius: "16px",
              fontSize: "14px",
            }}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
```

**ファイル: `src/app/page.tsx`**（更新）

```tsx
import ProfileCard from "@/components/ProfileCard";

export default function Home() {
  return (
    <div style={{ padding: "16px", color: "#333" }}>
      <h1>チームメンバー</h1>

      <ProfileCard
        name="田中太郎"
        email="tanaka@example.com"
        department="開発部"
        bio="React が好きなエンジニアです"
        skills={["React", "TypeScript", "Next.js", "Node.js"]}
      />

      <ProfileCard
        name="山田花子"
        email="yamada@example.com"
        department="デザイン部"
        skills={["Figma", "CSS", "React"]}
        // {/* bio は省略 */}
      />
    </div>
  );
}
```

---

## この章のまとめ

| 概念 | 技術 | 一言で |
|------|------|-------|
| Props | 【React】 | コンポーネントに外部からデータを渡す仕組み |
| Props の型定義 | 【TypeScript】 | `type XxxProps = { ... }` で型を定義する |
| 分割代入 | 【JavaScript】 | `{ name, age }` で引数からプロパティを取り出す |
| Optional Props | 【TypeScript】 | `?` で省略可能にする |
| デフォルト値 | 【JavaScript】 | `isActive = true` で Props が省略された場合の初期値を設定 |
| children | 【React】 | タグの間に書いた内容を受け取る特別な Props |
| React.ReactNode | 【React / TypeScript】 | children の型。JSX やテキストなど何でも入る |

### 重要な理解

- Props は **親 → 子 への一方通行**。子から親にデータを渡すには別の仕組みが必要（イベントコールバック、Chapter 05 で学ぶ）
- Props の型定義は **TypeScript + React を書く上での最も基本的なパターン**
- `children` を使うと **汎用的な「枠組み」コンポーネント** が作れる

---

**前の章**: [Chapter 03: JSX とコンポーネント](./03-jsx-and-components.md)  
**次の章**: [Chapter 05: State（useState）とイベントハンドリング](./05-state-and-events.md)
