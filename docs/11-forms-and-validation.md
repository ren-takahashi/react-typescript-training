# Chapter 11: フォーム実装とバリデーション

## この章のゴール

- React でフォームを実装するパターンを理解する
- TypeScript を使ったバリデーション（入力値の検証）を実装する
- フォーム送信と API 連携の流れを実装する
- Next.js の **Server Actions** を理解する

## この章で扱う技術

| タグ | 内容 |
|------|------|
| `【React】` | 制御コンポーネント、フォーム送信 |
| `【TypeScript】` | フォームデータの型定義、バリデーション |
| `【Next.js】` | Server Actions |
| `【JavaScript】` | FormData, 正規表現 |

---

## 11-1. フォームの基本パターン（制御コンポーネント） 【React】

Chapter 05 で学んだ制御コンポーネントの応用です。  
複数の入力フィールドを持つフォームを作ります。

**ファイル: `src/components/UserForm.tsx`**（新規作成）

```tsx
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
```

**ファイル: `src/app/settings/profile/page.tsx`**（更新）

```tsx
import UserForm from "@/components/UserForm";
import Link from "next/link";

export default function ProfileSettingsPage() {
  return (
    <div>
      <h1>プロフィール設定</h1>
      <UserForm />
      <div style={{ marginTop: "16px" }}>
        <Link href="/settings">← 設定に戻る</Link>
      </div>
    </div>
  );
}
```

---

## 11-2. フォームの共通パターン

### パターン: 汎用的な入力コンポーネント

入力フィールドのスタイルやエラー表示を共通化できます。

**ファイル: `src/components/FormField.tsx`**（新規作成）

```tsx
// 【React / TypeScript】汎用的なフォームフィールドコンポーネント
type FormFieldProps = {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
};

export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  required = false,
  placeholder,
}: FormFieldProps) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label
        htmlFor={name}
        style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}
      >
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "8px",
          border: `1px solid ${error ? "red" : "#ccc"}`,
          borderRadius: "4px",
        }}
      />
      {error && (
        <p style={{ color: "red", fontSize: "14px", margin: "4px 0 0" }}>
          {error}
        </p>
      )}
    </div>
  );
}
```

### FormField を使った実装例

**ファイル: `src/components/SimpleUserForm.tsx`**（新規作成）

```tsx
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
```

**ファイル: `src/app/register/page.tsx`**（新規作成）

```tsx
import SimpleUserForm from "@/components/SimpleUserForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div style={{ padding: "16px" }}>
      <SimpleUserForm />
      
      <div style={{ marginTop: "24px", maxWidth: "500px" }}>
        <h3>💡 FormField のメリット</h3>
        <ul style={{ fontSize: "14px", color: "#666" }}>
          <li>入力フィールドの見た目が統一される</li>
          <li>エラー表示のロジックが共通化される</li>
          <li>コードの重複が減り、メンテナンスしやすい</li>
          <li>プロジェクト全体で一貫したUI/UX</li>
        </ul>
      </div>

      <div style={{ marginTop: "16px" }}>
        <Link href="/">← ホームに戻る</Link>
      </div>
    </div>
  );
}
```

### FormField を使った場合と使わない場合の比較

**❌ FormField を使わない場合（繰り返しが多い）**
```tsx
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
```

**✅ FormField を使う場合（シンプル）**
```tsx
<FormField
  label="名前"
  name="name"
  value={formData.name}
  onChange={handleChange}
  error={errors.name}
  required
  placeholder="山田太郎"
/>
```

> **💡 ポイント**: 共通のフォーム入力コンポーネントを作ると、  
> プロジェクト全体でフォームの見た目と振る舞いを統一できます。  
> 現場のプロジェクトでよく見るパターンです。

---

## 11-3. Server Actions 【Next.js】

Next.js 14+ の **Server Actions** は、フォーム送信を **サーバー側で直接処理** する仕組みです。  
API Route を別途作る必要がなくなります。

**ファイル: `src/app/contact/page.tsx`**（新規作成）

```tsx
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
```

### 従来の方法 vs Server Actions

| | 従来（API Route + fetch） | Server Actions |
|---|:---:|:---:|
| API Route が必要 | ✅ はい | ❌ 不要 |
| `"use client"` が必要 | ✅ はい | ❌ 不要 |
| JavaScript なしで動作 | ❌ | ✅ |
| 学習コスト | 低い | やや高い |
| 現場での普及度 | 高い | 増加中 |

> **💡 現場では**: Server Actions は比較的新しい機能のため、従来の API Route + fetch パターンも多いです。  
> 両方のパターンを知っておくと、現場のコードに対応しやすくなります。

---

## この章のまとめ

| 概念 | 技術 | 一言で |
|------|------|-------|
| 制御コンポーネント | 【React】 | State で入力値を管理するパターン |
| onChange ハンドラ | 【React】 | `name` 属性を使って共通化できる |
| バリデーション | 【TypeScript】 | 型定義を活用して入力値を検証する |
| フォーム送信 | 【React】 | `onSubmit` + `e.preventDefault()` |
| FormField | 【React】 | 入力コンポーネントの共通化パターン |
| Server Actions | 【Next.js】 | `"use server"` でサーバー側でフォーム処理 |

---

**前の章**: [Chapter 10: API Routes とデータ取得](./10-api-routes-and-data-fetching.md)  
**次の章**: [Chapter 12: カスタム Hooks で共通ロジックを切り出す](./12-custom-hooks.md)
