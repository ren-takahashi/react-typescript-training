"use client";
import { useState } from "react";
import FormField from "./FormField";

type SimpleFormData = {
  name: string;
  email: string;
  password: string;
};

type FormErrors = Partial<Record<keyof SimpleFormData, string>>;

const initialData: SimpleFormData = {
  name: "",
  email: "",
  password: "",
};

export default function SimpleUserForm() {
  const [formData, setFormData] = useState<SimpleFormData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<string | null>(null);

  // 共通の入力変更ハンドラ
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // エラークリア
    if (errors[name as keyof SimpleFormData]) {
      setErrors({ ...errors, [name]: undefined });
    }
  }

  // バリデーション
  function validate(data: SimpleFormData): FormErrors {
    const newErrors: FormErrors = {};

    if (!data.name.trim()) {
      newErrors.name = "名前は必須です";
    } else if (data.name.trim().length < 2) {
      newErrors.name = "名前は2文字以上で入力してください";
    }

    if (!data.email.trim()) {
      newErrors.email = "メールアドレスは必須です";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "有効なメールアドレスを入力してください";
    }

    if (!data.password) {
      newErrors.password = "パスワードは必須です";
    } else if (data.password.length < 8) {
      newErrors.password = "パスワードは8文字以上で入力してください";
    }

    return newErrors;
  }

  // フォーム送信
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("送信データ:", formData);
      setSubmitResult("登録が完了しました！");
      setFormData(initialData);
      setErrors({});
    } catch {
      setSubmitResult("エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
      <h2>シンプルな登録フォーム</h2>

      {/* 【パターン】FormField を使うことでコードがスッキリ */}
      <FormField
        label="名前"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
        placeholder="山田太郎"
      />

      <FormField
        label="メールアドレス"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
        placeholder="example@example.com"
      />

      <FormField
        label="パスワード"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required
        placeholder="8文字以上"
      />

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
          marginTop: "8px",
        }}
      >
        {isSubmitting ? "送信中..." : "登録する"}
      </button>

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