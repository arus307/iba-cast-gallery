# dbコンテナ削除
docker-compose down -v

# db立ち上げ
docker-compose up -d

# dbコンテナのhealthcheckが "healthy" になるまで待つ
echo "Waiting for database to be ready..."
while [ "`docker inspect -f {{.State.Health.Status}} db`" != "healthy" ]; do
    sleep 1;
done
echo "Database is ready!"

# 準備ができたのを確認してから、マイグレーションを実行
yarn migrate:dev
