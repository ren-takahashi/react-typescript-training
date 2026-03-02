import { redirect } from "next/navigation";

// 一旦ホームページは /todos にリダイレクトするだけのシンプルな実装（後の拡張で変更予定）
export default function Home() {
  redirect("/todos");
}
