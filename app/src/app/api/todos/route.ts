import { NextResponse } from "next/server";
import { Todo } from "@/types";
import initialTodos from "@/data/todos.json";

// DBの代わりとしてメモリ上にデータを保持（サーバー再起動でリセットされる）
let todos: Todo[] = [...initialTodos];

/**
 * GET /api/todos
 * すべての Todo を取得する API
 */
export function GET() {
  // 作成日の降順（新しい順）で返す
  const sorted = [...todos].sort(
    // 新しい順にソートするため、b - a の順番で比較
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  // ソートされた Todo を返す
  return NextResponse.json(sorted);
}


// /**
//  * POST /api/todos
//  * 新しい Todo を作成する API
//  */
// export async function POST(request: NextRequest) {

//   // 自分メモ: JavaScript は「待たない」のがデフォルト。
//   // なので、非同期処理を行う関数は async 関数として定義し、await を使って結果を待つ必要がある。
//   // ちなみに、「await をつける = 同期処理になる」というわけではない。
//   // あくまで「await をつける = 結果が返ってくるまで待つ（非同期処理を 同期的に書ける）」という意味。
//   const body: CreateTodoInput = await request.json();

//   // バリデーション
//   if (!body.title || body.title.trim() === "") {
//     return NextResponse.json(
//       { error: "タイトルは必須です" },
//       { status: 400 }
//     );
//   }

//   const now = new Date().toISOString();
//   const newTodo: Todo = {
//     id: String(Date.now()),  // 簡易的なID生成
//     title: body.title.trim(),
//     description: body.description?.trim() ?? "",
//     completed: false,
//     createdAt: now,
//     updatedAt: now,
//   };

//   todos.push(newTodo);
//   return NextResponse.json(newTodo, { status: 201 });
// }