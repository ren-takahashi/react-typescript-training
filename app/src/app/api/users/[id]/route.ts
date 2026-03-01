// 【Next.js】Route Handler: GET /api/users/:id
import { NextResponse } from "next/server";
import usersData from "@/data/users.json";
import type { User, ApiResponse, ApiErrorResponse } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = parseInt(id, 10);

  // ユーザーを検索
  const user = usersData.find((u) => u.id === userId) as User | undefined;

  if (!user) {
    const errorResponse: ApiErrorResponse = {
      error: "NOT_FOUND",
      message: `ID: ${id} のユーザーが見つかりません`,
    };
    return NextResponse.json(errorResponse, { status: 404 });
  }

  const response: ApiResponse<User> = {
    data: user,
    message: "ユーザー情報を取得しました",
  };

  return NextResponse.json(response);
}
