// 【Next.js】このページでは Client Component を使う
// （クライアントサイドでのデータ取得パターンを学ぶため）
import PostList from "@/components/PostList";
import Link from "next/link";

export default function PostsPage() {
  return (
    <div style={{ padding: "16px" }}>
      <h1>投稿一覧</h1>
      <PostList />
      <div style={{ marginTop: "16px" }}>
        <Link href="/">← ホームに戻る</Link>
      </div>
    </div>
  );
}
