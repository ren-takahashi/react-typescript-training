// Todo の型定義
export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;   // ISO 8601 形式
  updatedAt: string;
}

// フィルターの種類
// ユーティリティ型を利用していない、単純な文字列リテラル型で定義されたフィルターの型定義
export type TodoFilter = "all" | "active" | "completed";


// 新規作成時の入力（id, createdAt, updatedAt はサーバーが付与）
// Pick<...> は特定のプロパティだけを抜き取るユーティリティ型
export type CreateTodoInput = Pick<Todo, "title" | "description">;

// // 更新時の入力（部分更新を許容）
// // Partial<...> はすべてのプロパティをオプショナルにするユーティリティ型
// export type UpdateTodoInput = Partial<Pick<Todo, "title" | "description" | "completed">>;
// // NOTE: PickとかPartialというのは、TypeScript にもともと用意されているユーティリティ型です。
// // node_modules/typescript/lib/lib.es5.d.ts などの TypeScript の型定義ファイルに定義されているユーティリティ型です。
// // Pick は特定のプロパティだけを抜き取るための型で、
// // Partial はすべてのプロパティをオプショナルにするための型です。
// // これらは TypeScript の標準ライブラリに含まれているので、特別なインストールは必要ありません。
