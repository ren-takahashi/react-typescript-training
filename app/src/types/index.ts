// 【TypeScript】アプリ全体で使う型を一箇所にまとめる

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  joinedAt: string;
};

export type Post = {
  id: number;
  title: string;
  content: string;
  authorId: number;
  publishedAt: string;
  tags: string[];
};

// API レスポンスの型
export type ApiResponse<T> = {
  data: T;
  message: string;
};

export type ApiErrorResponse = {
  error: string;
  message: string;
};
