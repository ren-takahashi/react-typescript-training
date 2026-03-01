// 【TypeScript / React】children の型は React.ReactNode
type CardProps = {
  title: string;
  children: React.ReactNode;  // ← React が提供する型。JSX 要素やテキストなど何でも入る
};

export default function Card({ title, children }: CardProps) {
  return (
    <div style={{
      border: "1px solid #ccc",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "16px",
    }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {/* 【React】children が差し込まれる場所 */}
      <div>{children}</div>
    </div>
  );
}
