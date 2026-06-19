#!/bin/bash

set -e

echo "OPTIMIZING LARAVEL PRODUCTION..."

# Clear all caches
docker compose exec -T app php artisan optimize:clear

# Rebuild optimized cache
docker compose exec -T app php artisan config:cache
docker compose exec -T app php artisan route:cache
docker compose exec -T app php artisan view:cache

# Optional: clear old logs
docker compose exec -T app bash -c "rm -f storage/logs/laravel.log"

# Composer autoload optimization
docker compose exec -T app composer dump-autoload --optimize

echo "OPTIMIZATION DONE"