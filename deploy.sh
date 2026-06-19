#!/bin/bash

set -e

echo "START DEPLOY..."

git pull origin main

echo "Installing PHP dependencies..."
docker compose exec -T app composer install --no-dev --optimize-autoloader

# 3. Frontend build
echo "Building frontend..."
docker compose exec -T app npm install
docker compose exec -T app npm run build

# 4. Laravel optimization
echo "Laravel cache..."
docker compose exec -T app php artisan optimize:clear
docker compose exec -T app php artisan config:cache
docker compose exec -T app php artisan route:cache
docker compose exec -T app php artisan view:cache

# 5. Optional: migration (comment if not needed)
# echo "🗄️ Running migrations..."
# docker compose exec -T app php artisan migrate --force

echo "DEPLOY FINISHED SUCCESSFULLY"

./optimize.sh