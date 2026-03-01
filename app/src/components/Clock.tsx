"use client";
import { useState, useEffect } from "react";

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    console.log("Clock: タイマー開始");

    // 【JavaScript】setInterval: 一定間隔で処理を繰り返す
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000); // 1秒ごと

    // 【React】クリーンアップ関数: コンポーネントが消える時にタイマーを解除
    return () => {
      console.log("Clock: タイマー停止（クリーンアップ）");
      clearInterval(intervalId);
    };
  }, []); // 初回のみタイマーを設定

  return (
    <div style={{ padding: "16px" }}>
      <h3>現在時刻</h3>
      <p style={{ fontSize: "24px", fontFamily: "monospace" }}>
        {time.toLocaleTimeString("ja-JP")}
      </p>
    </div>
  );
}