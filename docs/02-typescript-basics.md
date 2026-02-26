# Chapter 02: TypeScript の基本的な型と構文

## この章のゴール

- TypeScript の基本的な型を理解する
- 型注釈（Type Annotation）の書き方を覚える
- インターフェース（`interface`）と型エイリアス（`type`）を使い分けられるようになる
- 現場のコードに出てくる TypeScript 構文を読めるようになる

## この章で扱う技術

| タグ | 内容 |
|------|------|
| `【TypeScript】` | この章のすべてが TypeScript 固有の機能です |

> **📝 前提**: TypeScript はすべて JavaScript の上に型を「追加」したものです。  
> TypeScript で書いたコードはコンパイルされて JavaScript になり、型情報は消えます。  
> PHP で `function foo(int $x): string` のように型を書くのと同じ考え方です。

---

## 2-0. 練習用ファイルの作成

この章では TypeScript の構文を練習するために、専用のファイルを作ります。

```bash
# コンテナ内で実行
cd /workspace/app
mkdir -p src/practice
```

各セクションで作成するファイルを次の方法で実行・確認できます。

```bash
# TypeScript ファイルを直接実行する（npx tsx を使用）
npx tsx src/practice/02-types.ts
```

> **💡 補足**: `tsx` は TypeScript ファイルをコンパイルなしに直接実行できるツールです。  
> 通常 TypeScript は `.ts` → `.js` にコンパイルしてから実行する必要がありますが、  
> `tsx` がその手間を省いてくれます。

---

## 2-1. 基本の型（プリミティブ型）

**ファイル: `src/practice/02-types.ts`** を作成

```typescript
// ============================================
// 【TypeScript】基本の型（プリミティブ型）
// ============================================

// 変数名の後に `: 型名` と書くのが「型注釈（Type Annotation）」
// PHP の型宣言 (int $x) に似ています

// 文字列型
const name: string = "田中太郎";

// 数値型（整数・小数の区別なし。PHP の int/float に相当）
const age: number = 30;
const price: number = 1980.5;

// 真偽値型
const isActive: boolean = true;

// null と undefined
const nothing: null = null;
const notDefined: undefined = undefined;

console.log(name, age, price, isActive, nothing, notDefined);

export {}; 
```

### 確認

```bash
npx tsx src/practice/02-types.ts
```

### 型が間違っているとどうなるか？

以下のコードをファイルの末尾に追加してみてください。

```typescript
// 【TypeScript】型エラーの例（意図的に間違えている）
// const wrongAge: number = "三十";  // ← コメントを外すとエラーになる
// Type 'string' is not assignable to type 'number'.
```

コメントを外して保存すると、エディタ（VS Code）が赤い波線でエラーを表示するはずです。  
これが TypeScript の「型チェック」です。**実行する前にミスを教えてくれる**のが最大の利点です。

---

## 2-2. 型推論（Type Inference）

**【TypeScript】** は型注釈を省略しても、代入された値から自動的に型を推測してくれます。

**ファイル: `src/practice/02-types.ts`** に追加

```typescript
// ============================================
// 【TypeScript】型推論（Type Inference）
// ============================================

// 型注釈なしでも、TypeScript が型を推論する
const city = "東京";       // → string と推論される
const count = 42;          // → number と推論される
const isDone = false;      // → boolean と推論される

// 型推論があるので、すべてに型注釈を書く必要はない。
// ただし、関数の引数には型注釈を書くのが一般的（後述）

console.log(city, count, isDone);
```

> **💡 ポイント**: 変数の宣言時に値を代入する場合、型注釈は省略しても OK です。  
> ただし、**関数の引数** は型推論が効かないので、明示的に型を書く必要があります。

---

## 2-3. 配列（Array）

```typescript
// ============================================
// 【TypeScript】配列の型
// ============================================

// 書き方1: 型名[]
const fruits: string[] = ["りんご", "バナナ", "みかん"];

// 書き方2: Array<型名>（ジェネリクス構文、PHPにはない概念）
const scores: Array<number> = [85, 92, 78];

// 型推論も効く
const colors = ["赤", "青", "緑"]; // → string[] と推論される

console.log(fruits, scores, colors);

// 型が違う要素は追加できない
// fruits.push(123);  // ← エラー: Argument of type 'number' is not assignable to parameter of type 'string'
```

---

## 2-4. オブジェクトの型

```typescript
// ============================================
// 【TypeScript】オブジェクトの型
// ============================================

// オブジェクトの型をインラインで書く
const user: { name: string; age: number; email: string } = {
  name: "山田花子",
  age: 25,
  email: "hanako@example.com",
};

console.log(user.name); // "山田花子"

// 存在しないプロパティにはアクセスできない
// console.log(user.phone);  // ← エラー: Property 'phone' does not exist
```

オブジェクトの型が長くなると読みにくいので、次のセクションで `interface` や `type` を使って名前を付けます。

---

## 2-5. interface（インターフェース）

**【TypeScript】** `interface` はオブジェクトの「形」に名前を付ける機能です。

```typescript
// ============================================
// 【TypeScript】interface（インターフェース）
// ============================================

// オブジェクトの型に名前を付ける
interface User {
  name: string;
  age: number;
  email: string;
}

// 定義した型を使う
const user1: User = {
  name: "佐藤一郎",
  age: 30,
  email: "ichiro@example.com",
};

const user2: User = {
  name: "鈴木二郎",
  age: 28,
  email: "jiro@example.com",
};

console.log(user1, user2);

// 定義にないプロパティを追加するとエラー
// const user3: User = {
//   name: "高橋三郎",
//   age: 35,
//   email: "saburo@example.com",
//   phone: "090-xxxx-xxxx",  // ← エラー
// };
```

> **💡 PHP と比較**: PHP の interface はメソッドの契約を定義しますが、TypeScript の interface は「データの形」を定義するのが主な用途です。概念は似ていますが使い方が違います。

---

## 2-6. type（型エイリアス）

**【TypeScript】** `type` はあらゆる型に名前を付ける機能です。

```typescript
// ============================================
// 【TypeScript】type（型エイリアス）
// ============================================

// interface と同じようにオブジェクトの型を定義できる
type Product = {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
};

const apple: Product = {
  id: 1,
  name: "りんご",
  price: 200,
  inStock: true,
};

console.log(apple);

// type は interface にはできないこともできる（後述の Union 型など）
type ID = string | number; // ← これは interface では書けない
```

### interface と type の使い分け

| 比較 | `interface` | `type` |
|------|------------|--------|
| オブジェクトの型定義 | ✅ | ✅ |
| Union 型 | ❌ | ✅ |
| 拡張（extends / &） | ✅ extends | ✅ & |
| 宣言のマージ | ✅ | ❌ |

**現場での傾向**: コンポーネントの Props には `type` を使うプロジェクトが多いです。  
どちらを使うかはプロジェクトの規約次第ですが、**迷ったら `type` を使えば問題ない**というのが一般的な方針です。

---

## 2-7. 省略可能なプロパティ（Optional）

```typescript
// ============================================
// 【TypeScript】省略可能なプロパティ（?）
// ============================================

type UserProfile = {
  name: string;
  age: number;
  bio?: string;     // ← ? を付けると省略（undefined）可能
  website?: string;  // ← 省略可能
};

// bio と website を省略しても OK
const profile1: UserProfile = {
  name: "田中",
  age: 30,
};

// もちろん指定しても OK
const profile2: UserProfile = {
  name: "山田",
  age: 25,
  bio: "フロントエンドエンジニア",
};

console.log(profile1, profile2);
```

---

## 2-8. Union 型（ユニオン型 / 共用体型）

```typescript
// ============================================
// 【TypeScript】Union 型（複数の型を許容する）
// ============================================

// | で複数の型を「または」で指定できる
type Status = "active" | "inactive" | "pending";

let userStatus: Status = "active";
userStatus = "inactive";  // OK
// userStatus = "deleted";   // ← エラー: "deleted" は Status に含まれない

// 文字列リテラル型以外でも使える
type ID = string | number;

const userId1: ID = 123;
const userId2: ID = "abc-456";

console.log(userStatus, userId1, userId2);
```

> **💡 ポイント**: Union 型は現場で非常によく使います。  
> 「ステータス」「カテゴリ」など、取りうる値が決まっているものに使うと安全です。  
> PHP でいう Enum に近い使い方です。

---

## 2-9. 関数の型

```typescript
// ============================================
// 【TypeScript】関数の型
// ============================================

// 引数と戻り値に型を付ける（PHPの型宣言に最も近い概念）
function greet(name: string): string {
  return `こんにちは、${name}さん！`;
}

console.log(greet("田中")); // "こんにちは、田中さん！"

// アロー関数（JavaScript の構文だが、TypeScript で型を付けられる）
const add = (a: number, b: number): number => {
  return a + b;
};

console.log(add(3, 5)); // 8

// 戻り値がない関数は void 型（PHP の void と同じ）
function logMessage(message: string): void {
  console.log(`[LOG] ${message}`);
}

logMessage("処理を開始します");
```

### PHP との比較

```php
// PHP
function greet(string $name): string {
    return "こんにちは、{$name}さん！";
}
```

```typescript
// TypeScript
function greet(name: string): string {
  return `こんにちは、${name}さん！`;
}
```

ほぼ同じですね！ 型の書く位置が「引数名の後」か「引数名の前」かの違いだけです。

---

## 2-10. ジェネリクス（Generics）

**【TypeScript】** ジェネリクスは「型を引数として受け取る」仕組みです。  
最初は難しく感じるかもしれませんが、現場のコードでは頻出するので、読めるようにしておきましょう。

```typescript
// ============================================
// 【TypeScript】ジェネリクス（Generics）
// ============================================

// T は「型の引数」。使う時に具体的な型を指定する。
function getFirst<T>(items: T[]): T {
  return items[0];
}

// string 型の配列を渡すと、戻り値も string 型になる
const firstFruit = getFirst<string>(["りんご", "バナナ", "みかん"]);
console.log(firstFruit); // "りんご"

// number 型の配列を渡すと、戻り値も number 型になる
const firstScore = getFirst<number>([85, 92, 78]);
console.log(firstScore); // 85

// 型引数は推論してくれるので、省略も可能
const firstColor = getFirst(["赤", "青", "緑"]); // → string と推論される
console.log(firstColor); // "赤"
```

> **💡 現場では**: ジェネリクスを「自分で定義する」機会は最初は少ないですが、  
> React の `useState<string>("")` など、**既存のジェネリクスを使う**機会は非常に多いです。

---

## 2-11. 型アサーション（as）

```typescript
// ============================================
// 【TypeScript】型アサーション（as）
// ============================================

// 開発者が「この値はこの型だ」と TypeScript に伝える
// ⚠️ 型チェックを回避するものなので、乱用は避ける

const inputValue: unknown = "hello";

// unknown 型のままでは string のメソッドが使えない
// inputValue.toUpperCase();  // ← エラー

// as で「これは string だ」と伝える
const upperValue = (inputValue as string).toUpperCase();
console.log(upperValue); // "HELLO"
```

> **⚠️ 注意**: `as` は TypeScript の型チェックをスキップするため、正しくないとランタイムエラーになります。  
> 現場ではなるべく使わない方がよいですが、外部 API のレスポンスなどで型が不明な場合に使うことがあります。

---

## 2-12. ユーティリティ型（よく使うもの）

**【TypeScript】** はよく使う型の変換パターンをユーティリティ型として提供しています。  
全部覚える必要はありませんが、以下は現場で頻出します。

```typescript
// ============================================
// 【TypeScript】ユーティリティ型
// ============================================

type User = {
  id: number;
  name: string;
  email: string;
  age: number;
};

// Partial<T>: すべてのプロパティを省略可能にする
// → 更新フォームなど、一部だけ変更したい場合に便利
type UserUpdate = Partial<User>;
// ↑ { id?: number; name?: string; email?: string; age?: number; }

const update: UserUpdate = { name: "新しい名前" }; // OK（他は省略）

// Pick<T, Keys>: 特定のプロパティだけを取り出す
type UserSummary = Pick<User, "id" | "name">;
// ↑ { id: number; name: string; }

const summary: UserSummary = { id: 1, name: "田中" };

// Omit<T, Keys>: 特定のプロパティを除外する
type UserWithoutEmail = Omit<User, "email">;
// ↑ { id: number; name: string; age: number; }

const userNoEmail: UserWithoutEmail = { id: 1, name: "田中", age: 30 };

// Record<Keys, Type>: キーと値の型を指定したオブジェクト
type StatusLabels = Record<string, string>;

const labels: StatusLabels = {
  active: "有効",
  inactive: "無効",
  pending: "保留",
};

console.log(update, summary, userNoEmail, labels);
```

---

## 2-13. まとめ：現場でよく見る TypeScript パターン早見表

| パターン | 例 | 意味 |
|---------|----|------|
| 型注釈 | `const x: string = "hello"` | 変数の型を指定 |
| 配列の型 | `string[]` / `Array<string>` | 文字列の配列 |
| オプショナル | `name?: string` | 省略可能なプロパティ |
| Union 型 | `"a" \| "b" \| "c"` | いずれかの値 |
| interface | `interface User { ... }` | オブジェクトの型に名前を付ける |
| type | `type Props = { ... }` | 任意の型に名前を付ける |
| ジェネリクス | `useState<string>("")` | 型を引数として渡す |
| as | `value as string` | 型を開発者が指定（要注意） |
| Partial | `Partial<User>` | 全プロパティを省略可能に |
| Pick | `Pick<User, "id" \| "name">` | 特定プロパティだけ抽出 |
| Omit | `Omit<User, "email">` | 特定プロパティを除外 |

---

## 練習問題

以下の練習問題に取り組んで、理解を確認しましょう。  
**ファイル: `src/practice/02-exercises.ts`** を作成してください。

### 問題 1: 型を定義してみよう

以下の要件を満たす `BlogPost` 型を定義してください。

- `id`: 数値（必須）
- `title`: 文字列（必須）
- `content`: 文字列（必須）
- `author`: 文字列（必須）
- `tags`: 文字列の配列（必須）
- `publishedAt`: 文字列（省略可能）
- `status`: "draft" | "published" | "archived" のいずれか（必須）

```typescript
// ここに BlogPost 型を定義

// 以下が型チェックを通れば正解
const post1: BlogPost = {
  id: 1,
  title: "TypeScriptの基本",
  content: "TypeScriptは型のある言語です...",
  author: "田中太郎",
  tags: ["TypeScript", "入門"],
  status: "published",
  publishedAt: "2025-01-01",
};

const post2: BlogPost = {
  id: 2,
  title: "下書き記事",
  content: "まだ書き途中...",
  author: "山田花子",
  tags: [],
  status: "draft",
  // publishedAt を省略しても OK
};

console.log(post1, post2);
```

### 問題 2: 関数に型を付けてみよう

以下の関数に適切な型注釈を付けてください。

```typescript
// 引数と戻り値に型を付けてください
function calculateTotal(price, quantity, taxRate) {
  return price * quantity * (1 + taxRate);
}

// 正しく動けば OK
console.log(calculateTotal(1000, 3, 0.1)); // 3300
```

---

**前の章**: [Chapter 01: プロジェクト構成と各ファイルの役割](./01-project-structure.md)  
**次の章**: [Chapter 03: JSX とコンポーネント](./03-jsx-and-components.md)
