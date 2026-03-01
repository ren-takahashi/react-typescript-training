// 【Next.js】Server Actions を使ったフォーム
// このファイル自体は Server Component

// 【Next.js】Server Action：サーバー側で実行される関数
// "use server" を関数の先頭に書く
async function submitContact(formData: FormData) {
  "use server";

  // この関数はサーバー側で実行される
  // データベースへの保存や、メール送信などが可能

  // 【JavaScript】FormData オブジェクトからデータを取得
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  // バリデーション（サーバー側で行う）
  if (!name || !email || !message) {
    throw new Error("すべてのフィールドを入力してください");
  }

  // ここでデータベースに保存したり、メールを送信したりする
  console.log("Server Action で受信:", { name, email, message });

  // 実際のアプリではリダイレクトやレスポンスを返す
}

export default function ContactPage() {
  return (
    <div style={{ maxWidth: "500px" }}>
      <h1>お問い合わせ</h1>

      {/* 【Next.js】action に Server Action を指定 */}
      {/* formData が自動的に Server Action に渡される */}
      <form action={submitContact}>
        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="name" style={{ display: "block", marginBottom: "4px" }}>
            名前
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: "4px" }}>
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="message" style={{ display: "block", marginBottom: "4px" }}>
            メッセージ
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "12px 24px",
            backgroundColor: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          送信
        </button>
      </form>

      <p style={{ marginTop: "16px", fontSize: "14px", color: "#666" }}>
        ※ Server Actions を使ったフォーム送信のデモです。
        送信結果はサーバーのコンソール（ターミナル）に出力されます。
      </p>
    </div>
  );
}