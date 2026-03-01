"use client";
import { useState } from "react";

// 【TypeScript】フォームのデータ型を定義
type UserFormData = {
  name: string;
  email: string;
  role: string;
  department: string;
  bio: string;
};

// 【TypeScript】バリデーションエラーの型
// Partial にすることで、エラーがないフィールドは undefined になる
type FormErrors = Partial<Record<keyof UserFormData, string>>;

// 初期値
const initialFormData: UserFormData = {
  name: "",
  email: "",
  role: "",
  department: "",
  bio: "",
};

export default function UserForm() {
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<string | null>(null);

  // 【React】入力値の変更を処理する共通ハンドラ
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    // 【JavaScript】スプレッド構文で既存のデータをコピーし、変更されたフィールドだけ更新
    setFormData({ ...formData, [name]: value });

    // 入力時にそのフィールドのエラーをクリア
    if (errors[name as keyof UserFormData]) {
      setErrors({ ...errors, [name]: undefined });
    }
  }

  // 【TypeScript】バリデーション関数
  function validate(data: UserFormData): FormErrors {
    const newErrors: FormErrors = {};

    // 名前: 必須、2文字以上
    if (!data.name.trim()) {
      newErrors.name = "名前は必須です";
    } else if (data.name.trim().length < 2) {
      newErrors.name = "名前は2文字以上で入力してください";
    }

    // メール: 必須、形式チェック
    if (!data.email.trim()) {
      newErrors.email = "メールアドレスは必須です";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "有効なメールアドレスを入力してください";
    }

    // 役職: 必須
    if (!data.role) {
      newErrors.role = "役職を選択してください";
    }

    // 部署: 必須
    if (!data.department) {
      newErrors.department = "部署を選択してください";
    }

    // 自己紹介: 任意だが、入力する場合は10文字以上
    if (data.bio && data.bio.trim().length < 10) {
      newErrors.bio = "自己紹介は10文字以上で入力してください";
    }

    return newErrors;
  }

  // 【React】フォーム送信処理
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // 【JavaScript】デフォルトの送信動作（ページ遷移）を防止
    e.preventDefault();

    // バリデーション
    const validationErrors = validate(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // エラーがあれば送信しない
    }

    // 送信処理
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      // API に POST リクエストを送る（シミュレーション）
      // 実際のアプリでは fetch("/api/users", { method: "POST", body: ... })
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1秒待つ

      console.log("送信データ:", formData);
      setSubmitResult("ユーザーを登録しました！");
      setFormData(initialFormData); // フォームをリセット
    } catch {
      setSubmitResult("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
      <h2>ユーザー登録</h2>

      {/* 名前 */}
      <div style={{ marginBottom: "16px" }}>
        <label htmlFor="name" style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>
          名前 <span style={{ color: "red" }}>*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "8px",
            border: `1px solid ${errors.name ? "red" : "#ccc"}`,
            borderRadius: "4px",
          }}
        />
        {errors.name && <p style={{ color: "red", fontSize: "14px", margin: "4px 0 0" }}>{errors.name}</p>}
      </div>

      {/* メールアドレス */}
      <div style={{ marginBottom: "16px" }}>
        <label htmlFor="email" style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>
          メールアドレス <span style={{ color: "red" }}>*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "8px",
            border: `1px solid ${errors.email ? "red" : "#ccc"}`,
            borderRadius: "4px",
          }}
        />
        {errors.email && <p style={{ color: "red", fontSize: "14px", margin: "4px 0 0" }}>{errors.email}</p>}
      </div>

      {/* 役職（セレクトボックス） */}
      <div style={{ marginBottom: "16px" }}>
        <label htmlFor="role" style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>
          役職 <span style={{ color: "red" }}>*</span>
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "8px",
            border: `1px solid ${errors.role ? "red" : "#ccc"}`,
            borderRadius: "4px",
          }}
        >
          <option value="">-- 選択してください --</option>
          <option value="エンジニア">エンジニア</option>
          <option value="デザイナー">デザイナー</option>
          <option value="マネージャー">マネージャー</option>
          <option value="その他">その他</option>
        </select>
        {errors.role && <p style={{ color: "red", fontSize: "14px", margin: "4px 0 0" }}>{errors.role}</p>}
      </div>

      {/* 部署 */}
      <div style={{ marginBottom: "16px" }}>
        <label htmlFor="department" style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>
          部署 <span style={{ color: "red" }}>*</span>
        </label>
        <select
          id="department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "8px",
            border: `1px solid ${errors.department ? "red" : "#ccc"}`,
            borderRadius: "4px",
          }}
        >
          <option value="">-- 選択してください --</option>
          <option value="開発部">開発部</option>
          <option value="デザイン部">デザイン部</option>
          <option value="インフラ部">インフラ部</option>
          <option value="営業部">営業部</option>
        </select>
        {errors.department && <p style={{ color: "red", fontSize: "14px", margin: "4px 0 0" }}>{errors.department}</p>}
      </div>

      {/* 自己紹介（テキストエリア） */}
      <div style={{ marginBottom: "16px" }}>
        <label htmlFor="bio" style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>
          自己紹介（任意）
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={4}
          style={{
            width: "100%",
            padding: "8px",
            border: `1px solid ${errors.bio ? "red" : "#ccc"}`,
            borderRadius: "4px",
          }}
        />
        {errors.bio && <p style={{ color: "red", fontSize: "14px", margin: "4px 0 0" }}>{errors.bio}</p>}
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          padding: "12px 24px",
          backgroundColor: isSubmitting ? "#ccc" : "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: isSubmitting ? "not-allowed" : "pointer",
          fontSize: "16px",
        }}
      >
        {isSubmitting ? "送信中..." : "登録する"}
      </button>

      {/* 送信結果メッセージ */}
      {submitResult && (
        <p style={{
          marginTop: "16px",
          padding: "12px",
          backgroundColor: submitResult.includes("エラー") ? "#fee" : "#efe",
          borderRadius: "4px",
        }}>
          {submitResult}
        </p>
      )}
    </form>
  );
}
