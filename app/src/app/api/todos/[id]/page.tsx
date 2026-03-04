import { NextRequest, NextResponse } from "next/server";
import { Todo, UpdateTodoInput } from "@/types";
import initialTodos from "@/data/todos.json";

let todos: Todo[] = [...initialTodos];

// PATCH /api/todos/[id] - 更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
// params は URL パラメータを含むオブジェクトで、ここでは { id: string } の形を期待している。
  const { id } = await params;
// todos 配列から、id が一致する Todo のインデックスを探す
  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Todo が見つかりません" }, { status: 404 });
  }

// リクエストボディを UpdateTodoInput としてパース
  const body: UpdateTodoInput = await request.json();

  // 更新するフィールドだけを上書きして新しい Todo オブジェクトを作成
  const updated: Todo = {
    ...todos[index],
    ...(body.title !== undefined && { title: body.title.trim() }),
    ...(body.description !== undefined && { description: body.description.trim() }),
    ...(body.completed !== undefined && { completed: body.completed }),
    updatedAt: new Date().toISOString(),
  };

  // 更新された Todo を配列に保存して返す
  todos[index] = updated;
  return NextResponse.json(updated);
}

// DELETE /api/todos/[id] - 削除
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = todos.findIndex((t) => t.id === id);

  // id が一致する Todo が見つからない場合は 404 エラーを返す
  if (index === -1) {
    return NextResponse.json({ error: "Todo が見つかりません" }, { status: 404 });
  }

  // 見つかった Todo を配列から削除して成功メッセージを返す
  todos.splice(index, 1);
  return NextResponse.json({ message: "削除しました" });
}
