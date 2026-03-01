"use client"; // 【Next.js】Client Component にする（useState を使うため）

// 【React】useState は React が提供する「Hook」の一つ
import { useState } from "react";

export default function Counter() {
  // 【React】useState の構文
  // const [現在の値, 値を更新する関数] = useState(初期値);
  //
  // 【TypeScript】useState<number>(0) のように型を指定できるが、
  // 初期値から推論されるので、この場合は省略可能
  const [count, setCount] = useState(0);

  // ↑ この1行で以下が得られる:
  // - count: 現在のカウント値（number 型）
  // - setCount: count を更新する関数（(value: number) => void 型）

  return (
    <div style={{ padding: "16px" }}>
      <p>カウント: {count}</p>
      {/* 【React】onClick でボタンクリック時の処理を指定 */}
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(0)}>リセット</button>
    </div>
  );
}