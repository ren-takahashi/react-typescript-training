"use client";

import { useState, useEffect } from "react";
import { CreateTodoInput, Todo } from "@/types";
import TodoList from "@/components/TodoList";
import TodoForm from "@/components/TodoForm";

export default function TodosPage() {
  // useState で状態を管理
  // todos: Todo の配列を管理する状態
  // isLoading: データの読み込み中かどうかを管理する状態
  const [todos, setTodos] = useState<Todo[]>([]); // 初期値は空の配列
  const [isLoading, setIsLoading] = useState(true); // 初期値は true（読み込み中）

  useEffect(() => {
    // ① 非同期関数を定義
    async function fetchTodos() {
      const res = await fetch("/api/todos");
      const data: Todo[] = await res.json();
      setTodos(data);
      setIsLoading(false);
    }
    // ② すぐに呼び出す
    fetchTodos();
  }, []); // 最後の引数に、空の依存配列を設定 = マウント時に一度だけ実行

  
  // Todo を追加する関数
  const handleAdd = async (input: CreateTodoInput) => {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("追加に失敗しました");
    const newTodo: Todo = await res.json();
    setTodos((prev) => [newTodo, ...prev]);
  };

  return (
    <div>
      <h1 style={{ fontSize: "24px", marginBottom: "24px" }}>Todo 一覧</h1>

      {/* TodoForm コンポーネントを表示 */}
      <TodoForm onAdd={handleAdd} />

      {/* 三項演算子を使って読み込み中かどうかを判定 */}
      {isLoading ? (
        <p style={{ textAlign: "center", color: "#888" }}>読み込み中...</p>
      ) : (
        <TodoList todos={todos} />
      )}
    </div>
  );
}
