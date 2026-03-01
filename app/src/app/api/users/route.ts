// 【Next.js】Route Handler: GET /api/users
// このファイルは「サーバー側」で実行される

import { NextResponse } from "next/server";
import usersData from "@/data/users.json";
import type { User, ApiResponse } from "@/types";

// 【Next.js】GET メソッドのハンドラ
// PHP でいう Controller のメソッドに相当
export async function GET(request: Request) {
  // 【JavaScript】URL からクエリパラメータを取得
  const { searchParams } = new URL(request.url);
  const department = searchParams.get("department");
  const role = searchParams.get("role");

  // フィルタリング
  let users: User[] = usersData;

  if (department) {
    users = users.filter((user) => user.department === department);
  }
  if (role) {
    users = users.filter((user) => user.role === role);
  }

  // 【Next.js】NextResponse.json() で JSON レスポンスを返す
  const response: ApiResponse<User[]> = {
    data: users,
    message: "ユーザー一覧を取得しました",
  };

  return NextResponse.json(response);
}
