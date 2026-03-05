"use client";

import { TodoFilter as FilterType } from "@/types";

interface TodoFilterProps {
  current: FilterType;
  counts: { all: number; active: number; completed: number };
  onChange: (filter: FilterType) => void;
}

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "active", label: "未完了" },
  { value: "completed", label: "完了済み" },
];

export default function TodoFilter({ current, counts, onChange }: TodoFilterProps) {
  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
      {FILTER_OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          style={{
            padding: "8px 16px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: current === value ? "#1a1a2e" : "#ffffff",
            color: current === value ? "#ffffff" : "#333333",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          {label}（{counts[value]}）
        </button>
      ))}
    </div>
  );
}