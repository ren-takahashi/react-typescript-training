"use client";
import { useState, useMemo } from "react";

// 重い計算のシミュレーション
function calculateExpensiveValue(num: number): number {
  console.log("重い計算を実行中...");
  // わざと遅い処理をシミュレーション
  // Math.random() の代わりに単純なループにする（Hydration Error回避）
  let result = 0;
  for (let i = 0; i < num * 100000; i++) {
    result += i * 0.5;
  }
  return Math.round(result);
}

export default function ExpensiveCalculation() {
  const [count, setCount] = useState(10);
  const [text, setText] = useState("");

  // 【React】useMemo: count が変わった時だけ再計算する
  // text が変わっただけでは再計算しない
  const expensiveResult = useMemo(() => {
    return calculateExpensiveValue(count);
  }, [count]); // ← count が変わった時だけ再計算


//   const expensiveResult = calculateExpensiveValue(count);
  // ↑のようにuseMemo を使わないでuseState で管理していたら、
  // text を入力するたびに calculateExpensiveValue（毎回重い計算） が走ってしまう

  return (
    <div style={{ padding: "16px" }}>
      <h3>useMemo: メモ化</h3>
      <p>計算結果: {expensiveResult}</p>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => setCount(count + 1)}>計算値を増やす (count: {count})</button>
        <button onClick={() => setCount(10)} style={{ backgroundColor: "#f0f0f0" }}>リセット</button>
      </div>

      <div style={{ marginTop: "16px" }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="ここに入力しても再計算されない"
          style={{ padding: "8px", width: "300px" }}
        />
        <p>入力値: {text}</p>
      </div>
    </div>
  );
}
