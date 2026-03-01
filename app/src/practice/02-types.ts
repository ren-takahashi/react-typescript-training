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

// 【TypeScript】型エラーの例（意図的に間違えている）
// const wrongAge: number = "三十";  // ← コメントを外すとエラーになる
// Type 'string' is not assignable to type 'number'.

console.log(name, age, price, isActive, nothing, notDefined);

// 上記の状態で、コンテナ内に入り、/workspace/app移動して、以下のコマンドを実行する
// root@69a88fe2743f:/workspace# cd /workspace/app
// root@69a88fe2743f:/workspace/app# npx tsx src/practice/02-types.ts

// 実行結果
// 田中太郎 30 1980.5 true null undefined


// ============================================
// 【TypeScript】型推論（Type Inference）
// ============================================

// 型注釈なしでも、TypeScript が型を推論する
const city = "東京";       // → string と推論される
const count = 42;          // → number と推論される
const isDone = false;      // → boolean と推論される

// 型推論があるので、すべてに型注釈を書く必要はない
// ただし、関数の引数には型注釈を書くのが一般的（後述）

console.log(city, count, isDone);

export {}; 
