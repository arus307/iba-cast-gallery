# dbコンテナ削除
docker compose down -v

# db立ち上げ
docker compose up -d --wait postgres

# 準備ができたのを確認してから、マイグレーションを実行
yarn migrate:dev
