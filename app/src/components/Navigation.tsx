"use client";
// 【Next.js】usePathname は next/navigation から import
import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { href: "/", label: "ホーム" },
  { href: "/about", label: "About" },
  { href: "/users", label: "ユーザー" },
  { href: "/posts", label: "投稿" },    // ← 追加
  { href: "/settings", label: "設定" },
];

export default function Navigation() {
  // 【Next.js】現在のパスを取得
  const pathname = usePathname();

  return (
    <nav style={{
      display: "flex",
      gap: "16px",
      padding: "16px",
      backgroundColor: "#333",
    }}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          style={{
            color: pathname === item.href ? "#61dafb" : "#fff",
            textDecoration: "none",
            fontWeight: pathname === item.href ? "bold" : "normal",
          }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
