# Multi-stage build pour optimiser l'image
FROM php:8.3-fpm-alpine as base

# Installer les extensions PHP requises
RUN apk add --no-cache \
    curl \
    libpq-dev \
    oniguruma-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install \
    pdo \
    pdo_sqlsrv \
    odbc \
    zip \
    mbstring

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Stage de production
FROM base as production

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de l'application
COPY . .

# Installer les dépendances PHP
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-plugins \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader

# Exécuter les scripts post-install
RUN composer run-script post-install-cmd

# Changer propriétaire des fichiers
RUN chown -R www-data:www-data /app

# Créer les répertoires de cache
RUN mkdir -p storage/framework/{sessions,views,cache} \
    && chown -R www-data:www-data storage bootstrap/cache

# Réduire la taille de l'image - nettoyer
RUN rm -rf /app/.git /app/tests /app/node_modules

# Exposer le port PHP-FPM
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:9000/ping || exit 1

# Lancer PHP-FPM
CMD ["php-fpm"]
