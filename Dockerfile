# ベースイメージ
FROM node:20-alpine

# 作業ディレクトリ
WORKDIR /app

# 依存関係を先にコピーしてキャッシュ活用
COPY package.json package-lock.json* ./ 

# 依存関係インストール
RUN npm install

# アプリケーションコードをコピー
COPY . .

# 開発用ポート
EXPOSE 3000

# 開発モードで起動
CMD ["npm", "run", "dev"]