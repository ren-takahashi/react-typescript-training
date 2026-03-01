// 【React】ユーザー情報を表示するカードコンポーネント
// ※ Props（外部から渡すデータ）については次の Chapter で詳しく学びます
export default function UserCard(props: { name: string; role: string }) {
  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "8px",
    }}>
      <h3>{props.name}</h3>
      <p>{props.role}</p>
    </div>
  );
}