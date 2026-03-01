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