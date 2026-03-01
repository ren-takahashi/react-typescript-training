"use client";
import { useState } from "react";

export default function TextInput() {
  const [inputValue, setInputValue] = useState("");
  const [submittedValue, setSubmittedValue] = useState("");

  // 【React / TypeScript】onChange イベントの型
  // React.ChangeEvent<HTMLInputElement> は React が定める型
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    // event.target.value で入力された値を取得
    setInputValue(event.target.value);
  }

  function handleSubmit() {
    setSubmittedValue(inputValue);
    setInputValue(""); // 入力欄をクリア
  }

  return (
    <div style={{ padding: "16px" }}>
      <h3>テキスト入力</h3>

      {/* 【React】value と onChange を組み合わせる = 制御コンポーネント */}
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="名前を入力してください"
        style={{ padding: "8px", marginRight: "8px" }}
      />

      <button onClick={handleSubmit}>送信</button>

      {/* リアルタイムに入力値を表示 */}
      <p>入力中: {inputValue}</p>

      {/* 送信された値を表示 */}
      {submittedValue && (
        <p style={{ color: "green" }}>送信された値: {submittedValue}</p>
      )}
    </div>
  );
}