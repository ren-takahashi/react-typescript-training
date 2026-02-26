# API呼び出しパターンの比較

## パターンA: 個別APIを呼ぶ（推奨・一般的）

### 実装例
```tsx
// /users/[id]/page.tsx
async function getUser(id: string): Promise<User | null> {
  const response = await fetch(`/api/users/${id}`);
  const result = await response.json();
  return result.data;
}

export default async function UserDetailPage({ params }) {
  const { id } = await params;
  const user = await getUser(id); // 個別APIを呼ぶ
  return <div>{user.name}</div>;
}
```

### メリット
- ✅ **最新データを取得できる** - 他のユーザーが更新した内容も反映される
- ✅ **データ転送量が少ない** - 必要な1件だけを取得
- ✅ **権限チェック可能** - API側で「このユーザーはこの情報を見れるか？」を判定
- ✅ **データベース負荷が低い** - 必要な1レコードだけクエリ
- ✅ **キャッシュ制御しやすい** - Next.jsのcacheオプションで制御

### 使うべき場面
- 💰 **ECサイトの商品詳細** - 在庫や価格が頻繁に変わる
- 👤 **顧客情報詳細** - 個人情報なので権限チェック必須
- 📝 **ブログ記事詳細** - コメント数など動的な情報がある
- 🔐 **管理画面** - 権限に応じて表示内容が変わる

---

## パターンB: 全データから抽出（特殊ケース）

### 実装例
```tsx
// /users/[id]/page.tsx
async function getAllUsers(): Promise<User[]> {
  const usersData = (await import("@/data/users.json")).default;
  return usersData as User[];
}

export default async function UserDetailPage({ params }) {
  const { id } = await params;
  const allUsers = await getAllUsers(); // 全データ取得
  const user = allUsers.find(u => u.id === parseInt(id)); // フィルタ
  return <div>{user.name}</div>;
}
```

### メリット
- ✅ **APIリクエストが1回** - 一覧と詳細でデータ共有
- ✅ **オフライン動作可能** - 全データをローカルに持っている
- ✅ **フィルタ・ソートが高速** - メモリ上で処理

### デメリット
- ❌ **データが古い可能性** - 取得後に他のユーザーが更新しても反映されない
- ❌ **不要なデータも転送** - 全ユーザー情報を送信（プライバシー問題）
- ❌ **データ量が多いと遅い** - 10万件のユーザーデータを毎回転送は現実的でない

### 使うべき場面
- 📊 **静的データのマスタ** - 都道府県リスト、カテゴリ一覧など
- 🎮 **オフラインゲーム** - ユーザー端末で完結
- 📚 **ドキュメントサイト** - 記事一覧も詳細も更新頻度が低い
- 🧪 **学習用アプリ** - データ量が少なくシンプル

---

## 現場での判断基準

| 判断ポイント | 個別API | 全データ |
|-------------|:------:|:-------:|
| データ更新頻度 | 高い | 低い |
| データ量 | 多い | 少ない |
| 権限チェック | 必要 | 不要 |
| リアルタイム性 | 必要 | 不要 |
| オフライン動作 | 不要 | 必要 |

## 実際のプロジェクト例

### ECサイト（個別APIパターン）
```tsx
// 商品一覧: /api/products?page=1&limit=20
// 商品詳細: /api/products/12345
// → 在庫・価格は常に最新、権限で値引き率を変える
```

### 企業サイトのメンバー紹介（全データパターン）
```tsx
// 全社員データ: /api/members → 100人程度
// 詳細ページ: クライアント側でフィルタ
// → 更新頻度低い、データ量少ない、権限不要
```

### SNSのユーザープロフィール（個別APIパターン）
```tsx
// プロフィール: /api/users/username
// → 投稿数やフォロワー数が動的、ブロックチェック必要
```

---

## この学習アプリでは？

今回は**両方のパターンを体験**するために：

- **ユーザー詳細ページ** → 個別API（パターンA）で実装
- **理由**: 現場で最も使われるパターンを学ぶため

ただし、Chapter 8のドキュメント例では「全データから抽出」の簡易版も示されています。これは**ルーティングの学習**が主目的だったためです。

## まとめ

> **現場の鉄則**: 「必要なデータだけを、必要なタイミングで取得する」

- 基本は**個別API**を使う
- データが静的で少量なら**全データ**もあり
- 迷ったら個別APIを選ぶ方が安全
