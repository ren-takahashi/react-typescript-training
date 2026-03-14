"use client";

import { FormEvent, useState } from "react";
import { Todo, UpdateTodoInput } from "@/types";

interface TodoEditFormProps {
  todo: Todo;
  onSave: (id: string, input: UpdateTodoInput) => Promise<void>;
  onCancel: () => void;
}

export default function TodoEditForm({ todo, onSave, onCancel }: TodoEditFormProps) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (title.trim() === "") {
      setError("タイトルを入力してください");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(todo.id, { title: title.trim(), description: description.trim() });
    } catch {
      setError("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: "12px" }}>
        <label htmlFor="edit-title" style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>
          タイトル
        </label>
        <input
          id="edit-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError("");
          }}
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

      <div style={{ marginBottom: "16px" }}>
        <label htmlFor="edit-description" style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>
          説明
        </label>
        <textarea
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "16px",
            boxSizing: "border-box",
            resize: "vertical",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="submit"
          disabled={isSaving}
          style={{
            padding: "10px 24px",
            backgroundColor: "#3498db",
            color: "#ffffff",
            border: "none",
            borderRadius: "4px",
            cursor: isSaving ? "not-allowed" : "pointer",
            fontSize: "16px",
          }}
        >
          {isSaving ? "保存中..." : "保存する"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          style={{
            padding: "10px 24px",
            backgroundColor: "#95a5a6",
            color: "#ffffff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
