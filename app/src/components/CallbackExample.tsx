"use client";
import { useState, useCallback } from "react";

export default function CallbackExample() {
  const [count, setCount] = useState(0);

  // 【React】useCallback: 関数をメモ化する
  // count が変わらない限り、同じ関数の参照を返す
  const handleIncrement = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []); // 依存配列が空 = 常に同じ関数を返す

  // ※ setCount に関数を渡す形式（prev => prev + 1）にすると、
  //    count を依存配列に入れなくても最新の値を使える

  return (
    <div style={{ padding: "16px" }}>
      <h3>useCallback</h3>
      <p>カウント: {count}</p>
      <button onClick={handleIncrement}>+1</button>
    </div>
  );
}
