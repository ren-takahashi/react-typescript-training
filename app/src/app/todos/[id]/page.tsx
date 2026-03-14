"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Todo, UpdateTodoInput } from "@/types";
import TodoEditForm from "@/components/TodoEditForm";

export default function TodoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [todo, setTodo] = useState<Todo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function fetchTodo() {
      try {
        const res = await fetch(`/api/todos/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Todo が見つかりません");
          } else {
            setError("取得に失敗しました");
          }
          return;
        }
        const data: Todo = await res.json();
        setTodo(data);
      } catch {
        setError("通信エラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTodo();
  }, [id]);

  const handleSave = useCallback(async (_id: string, input: UpdateTodoInput) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("更新に失敗しました");
    const updated: Todo = await res.json();
    setTodo(updated);
    setIsEditing(false);
  }, [id]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm("本当に削除しますか？")) return;
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("削除に失敗しました");
    router.push("/todos");
  }, [id, router]);

  if (isLoading) {
    return <p style={{ textAlign: "center", color: "#888" }}>読み込み中...</p>;
  }

  if (error || !todo) {
    return (
      <div style={{ textAlign: "center", padding: "32px" }}>
        <p style={{ color: "#e74c3c", fontSize: "18px" }}>{error || "Todo が見つかりません"}</p>
        <Link href="/todos" style={{ color: "#3498db" }}>← 一覧に戻る</Link>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div>
        <h1 style={{ fontSize: "24px", marginBottom: "24px" }}>Todo を編集</h1>
        <TodoEditForm todo={todo} onSave={handleSave} onCancel={() => setIsEditing(false)} />
      </div>
    );
  }

  return (
    <div>
      <Link href="/todos" style={{ color: "#3498db", textDecoration: "none", fontSize: "14px" }}>
        ← 一覧に戻る
      </Link>

      <div style={{ marginTop: "16px", padding: "24px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h1 style={{ fontSize: "24px", margin: 0 }}>{todo.title}</h1>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: "12px",
              fontSize: "13px",
              backgroundColor: todo.completed ? "#d4edda" : "#fff3cd",
              color: todo.completed ? "#155724" : "#856404",
            }}
          >
            {todo.completed ? "完了" : "未完了"}
          </span>
        </div>

        {todo.description && (
          <p style={{ color: "#555", lineHeight: 1.6, marginTop: "16px" }}>{todo.description}</p>
        )}

        <div style={{ marginTop: "16px", fontSize: "13px", color: "#999" }}>
          <p>作成日: {new Date(todo.createdAt).toLocaleString("ja-JP")}</p>
          <p>更新日: {new Date(todo.updatedAt).toLocaleString("ja-JP")}</p>
        </div>

        <div style={{ marginTop: "24px", display: "flex", gap: "8px" }}>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: "10px 24px",
              backgroundColor: "#3498db",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            編集する
          </button>
          <button
            onClick={handleDelete}
            style={{
              padding: "10px 24px",
              backgroundColor: "#e74c3c",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}
