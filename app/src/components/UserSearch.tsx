"use client"; // ← useState を使うので Client Component

import { useState } from "react";
import Link from "next/link";

type User = {
  id: number;
  name: string;
  role: string;
};

type UserSearchProps = {
  users: User[]; // Server Component からデータを受け取る
};

export default function UserSearch({ users }: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // 検索でフィルタリング
  const filteredUsers = users.filter((user) =>
    user.name.includes(searchTerm) || user.role.includes(searchTerm)
  );

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="名前 or 役職で検索..."
        style={{ padding: "8px", marginBottom: "16px", width: "300px" }}
      />

      <ul>
        {filteredUsers.map((user) => (
          <li key={user.id}>
            <Link href={`/users/${user.id}`}>
              {user.name}（{user.role}）
            </Link>
          </li>
        ))}
      </ul>

      {filteredUsers.length === 0 && (
        <p style={{ color: "#999" }}>該当するユーザーがいません</p>
      )}
    </div>
  );
}
