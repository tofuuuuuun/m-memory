# 最新のNode.js LTSバージョンを使用
FROM node:20-bullseye-slim

# セキュリティアップデートの実行
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends dumb-init && \
    npm install -g npm@latest && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 作業ディレクトリ
WORKDIR /app

# 開発用ポート
EXPOSE 3000

# dumb-initを使用して適切なプロセス管理を行う
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# 開発モードで起動
CMD ["sh", "-c", "cd /app && npm install && npm run dev"]