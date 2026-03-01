// 【Next.js】動的ルーティング: ユーザー詳細ページ
// 【Chapter 10】個別APIを呼ぶパターン（推奨・現場で一般的）
import Link from "next/link";
import type { User, ApiResponse } from "@/types";

type UserDetailPageProps = {
  params: Promise<{ id: string }>;
};

// 【Next.js】個別ユーザーをAPIから取得
async function getUser(id: string): Promise<User | null> {
  try {
    // 【重要】Server Component から自身のAPI Routeを呼ぶ場合
    // 本番環境では完全なURL（環境変数で管理）が必要
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/users/${id}`, {
      // Server Component では cache オプションで挙動を制御
      cache: "no-store", // 毎回最新データを取得
    });

    if (!response.ok) {
      return null;
    }

    const result: ApiResponse<User> = await response.json();
    return result.data;
  } catch (error) {
    console.error("ユーザー取得エラー:", error);
    return null;
  }
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  
  // 【パターンA】個別APIを呼んで1件だけ取得
  const user = await getUser(id);

  if (!user) {
    return (
      <div style={{ padding: "16px" }}>
        <h1>ユーザーが見つかりません</h1>
        <p>ID: {id} のユーザーは存在しません。</p>
        <Link href="/users">← ユーザー一覧に戻る</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px" }}>
      <h1>{user.name}</h1>
      
      <div style={{ 
        backgroundColor: "#f5f5f5", 
        padding: "16px", 
        borderRadius: "8px",
        marginTop: "16px"
      }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <tbody style={{ color: "#000" }}>
            <tr style={{ borderBottom: "1px solid #000" }}>
              <td style={{ padding: "12px", fontWeight: "bold", width: "150px" }}>ID</td>
              <td style={{ padding: "12px" }}>{user.id}</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #000" }}>
              <td style={{ padding: "12px", fontWeight: "bold" }}>名前</td>
              <td style={{ padding: "12px" }}>{user.name}</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #000" }}>
              <td style={{ padding: "12px", fontWeight: "bold" }}>メール</td>
              <td style={{ padding: "12px" }}>{user.email}</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #000" }}>
              <td style={{ padding: "12px", fontWeight: "bold" }}>役職</td>
              <td style={{ padding: "12px" }}>{user.role}</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #000" }}>
              <td style={{ padding: "12px", fontWeight: "bold" }}>部署</td>
              <td style={{ padding: "12px" }}>{user.department}</td>
            </tr>
            <tr>
              <td style={{ padding: "12px", fontWeight: "bold" }}>入社日</td>
              <td style={{ padding: "12px" }}>{user.joinedAt}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ 
        color: "#000",
        marginTop: "24px", 
        padding: "12px",
        backgroundColor: "#e3f2fd",
        borderRadius: "4px",
        fontSize: "14px" 
      }}>
        <p style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>💡 API呼び出しパターン</p>
        <p style={{ margin: 0 }}>
          このページは <strong>個別API (/api/users/{id})</strong> を呼び出しています<br />
          → 最新データを取得、権限チェック可能、データ転送量が少ない
        </p>
      </div>

      <div style={{ marginTop: "16px" }}>
        <Link href="/users">← ユーザー一覧に戻る</Link>
      </div>
    </div>
  );
}
