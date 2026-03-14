"use client";

import Link from "next/link";
import { Todo } from "@/types";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        borderBottom: "1px solid #eee",
        backgroundColor: todo.completed ? "#f8f9fa" : "#ffffff",
      }}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        style={{ width: "20px", height: "20px", cursor: "pointer" }}
      />

      <div style={{ flex: 1 }}>
        <Link
          href={`/todos/${todo.id}`}
          style={{
            textDecoration: todo.completed ? "line-through" : "none",
            color: todo.completed ? "#999" : "#333",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {todo.title}
        </Link>
        {todo.description && (
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>
            {todo.description}
          </p>
        )}
      </div>

      <button
        onClick={() => {
          if (window.confirm("本当に削除しますか？")) {
            onDelete(todo.id);
          }
        }}
        style={{
          padding: "6px 12px",
          backgroundColor: "#e74c3c",
          color: "#ffffff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "13px",
        }}
      >
        削除
      </button>
    </div>
  );
}
