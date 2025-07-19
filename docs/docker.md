# 🐳 Docker Guide

Complete Docker setup for development and production environments with multi-service orchestration.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Service Configuration](#service-configuration)
- [Environment Variables](#environment-variables)
- [Networking](#networking)
- [Volumes and Data Persistence](#volumes-and-data-persistence)
- [Health Checks and Monitoring](#health-checks-and-monitoring)
- [Scaling and Load Balancing](#scaling-and-load-balancing)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Development Environment

```bash
# Clone the repository
git clone <your-repo-url>
cd fullstack-template

# Run automated development setup
./scripts/dev-setup.sh

# Or manually:
docker-compose -f docker-compose.dev.yml up -d
```

### Production Environment

```bash
# Configure environment
cp .env.production.example .env
# Edit .env with your production values

# Deploy with automation script
./scripts/deploy.sh latest production

# Or manually:
docker-compose up -d
```

## 🏗️ Architecture Overview

```mermaid
graph TB
    LB[Nginx Load Balancer] --> API[Backend API]
    LB --> CLIENT[Client App]
    LB --> ADMIN[Admin Dashboard]
    
    API --> DB[(MongoDB)]
    API --> CACHE[(Redis)]
    
    CLIENT --> API
    ADMIN --> API
    
    subgraph "Docker Network"
        API
        CLIENT
        ADMIN
        DB
        CACHE
        LB
    end
```

### Services Architecture

| Service | Purpose | Ports | Dependencies |
|---------|---------|-------|--------------|
| **mongodb** | Database | 27017 | - |
| **redis** | Caching/Sessions | 6379 | - |
| **backend** | API Server | 5000 | mongodb, redis |
| **client** | User Frontend | 3000 | backend |
| **admin** | Admin Dashboard | 3001 | backend |
| **nginx** | Load Balancer | 80, 443 | backend, client, admin |

## 💻 Development Setup

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Git

### Configuration Files

**docker-compose.dev.yml** - Development orchestration
- Hot reloading enabled
- Volume mounts for source code
- Development dependencies included
- Debug ports exposed

**Individual Dockerfile.dev** files:
- `backend/Dockerfile.dev` - Node.js with hot reload
- `frontend/client/Dockerfile.dev` - React dev server
- `frontend/admin/Dockerfile.dev` - Admin dev server

### Development Commands

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs (all services)
docker-compose -f docker-compose.dev.yml logs -f

# View logs (specific service)
docker-compose -f docker-compose.dev.yml logs -f backend

# Restart a service
docker-compose -f docker-compose.dev.yml restart backend

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Remove volumes (reset data)
docker-compose -f docker-compose.dev.yml down -v

# Rebuild a service
docker-compose -f docker-compose.dev.yml build backend
docker-compose -f docker-compose.dev.yml up -d backend

# Execute commands in containers
docker-compose -f docker-compose.dev.yml exec backend npm test
docker-compose -f docker-compose.dev.yml exec backend sh

# Install new packages
docker-compose -f docker-compose.dev.yml exec backend npm install package-name
docker-compose -f docker-compose.dev.yml exec client npm install package-name
```

### Development Features

- **Hot Reload**: Code changes automatically refresh
- **Volume Mounts**: Source code mounted for instant updates
- **Debug Access**: All ports exposed for debugging
- **Development Tools**: Full dev dependencies available

## 🚀 Production Deployment

### Prerequisites

- Production server with Docker
- Domain names configured
- SSL certificates (optional)
- Environment variables configured

### Production Dockerfiles

**Multi-stage builds** for optimized production images:

- `backend/Dockerfile.prod` - Multi-stage Node.js build
- `frontend/client/Dockerfile` - React build + Nginx
- `frontend/admin/Dockerfile` - Admin build + Nginx

### Production Features

- **Optimized Images**: Multi-stage builds, minimal base images
- **Security**: Non-root users, minimal attack surface
- **Performance**: Gzip compression, static asset caching
- **Health Checks**: Automated health monitoring
- **Restart Policies**: Automatic service recovery

### Deployment Script

The `scripts/deploy.sh` script automates:

1. **Building** optimized production images
2. **Health Checks** before deployment
3. **Rolling Updates** with zero downtime
4. **Registry Push** if configured
5. **Service Verification** after deployment

```bash
# Deploy with version tag
./scripts/deploy.sh v1.0.0 production

# Deploy latest to staging
./scripts/deploy.sh latest staging
```

## ⚙️ Service Configuration

### MongoDB Configuration

```yaml
mongodb:
  image: mongo:7.0
  environment:
    MONGO_INITDB_ROOT_USERNAME: admin
    MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
    MONGO_INITDB_DATABASE: fullstack_app
  volumes:
    - mongodb_data:/data/db
    - ./scripts/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
```

**Features:**
- Automatic initialization with sample data
- Persistent data storage
- Authentication enabled
- Custom initialization scripts

### Redis Configuration

```yaml
redis:
  image: redis:7-alpine
  command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
  volumes:
    - redis_data:/data
```

**Features:**
- Persistent storage with AOF
- Password authentication
- Memory optimization

### Backend API Configuration

```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile.prod
  environment:
    NODE_ENV: production
    MONGODB_URI: ${MONGODB_URI}
    JWT_SECRET: ${JWT_SECRET}
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

**Features:**
- Health check endpoints
- Environment-based configuration
- Graceful shutdown handling
- Resource limits

### Frontend Configuration

```yaml
client:
  build:
    context: ./frontend/client
    dockerfile: Dockerfile
  healthcheck:
    test: ["CMD", "wget", "--spider", "http://localhost/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

**Features:**
- Nginx-based serving
- Health check endpoints
- Static asset optimization
- Security headers

## 🔧 Environment Variables

### Required Variables

```env
# Database
MONGODB_URI=mongodb://admin:password@mongodb:27017/fullstack_app?authSource=admin
MONGO_ROOT_PASSWORD=secure-mongodb-password
MONGO_DATABASE=fullstack_app

# Security
JWT_SECRET=your-256-bit-secret-key
JWT_REFRESH_SECRET=your-256-bit-refresh-secret

# URLs
FRONTEND_URL=https://yourdomain.com
ADMIN_URL=https://admin.yourdomain.com

# Cache
REDIS_PASSWORD=secure-redis-password
```

### Optional Variables

```env
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-app-password

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# SSL
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

## 🌐 Networking

### Docker Networks

All services communicate through a custom bridge network:

```yaml
networks:
  fullstack-network:
    driver: bridge
```

### Service Communication

- **Internal DNS**: Services communicate using service names
- **Port Mapping**: Only necessary ports exposed to host
- **Isolation**: Network isolation from other Docker projects

### Load Balancer Configuration

Nginx configuration (`nginx/nginx.conf`):

```nginx
upstream backend {
    least_conn;
    server backend:5000 max_fails=3 fail_timeout=30s;
}

upstream client {
    least_conn;
    server client max_fails=3 fail_timeout=30s;
}
```

## 💾 Volumes and Data Persistence

### Volume Types

1. **Named Volumes**: Persistent data storage
   - `mongodb_data:/data/db`
   - `redis_data:/data`

2. **Bind Mounts**: Development file sharing
   - `./backend:/app` (development only)
   - `./frontend/client:/app` (development only)

3. **Config Mounts**: Configuration files
   - `./nginx/nginx.conf:/etc/nginx/nginx.conf:ro`
   - `./scripts/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro`

### Backup and Restore

```bash
# Backup MongoDB
docker-compose exec mongodb mongodump --out /backup
docker cp $(docker-compose ps -q mongodb):/backup ./backup

# Restore MongoDB
docker cp ./backup $(docker-compose ps -q mongodb):/backup
docker-compose exec mongodb mongorestore /backup

# Backup Redis
docker-compose exec redis redis-cli BGSAVE
docker cp $(docker-compose ps -q redis):/data/dump.rdb ./redis-backup.rdb
```

## 🔍 Health Checks and Monitoring

### Built-in Health Checks

All services include health checks:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Monitoring Commands

```bash
# Check service health
docker-compose ps

# View health check logs
docker inspect $(docker-compose ps -q backend) | jq '.[0].State.Health'

# Monitor resource usage
docker stats

# View container logs
docker-compose logs -f --tail=100 backend
```

### Custom Health Endpoints

- **Backend**: `GET /health` - API health and database connectivity
- **Frontend**: `GET /health` - Static file serving status
- **Nginx**: `GET /nginx-status` - Nginx status page

## 📈 Scaling and Load Balancing

### Horizontal Scaling

```bash
# Scale backend service
docker-compose up -d --scale backend=3

# Scale with resource limits
docker-compose up -d --scale backend=3 --scale client=2
```

### Docker Swarm Deployment

```bash
# Initialize swarm mode
docker swarm init

# Deploy as stack
docker stack deploy -c docker-compose.yml fullstack

# Scale services
docker service scale fullstack_backend=5
docker service scale fullstack_client=3

# Rolling updates
docker service update --image fullstack-backend:v2.0.0 fullstack_backend
```

### Load Balancer Configuration

Nginx upstream configuration supports:
- **Load Balancing**: Round-robin, least connections
- **Health Checks**: Automatic unhealthy server removal
- **Session Persistence**: Sticky sessions if needed
- **Rate Limiting**: Request throttling

## 🔒 Security Best Practices

### Container Security

1. **Non-root Users**: All containers run as non-root users
2. **Minimal Images**: Alpine-based images for smaller attack surface
3. **Read-only Filesystems**: Where possible
4. **Security Headers**: Nginx security headers configured

### Network Security

1. **Internal Networks**: Services isolated in custom networks
2. **Port Exposure**: Only necessary ports exposed
3. **TLS Encryption**: HTTPS/SSL termination at load balancer
4. **Rate Limiting**: Request throttling configured

### Secrets Management

```bash
# Use Docker secrets in swarm mode
echo "my-secret-password" | docker secret create mongodb_password -

# Reference in compose file
secrets:
  - mongodb_password
```

### Environment Security

```bash
# Never commit .env files
echo ".env" >> .gitignore

# Use .env.example templates
cp .env.production.example .env
```

## 🔧 Troubleshooting

### Common Issues

#### Services Won't Start

```bash
# Check logs
docker-compose logs service-name

# Check resource usage
docker system df
docker system prune

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

#### Database Connection Issues

```bash
# Check MongoDB logs
docker-compose logs mongodb

# Test connection
docker-compose exec backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected'))
  .catch(err => console.error('Failed:', err));
"
```

#### Frontend Build Issues

```bash
# Clear build cache
docker-compose build --no-cache client

# Check build logs
docker-compose logs client

# Manual build test
docker-compose exec client npm run build
```

### Performance Issues

```bash
# Monitor resource usage
docker stats

# Check container limits
docker inspect container-name | grep -A 10 "Resources"

# Optimize images
docker-compose build --compress
```

### Debug Mode

```bash
# Enable debug logging
export COMPOSE_LOG_LEVEL=DEBUG
docker-compose up -d

# Run with debug output
docker-compose --verbose up -d
```

### Port Conflicts

```bash
# Check port usage
netstat -tlnp | grep :3000
lsof -i :3000

# Use different ports
export CLIENT_PORT=3002
docker-compose up -d
```

## 📚 Additional Resources

### Docker Commands Reference

```bash
# Image management
docker images
docker rmi image-name
docker image prune

# Container management
docker ps -a
docker rm container-name
docker container prune

# Volume management
docker volume ls
docker volume rm volume-name
docker volume prune

# Network management
docker network ls
docker network inspect network-name
docker network prune

# System cleanup
docker system prune -a
docker system df
```

### Useful Aliases

```bash
# Add to ~/.bashrc or ~/.zshrc
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'
alias dcb='docker-compose build'
alias dcp='docker-compose ps'
alias dce='docker-compose exec'
```

### Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backups configured
- [ ] Monitoring setup
- [ ] Log aggregation configured
- [ ] Resource limits set
- [ ] Health checks enabled
- [ ] Security scanning completed
- [ ] Load testing performed
- [ ] Disaster recovery plan documented

## 🤝 Contributing

When contributing Docker-related changes:

1. Test in both development and production modes
2. Update documentation for new services
3. Ensure health checks are included
4. Follow security best practices
5. Test scaling scenarios
6. Verify backup/restore procedures

For more information, see the main [Contributing Guide](../CONTRIBUTING.md).
