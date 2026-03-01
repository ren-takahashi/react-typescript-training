"use client";
import { useState, useEffect } from "react";

export default function InitMessage() {
  const [message, setMessage] = useState("読み込み中...");

  // 【React】空の依存配列 → 初回レンダリング時のみ実行
  useEffect(() => {
    console.log("InitMessage: マウント時に1回だけ実行");

    // 実際の現場では、ここで API からデータを取得することが多い
    // 今回は setTimeout で API 通信をシミュレーション
    const timer = setTimeout(() => {
      setMessage("データの読み込みが完了しました！");
    }, 2000); // 2秒後に実行

    // 【React】クリーンアップ関数（次のセクションで詳しく解説）
    return () => {
      clearTimeout(timer);
    };
  }, []); // ← 空配列 = 初回のみ

  return (
    <div style={{ padding: "16px" }}>
      <h3>初回読み込み</h3>
      <p>{message}</p>
    </div>
  );
}
