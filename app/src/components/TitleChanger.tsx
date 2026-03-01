"use client";
import { useState, useEffect } from "react";

export default function TitleChanger() {
  const [count, setCount] = useState(0);

  // 【React】useEffect: count が変わるたびにドキュメントタイトルを更新
  useEffect(() => {
    // 【JavaScript】document.title でブラウザのタブタイトルを変更
    document.title = `カウント: ${count}`;
    console.log(`useEffect 実行: count = ${count}`);
  }, [count]); // ← count が変わるたびに実行

  return (
    <div style={{ padding: "16px" }}>
      <h3>ドキュメントタイトル変更</h3>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <p style={{ fontSize: "14px", color: "#666" }}>
        ブラウザのタブのタイトルが変わるのを確認してください
      </p>
    </div>
  );
}
