"use client";
import { useState, useEffect } from "react";

export default function SearchSimulator() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 【React】searchTerm が変わるたびに「検索」を実行
  useEffect(() => {
    // 空文字の場合は検索しない
    if (searchTerm.trim() === "") {
      setResults([]);
      return;
    }

    setIsLoading(true);
    console.log(`検索中: "${searchTerm}"`);

    // API 通信のシミュレーション（500ms 後に結果を返す）
    const timer = setTimeout(() => {
      // ダミーの検索結果を生成
      const dummyResults = [
        `${searchTerm}に関する記事1`,
        `${searchTerm}の使い方`,
        `${searchTerm}入門ガイド`,
      ];
      setResults(dummyResults);
      setIsLoading(false);
    }, 500);

    // 【React】クリーンアップ: 前回のタイマーをキャンセル
    // これにより、素早く入力した場合に不要な「検索」が実行されない
    // （デバウンスの簡易的な実装）
    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]); // ← searchTerm が変わるたびに実行

  return (
    <div style={{ padding: "16px" }}>
      <h3>検索シミュレーション</h3>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="検索ワードを入力..."
        style={{ padding: "8px", width: "300px" }}
      />

      {isLoading && <p>検索中...</p>}

      {!isLoading && results.length > 0 && (
        <ul>
          {results.map((result, index) => (
            <li key={index}>{result}</li>
          ))}
        </ul>
      )}
    </div>
  );
}