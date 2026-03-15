"use client";

import { useTodos } from "@/hooks/useTodos";
import TodoForm from "@/components/TodoForm";
import TodoList from "@/components/TodoList";
import TodoFilter from "@/components/TodoFilter";

export default function TodosPage() {
  const { todos, counts, isLoading, filter, setFilter, addTodo, toggleTodo, deleteTodo } = useTodos();

  return (
    <div>
      <h1 style={{ fontSize: "24px", marginBottom: "24px" }}>Todo 一覧</h1>
      <TodoForm onAdd={addTodo} />
      <TodoFilter current={filter} counts={counts} onChange={setFilter} />
      {isLoading ? (
        <p style={{ textAlign: "center", color: "#888" }}>読み込み中...</p>
      ) : (
        <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
      )}
    </div>
  );
}
