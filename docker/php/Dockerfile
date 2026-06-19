FROM php:8.3-fpm-bookworm

# ----------------------------
# System dependencies
# ----------------------------
RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    ca-certificates \
    gnupg \
    unixodbc-dev \
    apt-transport-https \
    libssl-dev

# ----------------------------
# PHP extensions
# ----------------------------
RUN docker-php-ext-install pdo pdo_mysql zip bcmath

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd

# ----------------------------
# SQL SERVER DRIVER (FIXED)
# ----------------------------

# install GPG tools
RUN apt-get update && apt-get install -y gnupg curl

# Microsoft key (modern secure method)
RUN curl -sSL https://packages.microsoft.com/keys/microsoft.asc \
    | gpg --dearmor \
    | tee /usr/share/keyrings/microsoft.gpg > /dev/null

# Microsoft repo
RUN echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" \
    > /etc/apt/sources.list.d/mssql-release.list

# Install ODBC driver
RUN apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18

# Install PHP SQL Server extensions
RUN pecl install sqlsrv pdo_sqlsrv \
    && docker-php-ext-enable sqlsrv pdo_sqlsrv

# ----------------------------
# Node.js (for Vite / React)
# ----------------------------
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# ----------------------------
# Composer
# ----------------------------
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# ----------------------------
# Workdir
# ----------------------------
WORKDIR /var/www

# ----------------------------
# Default command
# ----------------------------
CMD ["php-fpm"]