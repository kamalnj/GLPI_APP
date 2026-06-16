#!/bin/bash
set -e

echo "==================================="
echo "🚀 S2M Docker Initialization"
echo "==================================="

# Vérifier que .env existe
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📋 Copying from .env.docker..."
    cp .env.docker .env
    echo "✅ .env created from .env.docker"
    echo "⚠️  Please update .env with your configuration!"
    exit 1
fi

echo "📦 Building Docker images..."
docker-compose build --no-cache

echo "🔧 Generating Laravel APP_KEY..."
docker-compose run --rm app php artisan key:generate || true

echo "💾 Running migrations..."
docker-compose run --rm app php artisan migrate --force || true

echo "🗑️  Clearing caches..."
docker-compose run --rm app php artisan cache:clear
docker-compose run --rm app php artisan config:clear
docker-compose run --rm app php artisan view:clear

echo "📦 Installing npm dependencies..."
docker-compose run --rm app npm install

echo "🔨 Building frontend assets..."
docker-compose run --rm app npm run build

echo "🌱 Seeding database (if needed)..."
docker-compose run --rm app php artisan db:seed || true

echo "✅ All containers ready!"
echo ""
echo "==================================="
echo "📝 Next Steps:"
echo "==================================="
echo "1. Update .env file with your configuration"
echo "2. Configure SSL certificates:"
echo "   - Update SSL_CERT_PATH and SSL_KEY_PATH in .env"
echo "3. Start containers: docker-compose up -d"
echo "4. Check logs: docker-compose logs -f app"
echo ""
echo "🌐 Access your app at: https://yourdomain.com"
echo "==================================="
