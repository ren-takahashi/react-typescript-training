"use client";
import { useRef, useState, useEffect } from "react";

export default function RenderCounter() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");
  
  // 【React】レンダリング回数をカウント
  // この値を変更しても、それ自体は再レンダリングを起こさない
  const renderCount = useRef(0);

  useEffect(() => {
    // ポイント: この行自体は再レンダリングを起こさない
    // でも、他の理由（count や text の変更）で再レンダリングが起きた時に
    // この値が更新され、画面に反映される
    renderCount.current += 1;
    console.log("レンダリングが発生しました！回数:", renderCount.current);
  });

  return (
    <div style={{ padding: "16px", border: "2px solid #ddd", borderRadius: "8px" }}>
      <h3>useRef: 値の保持</h3>
      <p><strong>カウント: {count}</strong></p>
      <p><strong>レンダリング回数: {renderCount.current}</strong></p>
      
      <button onClick={() => setCount(count + 1)}>カウント +1</button>
      
      <div style={{ marginTop: "16px" }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)} /* ← これが再レンダリングを起こす */
          placeholder="ここに入力してみて..."
          style={{ padding: "8px", width: "250px" }}
        />
        <p style={{ fontSize: "14px", color: "#666" }}>入力値: {text}</p>
      </div>
      
      <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#000", borderRadius: "4px", fontSize: "14px" }}>
        <p><strong>確認ポイント:</strong></p>
        <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
          <li><code>setText()</code> や <code>setCount()</code> が再レンダリングを起こす（useState の特徴）</li>
          <li>再レンダリング後に <code>useEffect</code> が実行され、<code>renderCount.current</code> が増える</li>
          <li><strong>重要:</strong> <code>renderCount.current += 1</code> 自体は再レンダリングを起こさない</li>
          <li>もし <code>renderCount</code> を useState で管理したら、値を変えるたびに再レンダリングが起きて無限ループになる</li>
        </ul>
      </div>
    </div>
  );
}