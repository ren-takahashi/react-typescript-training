"use client";

import { Todo } from "@/types";
import TodoItem from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return <p style={{ textAlign: "center", color: "#888", padding: "32px 0" }}>Todo がありません</p>;
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
