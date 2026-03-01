"use client";
import { useToggle } from "@/hooks/useToggle";

export default function ToggleExample() {
  const modal = useToggle(false);
  const darkMode = useToggle(false);

  return (
    <div style={darkMode.value ? { backgroundColor: "#fff", color: "#000" } : { backgroundColor: "#000", color: "#fff" }}>
      <h3>useToggle の使用例</h3>

      <button onClick={modal.toggle}>
        モーダル: {modal.value ? "開いている" : "閉じている"}
      </button>

      <button onClick={darkMode.toggle}>
        ダークモード: {darkMode.value ? "ON" : "OFF"}
      </button>

      {modal.value && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            backgroundColor: "#999",
            padding: "24px",
            borderRadius: "8px",
          }}>
            <h3>モーダルの中身</h3>
            <p>カスタム Hook でモーダルの開閉を管理しています。</p>
            <button onClick={modal.setFalse}>閉じる</button>
          </div>
        </div>
      )}
    </div>
  );
}
