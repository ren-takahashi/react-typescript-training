// 【Next.js】Server Component でのデータ取得
import Link from "next/link";
import type { User } from "@/types";
import UserSearch from "@/components/UserSearch";

// 【Next.js】サーバー側で API を呼ぶ関数
async function getUsers(): Promise<User[]> {
  // 注意: Server Component から自身の API Route を呼ぶ場合は
  // 完全な URL が必要（本番環境では環境変数で管理する）
  // ここではモックデータを直接 import する方がシンプル

  // 方法 1: JSON ファイルを直接 import（推奨・シンプル）
  const usersData = (await import("@/data/users.json")).default;
  return usersData as User[];
}

// 【Next.js】async 関数でページを定義
export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div style={{ padding: "16px" }}>
      <h1>ユーザー一覧（{users.length}人）</h1>

      {/* Client Component にデータを渡す */}
      <UserSearch users={users} />

      <Link href="/">← ホームに戻る</Link>
    </div>
  );
}
