#!/bin/bash
set -e

echo "==================================="
echo "🚀 S2M Docker Deployment"
echo "==================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour logs
log_info() { echo -e "${GREEN}✅ $1${NC}"; }
log_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Vérifications pré-déploiement
log_info "Performing pre-deployment checks..."

if [ ! -f .env ]; then
    log_error ".env file not found!"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed!"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose is not installed!"
    exit 1
fi

log_info "All checks passed!"

# Arrêter les conteneurs existants
log_warn "Stopping existing containers..."
docker-compose down

# Construire les images
log_info "Building Docker images..."
docker-compose build --no-cache

# Démarrer les services de base
log_info "Starting services..."
docker-compose up -d redis

# Attendre que Redis soit prêt
log_warn "Waiting for Redis to be ready..."
sleep 5

# Démarrer l'app
docker-compose up -d app

# Attendre que PHP soit prêt
log_warn "Waiting for PHP-FPM to be ready..."
sleep 10

# Migrations
log_info "Running migrations..."
docker-compose exec -T app php artisan migrate --force

# Cache et config
log_info "Clearing caches..."
docker-compose exec -T app php artisan cache:clear
docker-compose exec -T app php artisan config:clear
docker-compose exec -T app php artisan view:clear

# Optimization
log_info "Optimizing application..."
docker-compose exec -T app php artisan config:cache
docker-compose exec -T app php artisan route:cache
docker-compose exec -T app php artisan view:cache
docker-compose exec -T app php artisan optimize

# Frontend
log_info "Building frontend assets..."
docker-compose exec -T app npm install
docker-compose exec -T app npm run build

# Démarrer les workers et scheduler
log_info "Starting queue worker and scheduler..."
docker-compose up -d queue-worker scheduler nginx

# Health checks
log_info "Verifying deployment..."
sleep 5

if docker-compose ps app | grep -q "healthy"; then
    log_info "✓ App container is healthy"
else
    log_warn "App container status unknown"
fi

if docker-compose ps nginx | grep -q "Up"; then
    log_info "✓ Nginx is running"
else
    log_error "Nginx failed to start!"
    exit 1
fi

if docker-compose ps redis | grep -q "healthy"; then
    log_info "✓ Redis is healthy"
else
    log_warn "Redis container status unknown"
fi

echo ""
log_info "==================================="
log_info "🎉 Deployment Complete!"
log_info "==================================="
echo ""
log_info "Running containers:"
docker-compose ps

echo ""
echo "📊 Useful commands:"
echo "  View logs:          docker-compose logs -f app"
echo "  Stop containers:    docker-compose down"
echo "  Restart app:        docker-compose restart app"
echo "  Database shell:     docker-compose exec app php artisan tinker"
echo "  Queue status:       docker-compose exec app php artisan queue:work --help"
echo ""
