// 練習１
// ここに BlogPost 型を定義
type BlogPost = {
  id: number;
  title: string;
  content: string;
  author: string;
  tags: string[];
  status: "draft" | "published";
  publishedAt?: string;
};

// 以下が型チェックを通れば正解
const post1: BlogPost = {
  id: 1,
  title: "TypeScriptの基本",
  content: "TypeScriptは型のある言語です...",
  author: "田中太郎",
  tags: ["TypeScript", "入門"],
  status: "published",
  publishedAt: "2025-01-01",
};

const post2: BlogPost = {
  id: 2,
  title: "下書き記事",
  content: "まだ書き途中...",
  author: "山田花子",
  tags: [],
  status: "draft",
  // publishedAt を省略しても OK
};

console.log(post1, post2);




// 練習２

// 引数と戻り値に型を付けてください
function calculateTotal(price: number, quantity: number, taxRate: number): number {
  return price * quantity * (1 + taxRate);
}

// 正しく動けば OK
console.log(calculateTotal(1000, 3, 0.1)); // 3300