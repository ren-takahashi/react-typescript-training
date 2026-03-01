"use client";
import { useState, useEffect } from "react";
import type { Post, ApiResponse } from "@/types";

export default function PostList() {
  // 【React】3つの状態を管理: データ、ローディング、エラー
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 【React】useEffect でマウント時にデータを取得
  useEffect(() => {
    async function fetchPosts() {
      try {
        setIsLoading(true);
        setError(null);

        // 【JavaScript】fetch API で自身の API Route を呼ぶ
        const response = await fetch("/api/posts");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 【TypeScript】レスポンスの型を指定
        const result: ApiResponse<Post[]> = await response.json();
        setPosts(result.data);
      } catch (err) {
        // 【TypeScript】err は unknown 型なので、型チェックが必要
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("不明なエラーが発生しました");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, []); // 空配列 = 初回のみ

  // ローディング中
  if (isLoading) {
    return <p>投稿を読み込み中...</p>;
  }

  // エラー時
  if (error) {
    return (
      <div style={{ color: "red" }}>
        <p>エラー: {error}</p>
        <button onClick={() => window.location.reload()}>再読み込み</button>
      </div>
    );
  }

  // データ表示
  return (
    <div>
      {posts.map((post) => (
        <article
          key={post.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ margin: "0 0 8px 0" }}>{post.title}</h2>
          <p style={{ color: "#666" }}>{post.content}</p>
          <div style={{ display: "flex", gap: "8px" }}>
            {post.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  backgroundColor: "#e3f2fd",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <p style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
            投稿日: {post.publishedAt}
          </p>
        </article>
      ))}
    </div>
  );
}
