"use client";
import { useState } from "react";

// 【TypeScript】Todo の型定義
type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

export default function TodoList() {
  // 【React】複数の State を管理
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");

  // Todo を追加する
  function handleAdd() {
    if (inputValue.trim() === "") return; // 空文字は追加しない

    const newTodo: Todo = {
      id: Date.now(), // ユニークな ID（簡易的に現在時刻を使う）
      text: inputValue,
      completed: false,
    };

    // 【React】配列の State を更新（スプレッド構文で新しい配列を作る）
    setTodos([...todos, newTodo]);
    setInputValue(""); // 入力欄をクリア
  }

  // Todo の完了状態を切り替える
  function handleToggle(id: number) {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

  // Todo を削除する
  function handleDelete(id: number) {
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  // 【React】Enter キーで追加
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      handleAdd();
    }
  }

  return (
    <div style={{ padding: "16px", maxWidth: "500px" }}>
      <h2>Todo リスト</h2>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="やることを入力..."
          style={{ flex: 1, padding: "8px" }}
        />
        <button onClick={handleAdd}>追加</button>
      </div>

      {/* Todo がない場合のメッセージ */}
      {todos.length === 0 && (
        <p style={{ color: "#999" }}>まだ Todo がありません</p>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => (
          <li
            key={todo.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px",
              borderBottom: "1px solid #eee",
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id)}
            />
            <span
              style={{
                flex: 1,
                textDecoration: todo.completed ? "line-through" : "none",
                color: todo.completed ? "#999" : "#333",
              }}
            >
              {todo.text}
            </span>
            <button
              onClick={() => handleDelete(todo.id)}
              style={{ color: "red", border: "none", cursor: "pointer" }}
            >
              削除
            </button>
          </li>
        ))}
      </ul>

      {/* 統計情報 */}
      {todos.length > 0 && (
        <p style={{ fontSize: "14px", color: "#666" }}>
          合計: {todos.length} 件 / 完了: {todos.filter((t) => t.completed).length} 件
        </p>
      )}
    </div>
  );
}
