import Link from "next/link";

export default function Header() {
  return (
    <header style={{
      backgroundColor: "#1a1a2e",
      color: "#ffffff",
      padding: "16px 24px",
    }}>
      <Link href="/todos" style={{ color: "#ffffff", textDecoration: "none" }}>
        <h1 style={{ margin: 0, fontSize: "20px" }}>📝 Todo App</h1>
      </Link>
    </header>
  );
}
