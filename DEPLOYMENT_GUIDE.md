# 🐳 S2M Docker Deployment Guide

## 📋 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Environment                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐     ┌──────────────┐   ┌────────────┐   │
│  │   Nginx      │────▶│  PHP 8.3-FPM │───│  Redis     │   │
│  │  (Port 443)  │     │              │   │  (Cache)   │   │
│  └──────────────┘     └──────────────┘   └────────────┘   │
│         │                    │                   │          │
│         │             ┌──────┴───────┐          │          │
│         │             │              │          │          │
│         │      ┌──────▼──────┐ ┌────▼────┐    │          │
│         │      │   Queue     │ │ Scheduler│   │          │
│         │      │   Worker    │ │          │   │          │
│         │      └─────────────┘ └──────────┘   │          │
│         │                                      │          │
│         └──────────────────────────────────────┘          │
│                                                             │
│  External Services (via Network):                          │
│  • SQL Server Database                                     │
│  • Wazuh API                                               │
│  • GLPI API                                                │
│  • Elasticsearch (Wazuh Indexer)                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Components

| Container | Role | Resources |
|-----------|------|-----------|
| **app** | PHP-FPM Application | 2 CPU, 512MB RAM |
| **nginx** | Web Server + SSL | 1 CPU, 256MB RAM |
| **redis** | Cache + Session + Queue | 512MB RAM |
| **queue-worker** | Background Jobs | 1 CPU, 512MB RAM |
| **scheduler** | Scheduled Tasks | 512MB RAM |

**Total:** ~5 CPU cores, 2.5GB RAM (adjustable)

## 🚀 Prerequisites

### System Requirements
- Docker 20.10+
- Docker Compose 1.29+
- 4GB+ RAM
- 20GB+ Disk Space
- 2+ CPU cores

### Network Requirements
- Outbound HTTPS access to Wazuh API
- Outbound HTTPS access to GLPI API
- Access to SQL Server (1433/tcp)
- Access to Elasticsearch (9200/tcp)

### SSL Certificates
- You'll need valid SSL certificates (from Let's Encrypt or your CA)
- Store them securely and mount in the container

## 📝 Setup Steps

### 1. Prepare Environment

```bash
# Clone or navigate to your app
cd /path/to/ProjectS2M/App

# Copy environment template
cp .env.docker .env

# Edit with your configuration
nano .env
```

**Critical .env variables to update:**
```env
APP_KEY=base64:...                    # Generate via artisan key:generate
DB_HOST=your-sql-server.database.windows.net
DB_USERNAME=your_username
DB_PASSWORD=your_password
REDIS_PASSWORD=your_redis_password
WAZUH_PASSWORD=your_wazuh_password
WAZUH_INDEXER_PASSWORD=your_indexer_password
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

### 2. Initialize Docker Environment

```bash
# Make scripts executable
chmod +x docker/scripts/*.sh

# Run initialization
./docker/scripts/init.sh

# Follow the prompts and verify output
```

This will:
- Build Docker images
- Generate Laravel APP_KEY
- Run database migrations
- Install npm dependencies
- Build frontend assets
- Seed the database (if configured)

### 3. Deploy

```bash
# Deploy to production
./docker/scripts/deploy.sh

# Or manually:
docker-compose up -d
```

### 4. Verify Deployment

```bash
# Check all containers are running
docker-compose ps

# Check app health
docker-compose logs -f app

# Test connectivity
docker-compose exec app curl http://redis:6379 -v
docker-compose exec app php artisan tinker
```

## 🔐 SSL Configuration

### Option A: Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update .env
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem

# Restart Nginx
docker-compose restart nginx
```

### Option B: Self-Signed (Development Only)

```bash
# Generate self-signed certificate (30 days)
openssl req -x509 -nodes -days 30 \
  -newkey rsa:2048 \
  -keyout /path/to/key.pem \
  -out /path/to/cert.pem

# Update .env with paths
```

## 📊 Monitoring & Logs

### View Logs
```bash
# All containers
docker-compose logs -f

# Specific container
docker-compose logs -f app
docker-compose logs -f nginx
docker-compose logs -f queue-worker

# Last 100 lines
docker-compose logs --tail=100 app
```

### Check Service Status
```bash
# Container stats
docker stats

# Service health
docker-compose ps
docker-compose exec app php artisan tinker
```

### Access Application Logs
```bash
# Logs are stored in storage/logs
docker-compose exec app tail -f storage/logs/laravel.log
```

## 🔧 Common Operations

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild images
docker-compose build --no-cache

# Apply migrations
docker-compose exec app php artisan migrate

# Clear caches
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear

# Restart services
docker-compose restart
```

### Database Management

```bash
# Access database shell
docker-compose exec app php artisan tinker

# Run migrations
docker-compose exec app php artisan migrate --force

# Seed database
docker-compose exec app php artisan db:seed

# Check database connection
docker-compose exec app php artisan db:show
```

### Queue Management

```bash
# Check queue status
docker-compose exec queue-worker php artisan queue:work --help

# Clear queue
docker-compose exec queue-worker php artisan queue:clear

# View failed jobs
docker-compose exec app php artisan queue:failed
```

### Clear All Caches

```bash
# Run cleanup script
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan view:clear
docker-compose exec app php artisan storage:link
```

## ⚠️ Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Common issues:
# - Port already in use: Check PORT and SSL_PORT
# - Database unreachable: Verify DB_HOST and credentials
# - Redis connection: Verify REDIS_PASSWORD
```

### High Memory Usage

```bash
# Check memory usage
docker stats

# Reduce queue workers
# Edit docker-compose.yml and reduce replicas

# Clear Redis cache
docker-compose exec redis redis-cli -a PASSWORD
> FLUSHALL
> exit
```

### Slow Performance

```bash
# Check PHP-FPM performance
docker-compose exec app php -r "phpinfo();" | grep -A 5 "PHP Version"

# Increase PHP workers (php-fpm.conf)
# Typically 2-4 per CPU core

# Check disk I/O
docker stats --no-stream
```

### Database Connection Issues

```bash
# Test SQL Server connectivity
docker-compose exec app php artisan db:show

# Verify connection string
docker-compose exec app php artisan config:show database

# Check firewall rules
# Ensure SQL Server port (1433) is accessible
```

### Queue Not Processing

```bash
# Check queue worker logs
docker-compose logs -f queue-worker

# Verify Redis connection
docker-compose exec queue-worker redis-cli -a PASSWORD ping

# Check failed jobs
docker-compose exec app php artisan queue:failed

# Retry failed jobs
docker-compose exec app php artisan queue:retry all
```

## 🔒 Security Checklist

- [ ] SSL certificates installed and valid
- [ ] `APP_DEBUG=false` in production
- [ ] `withoutVerifying()` removed from API calls (use SSL certs)
- [ ] Database credentials not in version control
- [ ] Redis password configured
- [ ] Rate limiting enabled (check nginx.conf)
- [ ] CORS configured properly (if API)
- [ ] Log files not accessible publicly
- [ ] Regular backups configured

## 📈 Performance Tuning

### PHP-FPM
```ini
pm = dynamic
pm.max_children = 50
pm.start_servers = 20
pm.min_spare_servers = 10
pm.max_spare_servers = 30
request_terminate_timeout = 60
```

### Nginx
```nginx
worker_processes auto;
worker_connections 2048;
client_max_body_size 100M;
keepalive_timeout 65;
```

### Redis
```bash
# For production, consider:
maxmemory 1gb
maxmemory-policy allkeys-lru
```

## 🛠️ Maintenance

### Weekly
- [ ] Review logs for errors
- [ ] Check disk space
- [ ] Monitor queue workers

### Monthly
- [ ] Update packages: `docker-compose exec app composer update`
- [ ] Review security patches
- [ ] Database optimization
- [ ] Backup verification

### Quarterly
- [ ] Performance audit
- [ ] SSL certificate renewal check (if Let's Encrypt)
- [ ] Dependency updates

## 📞 Support & Resources

### Useful Links
- [Laravel Documentation](https://laravel.com/docs)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [PHP-FPM Documentation](https://www.php.net/manual/en/install.fpm.php)

### Debug Commands
```bash
# Container inspection
docker inspect <container_id>

# Network diagnosis
docker network inspect s2m-network

# Process list
docker-compose exec app ps aux

# Disk usage
docker-compose exec app du -sh ./*
```

## 🎯 Next Steps

1. ✅ Update `.env` with production values
2. ✅ Configure SSL certificates
3. ✅ Run `./docker/scripts/init.sh`
4. ✅ Run `./docker/scripts/deploy.sh`
5. ✅ Monitor logs: `docker-compose logs -f app`
6. ✅ Test application at `https://yourdomain.com`
7. ✅ Setup backup strategy
8. ✅ Configure monitoring and alerting

---

**Deployment Date:** $(date)  
**Maintainers:** DevOps Team  
**Last Updated:** 2026-06-16
