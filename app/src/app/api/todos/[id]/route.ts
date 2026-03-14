import { NextRequest, NextResponse } from "next/server";
import { Todo, UpdateTodoInput } from "@/types";
import initialTodos from "@/data/todos.json";

let todos: Todo[] = [...initialTodos];

// GET /api/todos/[id] - 1件取得
export function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return params.then(({ id }) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) {
      return NextResponse.json({ error: "Todo が見つかりません" }, { status: 404 });
    }
    return NextResponse.json(todo);
  });
}

// PATCH /api/todos/[id] - 更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Todo が見つかりません" }, { status: 404 });
  }

  const body: UpdateTodoInput = await request.json();
  const updated: Todo = {
    ...todos[index],
    ...(body.title !== undefined && { title: body.title.trim() }),
    ...(body.description !== undefined && { description: body.description.trim() }),
    ...(body.completed !== undefined && { completed: body.completed }),
    updatedAt: new Date().toISOString(),
  };

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

  if (index === -1) {
    return NextResponse.json({ error: "Todo が見つかりません" }, { status: 404 });
  }

  todos.splice(index, 1);
  return NextResponse.json({ message: "削除しました" });
}
