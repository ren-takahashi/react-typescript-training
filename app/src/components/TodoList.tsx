"use client";

import { Todo } from "@/types";

interface TodoListProps {
  todos: Todo[];
}

export default function TodoList({ todos }: TodoListProps) {
  if (todos.length === 0) {
    return <p style={{ textAlign: "center", color: "#888", padding: "32px 0" }}>Todo がありません</p>;
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
      {todos.map((todo) => (
        // Todo アイテムのコンテナ
        <div
          key={todo.id}
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #eee",
            backgroundColor: todo.completed ? "#f8f9fa" : "#ffffff",
          }}
        >
          {/* タイトル */}
          <div style={{
            textDecoration: todo.completed ? "line-through" : "none",
            color: todo.completed ? "#999" : "#333",
            fontSize: "16px",
            fontWeight: "bold",
          }}>
            {todo.title}
          </div>

          {/* 説明文がある場合のみ表示 */}
          {todo.description && (
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>
              {todo.description}
            </p>
          )}

        </div>
      ))}
    </div>
  );
}
