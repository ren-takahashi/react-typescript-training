// 【React】ヘッダーコンポーネント
// 【JavaScript】export default で外部から import 可能にする
export default function Header() {
  return (
    <header style={{ backgroundColor: "#333", color: "#fff", padding: "16px" }}>
      <h1>My Learning App</h1>
    </header>
  );
}