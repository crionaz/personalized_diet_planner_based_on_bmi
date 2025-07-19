#!/bin/bash

# Docker build and deployment script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="fullstack-template"
REGISTRY_URL="${DOCKER_REGISTRY:-}"
VERSION="${1:-latest}"
ENVIRONMENT="${2:-production}"

echo -e "${BLUE}🚀 Starting Docker deployment for ${PROJECT_NAME}${NC}"
echo -e "${YELLOW}Version: ${VERSION}${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Function to build image
build_image() {
    local service=$1
    local context=$2
    local dockerfile=${3:-Dockerfile}
    
    echo -e "${BLUE}📦 Building ${service} image...${NC}"
    
    if [ -n "$REGISTRY_URL" ]; then
        IMAGE_TAG="${REGISTRY_URL}/${PROJECT_NAME}-${service}:${VERSION}"
    else
        IMAGE_TAG="${PROJECT_NAME}-${service}:${VERSION}"
    fi
    
    docker build \
        -t "$IMAGE_TAG" \
        -f "${context}/${dockerfile}" \
        "$context"
    
    echo -e "${GREEN}✅ ${service} image built successfully${NC}"
    
    # Push to registry if configured
    if [ -n "$REGISTRY_URL" ]; then
        echo -e "${BLUE}📤 Pushing ${service} image to registry...${NC}"
        docker push "$IMAGE_TAG"
        echo -e "${GREEN}✅ ${service} image pushed successfully${NC}"
    fi
}

# Build backend
build_image "backend" "./backend" "Dockerfile.prod"

# Build frontend client
echo -e "${BLUE}📦 Building client application...${NC}"
cd frontend/client
npm run build
cd ../..
build_image "client" "./frontend/client"

# Build admin dashboard
echo -e "${BLUE}📦 Building admin dashboard...${NC}"
cd frontend/admin
npm run build
cd ../..
build_image "admin" "./frontend/admin"

# Deploy with Docker Compose
echo -e "${BLUE}🚀 Deploying with Docker Compose...${NC}"

if [ "$ENVIRONMENT" = "development" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
else
    COMPOSE_FILE="docker-compose.yml"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from example...${NC}"
    if [ -f ".env.production.example" ]; then
        cp .env.production.example .env
        echo -e "${YELLOW}⚠️  Please update .env with your production values before continuing${NC}"
        exit 1
    fi
fi

# Stop existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker-compose -f "$COMPOSE_FILE" down

# Start services
echo -e "${BLUE}🎯 Starting services...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for services to be healthy
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Health checks
echo -e "${BLUE}🔍 Performing health checks...${NC}"

check_service() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}Checking ${service}...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null; then
            echo -e "${GREEN}✅ ${service} is healthy${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}⏳ Attempt ${attempt}/${max_attempts} - ${service} not ready yet...${NC}"
        sleep 10
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ ${service} health check failed${NC}"
    return 1
}

# Perform health checks
HEALTH_CHECK_FAILED=0

if ! check_service "Backend API" "http://localhost:5000/health"; then
    HEALTH_CHECK_FAILED=1
fi

if ! check_service "Client App" "http://localhost:3000/health"; then
    HEALTH_CHECK_FAILED=1
fi

if ! check_service "Admin Dashboard" "http://localhost:3001/health"; then
    HEALTH_CHECK_FAILED=1
fi

if [ $HEALTH_CHECK_FAILED -eq 1 ]; then
    echo -e "${RED}❌ Some services failed health checks. Check logs with: docker-compose logs${NC}"
    exit 1
fi

# Show running containers
echo -e "${BLUE}📋 Running containers:${NC}"
docker-compose -f "$COMPOSE_FILE" ps

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}📱 Client App: http://localhost:3000${NC}"
echo -e "${BLUE}🔧 Admin Dashboard: http://localhost:3001${NC}"
echo -e "${BLUE}🚀 Backend API: http://localhost:5000${NC}"
echo -e "${BLUE}📚 API Docs: http://localhost:5000/api-docs${NC}"

echo -e "${YELLOW}💡 Useful commands:${NC}"
echo -e "  View logs: docker-compose -f $COMPOSE_FILE logs -f"
echo -e "  Stop services: docker-compose -f $COMPOSE_FILE down"
echo -e "  Restart service: docker-compose -f $COMPOSE_FILE restart <service>"
echo -e "  Enter container: docker-compose -f $COMPOSE_FILE exec <service> sh"
