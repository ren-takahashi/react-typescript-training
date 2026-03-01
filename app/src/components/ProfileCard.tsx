// 【TypeScript】Props の型定義
type ProfileCardProps = {
  name: string;
  email: string;
  department: string;
  bio?: string;           // 省略可能
  skills: string[];       // 文字列の配列
};

// 【React】関数コンポーネント
// 【JavaScript】分割代入でPropsを取り出す
export default function ProfileCard({
  name,
  email,
  department,
  bio,
  skills,
}: ProfileCardProps) {
  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "16px",
      maxWidth: "400px",
      color: "#333",
    }}>
      <h2 style={{ margin: "0 0 8px 0" }}>{name}</h2>
      <p style={{ color: "#666", margin: "4px 0" }}>{department}</p>
      <p style={{ margin: "4px 0" }}>📧 {email}</p>

      {/* 【React / JavaScript】bio がある場合だけ表示（条件分岐レンダリング） */}
      {bio && (
        <p style={{ fontStyle: "italic", color: "#555" }}>「{bio}」</p>
      )}

      <h4>スキル</h4>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {/* 【React / JavaScript】配列を map() でリスト表示 */}
        {skills.map((skill) => (
          <span
            key={skill}
            style={{
              backgroundColor: "#e3f2fd",
              padding: "4px 12px",
              borderRadius: "16px",
              fontSize: "14px",
            }}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
