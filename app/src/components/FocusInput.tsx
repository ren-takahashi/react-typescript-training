"use client";
import { useRef } from "react";

export default function FocusInput() {
  // 【React】useRef で DOM 要素への参照を作る
  // 【TypeScript】HTMLInputElement 型を指定し、初期値は null
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFocus() {
    // .current で実際の DOM 要素にアクセスできる
    inputRef.current?.focus(); // 入力欄にフォーカスを当てる
  }

  function handleClear() {
    if (inputRef.current) {
      inputRef.current.value = ""; // 入力値をクリア
      inputRef.current.focus();
    }
  }

  return (
    <div style={{ padding: "16px" }}>
      <h3>useRef: DOM アクセス</h3>
      {/* ref 属性で DOM 要素と useRef を紐付ける */}
      <input ref={inputRef} type="text" placeholder="ここに入力..." style={{ padding: "8px" }} />
      <button onClick={handleFocus}>フォーカス</button>
      <button onClick={handleClear}>クリア</button>
    </div>
  );
}
