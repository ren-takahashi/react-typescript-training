# 【Docker】ベースイメージとして Node.js 20 の LTS（Long Term Support）長期サポート版を使用
# Node.js は JavaScript/TypeScript を実行するためのランタイム環境
FROM node:20-slim

# 【権限関連の記述】一般ユーザーを作成
RUN useradd -m -u 1000 nodeuser

# 【Docker】コンテナ内での作業ディレクトリを設定
WORKDIR /workspace

# 【権限関連の記述】作業ディレクトリの所有権を変更
RUN chown -R nodeuser:nodeuser /workspace

# 【Docker】コンテナが使用するポートを明示（Next.js のデフォルトは 3000）
EXPOSE 3000

# 【Docker】コンテナ起動時に実行されるコマンド
# シェルを起動し、コンテナを待機状態にする
CMD ["tail", "-f", "/dev/null"]