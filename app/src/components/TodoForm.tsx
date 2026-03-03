"use client";

import { useState, FormEvent } from "react";
import { CreateTodoInput } from "@/types";

interface TodoFormProps {
  onAdd: (input: CreateTodoInput) => Promise<void>;
}

export default function TodoForm({ onAdd }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (title.trim() === "") {
      setError("タイトルを入力してください");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({ title, description });
      setTitle("");
      setDescription("");
    } catch {
      setError("追加に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "24px" }}>
      <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>新しい Todo を追加</h2>

      <div style={{ marginBottom: "8px" }}>
        <input
          type="text"
          placeholder="タイトル（必須）"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            border: error ? "2px solid #e74c3c" : "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />
        {error && <p style={{ color: "#e74c3c", fontSize: "13px", marginTop: "4px" }}>{error}</p>}
      </div>

      <div style={{ marginBottom: "8px" }}>
        <input
          type="text"
          placeholder="説明（任意）"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          padding: "10px 24px",
          backgroundColor: "#2ecc71",
          color: "#ffffff",
          border: "none",
          borderRadius: "4px",
          fontSize: "16px",
          cursor: isSubmitting ? "not-allowed" : "pointer",
          opacity: isSubmitting ? 0.6 : 1,
        }}
      >
        {isSubmitting ? "追加中..." : "追加する"}
      </button>
    </form>
  );
}