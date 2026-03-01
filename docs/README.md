# React + TypeScript + Next.js ハンズオン学習ガイド

## このリポジトリについて

**Next.js + React + TypeScript** を「現場で必要になる実装」を軸に、  
**ハンズオンで段階的に網羅**していくための学習用リポジトリです。

一気に完成品を作るのではなく、**小さな実装単位で手を動かし、理解と再現性を優先**します。

### 学習のゴール

- 現場のコード（Next.js / TSX / React Hooks）を **読める・追える**
- 小さな機能追加や改修を **安全に実装できる**
- 「どこに何を書くか」「ファイルの役割」を **説明できる**

---

## 技術スタックの関係性

```
┌─────────────────────────────────────────────┐
│  Next.js（フレームワーク）                     │
│  ┌───────────────────────────────────────┐   │
│  │  React（UIライブラリ）                  │   │
│  │  ┌─────────────────────────────────┐  │   │
│  │  │  TypeScript（型付きの言語）       │  │   │
│  │  │  ┌───────────────────────────┐  │  │   │
│  │  │  │  JavaScript（ベース言語）   │  │  │   │
│  │  │  └───────────────────────────┘  │  │   │
│  │  └─────────────────────────────────┘  │   │
│  └───────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

| 技術 | 分類 | 一言で言うと |
|------|------|-------------|
| **JavaScript** | プログラミング言語 | ブラウザで動く唯一の言語。すべての土台 |
| **TypeScript** | プログラミング言語（JSの拡張） | JavaScriptに「型」を付けて安全に開発する。コンパイル後はJSになる |
| **React** | UIライブラリ | 画面のパーツ（コンポーネント）を作るためのライブラリ |
| **Next.js** | フレームワーク | Reactをベースに、ルーティング・サーバー処理・ビルドなどを統合したフルスタックフレームワーク |

---

## 学習の進め方

各章のドキュメントに従って、**上から順番に**実装していきます。  
コードは必ず自分の手で打ち込んでください（コピペではなく写経推奨）。

> **💡 ポイント**: 各章の説明では、機能や概念がどの技術に由来するのかを  
> `【React】` `【Next.js】` `【TypeScript】` `【JavaScript】` のようにタグで明示しています。

---

## 章の一覧

### 第0部：環境構築

| 章 | タイトル | 主な技術 |
|----|---------|---------|
| [Chapter 00](./00-environment-setup.md) | 環境構築（Docker + Next.js プロジェクト作成） | Docker, Next.js |
| [Chapter 01](./01-project-structure.md) | プロジェクト構成と各ファイルの役割 | Next.js, TypeScript |

### 第1部：TypeScript の基礎

| 章 | タイトル | 主な技術 |
|----|---------|---------|
| [Chapter 02](./02-typescript-basics.md) | TypeScript の基本的な型と構文 | TypeScript |

### 第2部：React の基礎

| 章 | タイトル | 主な技術 |
|----|---------|---------|
| [Chapter 03](./03-jsx-and-components.md) | JSX とコンポーネント | React |
| [Chapter 04](./04-props-and-types.md) | Props と型定義 | React, TypeScript |
| [Chapter 05](./05-state-and-events.md) | State（useState）とイベントハンドリング | React, TypeScript |
| [Chapter 06](./06-useeffect.md) | useEffect と副作用 | React |
| [Chapter 07](./07-other-hooks.md) | その他の主要 Hooks（useRef / useMemo / useCallback / useContext） | React |

### 第3部：Next.js の基礎

| 章 | タイトル | 主な技術 |
|----|---------|---------|
| [Chapter 08](./08-nextjs-routing.md) | ルーティング（App Router） | Next.js |
| [Chapter 09](./09-nextjs-layout-and-components.md) | レイアウトと Server / Client Components | Next.js, React |
| [Chapter 10](./10-api-routes-and-data-fetching.md) | API Routes とデータ取得（モック JSON 使用） | Next.js, React |

### 第4部：実践

| 章 | タイトル | 主な技術 |
|----|---------|---------|
| [Chapter 11](./11-forms-and-validation.md) | フォーム実装とバリデーション | React, TypeScript, Next.js |
| [Chapter 12](./12-custom-hooks.md) | カスタム Hooks で共通ロジックを切り出す | React, TypeScript |
| [Chapter 13](./13-final-exercise.md) | 総合演習：Todo アプリ開発 | 全技術 |

---

## 前提知識

- HTML / CSS の基本がわかる
- プログラミングの基本（変数、関数、条件分岐、繰り返し）がわかる
- PHP での API 開発経験があれば、型の概念は馴染みやすい
- Docker の基本操作（`docker compose up` など）ができる

---

## 凡例（ドキュメント内のタグ）

| タグ | 意味 |
|------|------|
| `【TypeScript】` | TypeScript 固有の機能・構文 |
| `【JavaScript】` | JavaScript 由来の機能（TypeScript でもそのまま使える） |
| `【React】` | React ライブラリの機能 |
| `【Next.js】` | Next.js フレームワークの機能 |
| `【Docker】` | Docker 関連 |
| `【Node.js】` | Node.js ランタイム・npm 関連 |
