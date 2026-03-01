"use client";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemedCard({ title, content }: { title: string; content: string }) {
  const { theme } = useTheme();

  return (
    <div style={{
      padding: "16px",
      margin: "8px 0",
      borderRadius: "8px",
      backgroundColor: theme === "light" ? "#fff" : "#444",
      color: theme === "light" ? "#333" : "#eee",
      border: `1px solid ${theme === "light" ? "#ddd" : "#666"}`,
    }}>
      <h3>{title}</h3>
      <p>{content}</p>
    </div>
  );
}
