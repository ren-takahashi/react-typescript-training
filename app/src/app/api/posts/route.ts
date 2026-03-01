// 【Next.js】Route Handler: GET /api/posts
import { NextResponse } from "next/server";
import postsData from "@/data/posts.json";
import type { Post, ApiResponse } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag");

  let posts: Post[] = postsData;

  if (tag) {
    posts = posts.filter((post) => post.tags.includes(tag));
  }

  const response: ApiResponse<Post[]> = {
    data: posts,
    message: "投稿一覧を取得しました",
  };

  return NextResponse.json(response);
}

// 【Next.js】POST メソッドのハンドラ
export async function POST(request: Request) {
  // 【JavaScript】リクエストボディを JSON として解析
  const body = await request.json();

  // 【TypeScript】受け取ったデータの型チェック（簡易版）
  const { title, content, authorId, tags } = body as {
    title: string;
    content: string;
    authorId: number;
    tags: string[];
  };

  // バリデーション
  if (!title || !content) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "title と content は必須です" },
      { status: 400 }
    );
  }

  // 新しい投稿を作成（実際のアプリではデータベースに保存する）
  const newPost: Post = {
    id: Date.now(), // 簡易的な ID 生成
    title,
    content,
    authorId: authorId || 1,
    publishedAt: new Date().toISOString().split("T")[0],
    tags: tags || [],
  };

  // 注意: JSON ファイルには実際には保存されない（メモリ上の処理のみ）
  // 実際のアプリではデータベースに INSERT する

  const response: ApiResponse<Post> = {
    data: newPost,
    message: "投稿を作成しました",
  };

  return NextResponse.json(response, { status: 201 });
}
