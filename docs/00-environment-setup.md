# Chapter 00: 環境構築（Docker + Next.js プロジェクト作成）

## この章のゴール

- Docker で Node.js の開発環境を構築する
- Next.js + TypeScript のプロジェクトを作成する
- 開発サーバーを起動してブラウザで確認する

## この章で扱う技術

| タグ | 内容 |
|------|------|
| `【Docker】` | コンテナで開発環境を作る |
| `【Node.js】` | JavaScript / TypeScript を実行するランタイム |
| `【Next.js】` | プロジェクトの雛形を生成する `create-next-app` |

---

## 0-1. 前提の確認

以下がホストマシンにインストールされていることを確認してください。

```bash
docker --version
docker compose version
```

---

## 0-2. プロジェクトのディレクトリ構成（最終形）

この章が終わった時点で、以下のような構成になります。

```
react-typescript-training/
├── docs/                   ← 学習ドキュメント（今読んでいるもの）
├── Dockerfile              ← 【Docker】Nodeの実行環境を定義
├── docker-compose.yml      ← 【Docker】コンテナの設定
├── .dockerignore           ← 【Docker】コンテナに送らないファイルを指定
└── app/                    ← Next.js プロジェクト本体（この章で生成）
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── src/
    │   └── app/
    │       ├── layout.tsx
    │       ├── page.tsx
    │       └── globals.css
    └── ...
```

---

## 0-3. Dockerfile の作成

プロジェクトルートに `Dockerfile` を作成します。

**ファイル: `Dockerfile`**（プロジェクトルート直下）

```dockerfile
# 【Docker】ベースイメージとして Node.js 20 の LTS 版を使用
# Node.js は JavaScript/TypeScript を実行するためのランタイム環境
FROM node:20-slim

# 【Docker】コンテナ内での作業ディレクトリを設定
WORKDIR /workspace

# 【Docker】コンテナが使用するポートを明示（Next.js のデフォルトは 3000）
EXPOSE 3000

# 【Docker】コンテナ起動時に実行されるコマンド
# シェルを起動し、コンテナを待機状態にする
CMD ["tail", "-f", "/dev/null"]
```

### 解説

- `FROM node:20-slim`  
  **【Docker / Node.js】** Node.js 20 がインストールされた軽量な Linux イメージをベースにします。  
  Node.js がないと `npm`（パッケージマネージャ）も Next.js も動きません。

- `WORKDIR /workspace`  
  **【Docker】** コンテナ内の作業ディレクトリです。ここにプロジェクトのファイル群がマウントされます。

- `CMD ["tail", "-f", "/dev/null"]`  
  **【Docker】** コンテナを起動したまま待機させるコマンドです。  
  開発中は `docker compose exec` でコンテナに入ってコマンドを実行するスタイルにします。

---

## 0-4. docker-compose.yml の作成

**ファイル: `docker-compose.yml`**（プロジェクトルート直下）

```yaml
# 【Docker】Docker Compose の設定ファイル
services:
  app:
    # このディレクトリの Dockerfile からイメージをビルド
    build:
      context: .
      dockerfile: Dockerfile
    
    # コンテナ名を明示的に設定
    container_name: react-training

    # ホストの 3000 番ポートをコンテナの 3000 番ポートに接続
    ports:
      - "3000:3000"

    # ホストのファイルをコンテナにマウント（変更がリアルタイムに反映される）
    volumes:
      - ./app:/workspace/app
      - node_modules:/workspace/app/node_modules # node_modules はコンテナ内にだけ保持（ホストと混ぜない）

    # 環境変数
    environment:
      - NODE_ENV=development

    # コンテナを起動し続ける
    tty: true

# 【Docker】名前付きボリューム（node_modules をホストと分離するため）
volumes:
  node_modules:
```

### 解説

- `volumes: - ./app:/workspace/app`  
  **【Docker】** ホスト（あなたのPC）の `app/` ディレクトリを、コンテナ内の `/workspace/app` にマウントします。  
  ホスト側でファイルを編集すると、コンテナ内にもリアルタイムに反映されます。

- `volumes: - node_modules:/workspace/app/node_modules`  
  **【Docker / Node.js】** `node_modules/`（ライブラリの実体が入るフォルダ）は Docker のボリュームで管理し、ホストとは分離します。  
  これにより、OS の違いによる不整合を防ぎます。

---

## 0-5. .dockerignore の作成

**ファイル: `.dockerignore`**（プロジェクトルート直下）

```
node_modules
.next
.git
docs
```

### 解説

**【Docker】** Docker イメージをビルドする際に、不要なファイルをコンテナに送らないようにする設定です。  
`node_modules` や `.next`（ビルド成果物）は重いので除外します。

---

## 0-6. コンテナをビルド・起動する

ターミナルで、プロジェクトルート（`docker-compose.yml` がある場所）に移動して実行します。

```bash
# 【Docker】イメージをビルドしてコンテナをバックグラウンドで起動
docker compose up -d --build
```

起動したか確認します。

```bash
# 【Docker】実行中のコンテナを確認
docker compose ps
```

`react-training` という名前のコンテナが `running` になっていれば OK です。

---

## 0-7. Next.js プロジェクトを作成する

コンテナの中に入って、Next.js のプロジェクトを生成します。

```bash
# 【Docker】コンテナ内でシェルを起動
docker compose exec app bash
```

コンテナ内で以下を実行します。

```bash
# 【Next.js / Node.js】Next.js のプロジェクト生成ツールを実行
# --ts: TypeScript を使用
# --app: App Router を使用（Next.js 13以降の推奨ルーティング方式）
# --src-dir: src/ ディレクトリを使用
# --eslint: ESLint（コード品質チェック）を有効化
# --no-tailwind: Tailwind CSS は今は使わない（後から追加可能）
# --import-alias "@/*": インポート時のエイリアス設定
npx create-next-app@latest app \
  --ts \
  --app \
  --src-dir \
  --eslint \
  --no-tailwind \
  --import-alias "@/*" \
  --use-npm
```

> **📝 補足**: `create-next-app` は **【Next.js】** が提供するプロジェクト生成ツールです。  
> 選択肢を聞かれた場合は、基本的にデフォルト（Enter）で問題ありません。  
> もしTurbopackを使うか聞かれたら `No` を選択してください。
> Would you like to use React Compiler? › No / Yes と聞かれたら今回は `No` を選択してください。

### 生成されたプロジェクトを確認

```bash
# コンテナ内で確認
ls /workspace/app/
```

以下のようなファイル・フォルダが生成されているはずです。

```
README.md
next-env.d.ts
next.config.ts
node_modules/
package-lock.json
package.json
public/
src/
tsconfig.json
```

---

## 0-8. 開発サーバーを起動する

まだコンテナ内にいる状態で、以下を実行します。

```bash
# Next.js プロジェクトのディレクトリに移動
cd /workspace/app

# 【Next.js】開発サーバーを起動
# -H 0.0.0.0: コンテナ外（ホスト）からもアクセスできるようにする
npm run dev -- -H 0.0.0.0
```

以下のような表示が出たら成功です。

```
  ▲ Next.js (バージョン番号)
  - Local:        http://localhost:3000
```

---

## 0-9. ブラウザで確認する

ホストマシン（あなたの PC）のブラウザで以下にアクセスします。

```
http://localhost:3000
```

Next.js のデフォルトページが表示されれば、**環境構築は完了**です！ 🎉

---

## 0-10. 開発サーバーの停止と再起動

### 停止

開発サーバーが動いているターミナルで `Ctrl + C` を押します。

コンテナから出るには：

```bash
exit
```

### コンテナの停止

```bash
# 【Docker】コンテナを停止
docker compose down
```

### 次回の起動方法

```bash
# コンテナを起動
docker compose up -d

# コンテナに入る
docker compose exec app bash

# プロジェクトディレクトリに移動して開発サーバーを起動
cd /workspace/app
npm run dev -- -H 0.0.0.0
```

> **💡 Tip**: 毎回このコマンドを打つのが面倒な場合は、後からスクリプトにまとめることもできます。

---

## 0-11. （補足）docker-compose.yml で開発サーバー自動起動する場合

手動で毎回 `npm run dev` を打つ代わりに、コンテナ起動時に自動で開発サーバーを立ち上げたい場合は、
`docker-compose.yml` の `command` を以下のように変更できます。

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: react-training
    ports:
      - "3000:3000"
    volumes:
      - ./app:/workspace/app
      - node_modules:/workspace/app/node_modules
    environment:
      - NODE_ENV=development
    tty: true
    # ↓ 追加：コンテナ起動時に自動で開発サーバーを起動
    working_dir: /workspace/app
    command: ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
```

ただし、この設定だと `docker compose exec app bash` でコンテナに入って別の作業をする際、
開発サーバーは別プロセスで動いている状態になります。最初は手動起動の方がわかりやすいかもしれません。

---

## この章のまとめ

| やったこと | 技術 |
|-----------|------|
| Dockerfile を作成 | 【Docker】 |
| docker-compose.yml を作成 | 【Docker】 |
| コンテナをビルド・起動 | 【Docker】 |
| Next.js プロジェクトを生成 | 【Next.js】【Node.js】 |
| 開発サーバーを起動してブラウザで確認 | 【Next.js】 |

### ポイント

- **Docker** は開発環境を「箱」に閉じ込めて、どのPCでも同じ環境を再現するためのツール
- **Node.js** は JavaScript / TypeScript を実行するランタイム。`npm` はそのパッケージマネージャ
- **Next.js** の `create-next-app` でプロジェクトの雛形が自動生成される
- 開発サーバーはファイルの変更を検知して自動でブラウザを更新してくれる（**ホットリロード**）

---

**次の章**: [Chapter 01: プロジェクト構成と各ファイルの役割](./01-project-structure.md)
