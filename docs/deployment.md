# Deployment Guide

This guide covers deployment strategies for the fullstack application including backend API, client application, and admin dashboard.

## 🏗️ Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │  Admin Dashboard │    │   Backend API   │
│   (Port 3000)   │    │   (Port 3001)    │    │   (Port 5000)   │
│                 │    │                  │    │                 │
│  React + Vite   │    │   React + Vite   │    │ Node.js + Express│
│  Static Assets  │    │   Static Assets  │    │   + MongoDB     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Load Balancer │
                    │    + SSL/TLS    │
                    └─────────────────┘
```

## 🚀 Quick Deployment Options

### Option 1: Vercel + Railway (Recommended)
- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Railway
- **Database**: MongoDB Atlas

### Option 2: Netlify + Heroku
- **Frontend**: Deploy to Netlify
- **Backend**: Deploy to Heroku
- **Database**: MongoDB Atlas

### Option 3: AWS Full Stack
- **Frontend**: S3 + CloudFront
- **Backend**: EC2 or ECS
- **Database**: DocumentDB or Atlas

### Option 4: Self-Hosted
- **All**: Docker containers on VPS
- **Database**: Self-hosted MongoDB

## 📦 Backend Deployment

### Environment Variables
Create production environment variables:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-production-jwt-secret-256-bits-long
JWT_REFRESH_SECRET=your-production-refresh-secret-256-bits-long
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
FRONTEND_URL=https://yourdomain.com
ADMIN_URL=https://admin.yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Railway Deployment

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy backend:**
   ```bash
   cd backend
   railway login
   railway init
   railway add
   ```

3. **Set environment variables:**
   ```bash
   railway variables:set NODE_ENV=production
   railway variables:set MONGODB_URI=your-mongodb-uri
   # Set all required variables
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

### Heroku Deployment

1. **Create Heroku app:**
   ```bash
   cd backend
   heroku create your-app-name
   ```

2. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your-mongodb-uri
   # Set all required variables
   ```

3. **Deploy:**
   ```bash
   git push heroku main
   ```

### Docker Deployment

#### Quick Start with Docker Compose

1. **Development Environment:**
   ```bash
   # Clone the repository
   git clone <your-repo-url>
   cd fullstack-template
   
   # Run the development setup script
   ./scripts/dev-setup.sh
   ```

2. **Production Environment:**
   ```bash
   # Copy and configure environment file
   cp .env.production.example .env
   # Edit .env with your production values
   
   # Deploy with the deployment script
   ./scripts/deploy.sh latest production
   ```

#### Manual Docker Commands

**Development:**
```bash
# Start all services in development mode
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

**Production:**
```bash
# Start all services in production mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Individual Service Builds

**Backend:**
```bash
# Development
docker build -f backend/Dockerfile.dev -t fullstack-backend:dev backend

# Production
docker build -f backend/Dockerfile.prod -t fullstack-backend:prod backend
```

**Frontend Client:**
```bash
# Development
docker build -f frontend/client/Dockerfile.dev -t fullstack-client:dev frontend/client

# Production
docker build -f frontend/client/Dockerfile -t fullstack-client:prod frontend/client
```

**Admin Dashboard:**
```bash
# Development
docker build -f frontend/admin/Dockerfile.dev -t fullstack-admin:dev frontend/admin

# Production
docker build -f frontend/admin/Dockerfile -t fullstack-admin:prod frontend/admin
```

#### Docker Architecture

The Docker setup includes:
- **MongoDB** - Database with initialization scripts
- **Redis** - Caching and session storage
- **Backend API** - Node.js/Express application
- **Client App** - React application served by Nginx
- **Admin Dashboard** - React admin app served by Nginx
- **Nginx Load Balancer** - Optional reverse proxy and load balancer

#### Environment Variables

Create `.env` file for production:
```env
# Database
MONGODB_URI=mongodb://admin:password@mongodb:27017/fullstack_app?authSource=admin
MONGO_ROOT_PASSWORD=your-secure-mongodb-password

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-256-bits-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-256-bits-long

# URLs
FRONTEND_URL=https://yourdomain.com
ADMIN_URL=https://admin.yourdomain.com

# Redis
REDIS_PASSWORD=your-secure-redis-password
```

#### Health Checks

All services include health checks:
- **Backend**: `GET /health`
- **Frontend Apps**: `GET /health`
- **MongoDB**: Connection check
- **Redis**: Ping command

#### Scaling with Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml fullstack

# Scale services
docker service scale fullstack_backend=3
docker service scale fullstack_client=2

# View services
docker service ls
```

### PM2 Deployment (VPS)

1. **Install PM2:**
   ```bash
   npm install -g pm2
   ```

2. **Create ecosystem file:**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'fullstack-api',
       script: 'dist/server.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'development'
       },
       env_production: {
         NODE_ENV: 'production',
         PORT: 5000
       }
     }]
   };
   ```

3. **Deploy:**
   ```bash
   npm run build
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

## 🌐 Frontend Deployment

### Environment Variables
Create production environment files:

**Client App (.env.production):**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=Your App
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
```

**Admin Dashboard (.env.production):**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=Admin Dashboard
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
```

### Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy client app:**
   ```bash
   cd frontend/client
   vercel --prod
   ```

3. **Deploy admin app:**
   ```bash
   cd frontend/admin
   vercel --prod
   ```

4. **Configure domains:**
   - Client: `yourdomain.com`
   - Admin: `admin.yourdomain.com`

### Netlify Deployment

1. **Build applications:**
   ```bash
   cd frontend/client
   npm run build
   
   cd ../admin
   npm run build
   ```

2. **Deploy via Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

3. **Configure redirects** (`_redirects` file):
   ```
   /*    /index.html   200
   ```

### AWS S3 + CloudFront

1. **Build applications:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Create S3 buckets:**
   ```bash
   aws s3 mb s3://yourdomain.com
   aws s3 mb s3://admin.yourdomain.com
   ```

3. **Upload builds:**
   ```bash
   aws s3 sync client/dist/ s3://yourdomain.com --delete
   aws s3 sync admin/dist/ s3://admin.yourdomain.com --delete
   ```

4. **Configure CloudFront distributions**
5. **Set up Route 53 for custom domains**

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create cluster** on [MongoDB Atlas](https://cloud.mongodb.com)
2. **Configure network access** (0.0.0.0/0 for public or specific IPs)
3. **Create database user** with read/write permissions
4. **Get connection string** and update environment variables

### Self-Hosted MongoDB

1. **Install MongoDB:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb
   
   # CentOS/RHEL
   sudo yum install mongodb
   ```

2. **Configure MongoDB:**
   ```bash
   # Edit /etc/mongod.conf
   net:
     port: 27017
     bindIp: 127.0.0.1
   
   security:
     authorization: enabled
   ```

3. **Create database and user:**
   ```javascript
   use fullstack-app
   db.createUser({
     user: "api-user",
     pwd: "secure-password",
     roles: [{ role: "readWrite", db: "fullstack-app" }]
   })
   ```

## 🔒 SSL/TLS Configuration

### Automatic SSL (Recommended)
- **Vercel/Netlify**: Automatic SSL certificates
- **Cloudflare**: Free SSL proxy
- **Let's Encrypt**: Free SSL certificates

### Manual SSL Setup

1. **Obtain SSL certificate:**
   ```bash
   certbot certonly --standalone -d yourdomain.com
   ```

2. **Configure reverse proxy** (Nginx):
   ```nginx
   server {
       listen 443 ssl;
       server_name yourdomain.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/private.key;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       location /api/ {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## 🔍 Health Checks & Monitoring

### Backend Health Check
```javascript
// Already implemented at /health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});
```

### Frontend Health Check
```javascript
// Add to frontend build
const healthCheck = {
  status: 'OK',
  version: process.env.VITE_APP_VERSION,
  timestamp: new Date().toISOString(),
};
```

### Monitoring Tools
- **Uptime monitoring**: UptimeRobot, Pingdom
- **Application monitoring**: New Relic, DataDog
- **Error tracking**: Sentry, Bugsnag
- **Logs**: Winston (backend), LogRocket (frontend)

## 🔧 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install backend dependencies
        run: cd backend && npm ci
      
      - name: Run backend tests
        run: cd backend && npm test
      
      - name: Install frontend dependencies
        run: cd frontend && npm run install:all
      
      - name: Run frontend tests
        run: cd frontend && npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        uses: railway-app/railway-action@v1
        with:
          api-token: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## 🚀 Performance Optimization

### Backend Optimization
- **Clustering**: Use PM2 cluster mode
- **Caching**: Redis for session/data caching
- **CDN**: CloudFront for static assets
- **Database**: Proper indexing and queries

### Frontend Optimization
- **Code splitting**: Route-based splitting
- **Bundle analysis**: Webpack Bundle Analyzer
- **CDN**: Static asset delivery
- **Service worker**: Offline functionality

## 🔒 Security Checklist

### Backend Security
- [x] Environment variables secured
- [x] HTTPS enforced
- [x] CORS properly configured
- [x] Rate limiting enabled
- [x] Input validation
- [x] SQL injection prevention
- [x] JWT secrets secured
- [x] Error messages sanitized

### Frontend Security
- [x] HTTPS enforced
- [x] CSP headers configured
- [x] XSS protection
- [x] Secure token storage
- [x] Environment variables secured
- [x] Dependencies updated

## 📈 Scaling Considerations

### Horizontal Scaling
- **Load balancer**: Nginx, AWS ALB
- **Multiple instances**: PM2 cluster, Docker Swarm
- **Database replication**: MongoDB replica sets
- **CDN**: Global content delivery

### Vertical Scaling
- **Server resources**: CPU, RAM, Storage
- **Database optimization**: Indexes, queries
- **Connection pooling**: MongoDB connections
- **Memory management**: Node.js optimization

## 🆘 Troubleshooting

### Common Issues

1. **CORS errors**: Check CORS configuration
2. **Database connection**: Verify MongoDB URI
3. **Environment variables**: Check all required vars
4. **Build failures**: Clear node_modules and reinstall
5. **SSL issues**: Verify certificate configuration

### Debug Commands
```bash
# Check application logs
pm2 logs
docker logs container-name

# Test database connection
mongo mongodb://connection-string

# Verify SSL certificate
openssl s_client -connect yourdomain.com:443

# Check port availability
netstat -tlnp | grep :5000
```

### Support Resources
- **Documentation**: This deployment guide
- **Community**: GitHub Discussions
- **Issues**: GitHub Issues
- **Monitoring**: Application dashboards
