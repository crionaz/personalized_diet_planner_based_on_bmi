#!/bin/bash

# Development setup script with Docker
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up Fullstack Template Development Environment${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose and try again.${NC}"
    exit 1
fi

# Create .env files if they don't exist
echo -e "${BLUE}📝 Setting up environment files...${NC}"

if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Creating backend/.env from example...${NC}"
    cp backend/.env.example backend/.env
fi

if [ ! -f "frontend/client/.env" ]; then
    echo -e "${YELLOW}Creating frontend/client/.env from example...${NC}"
    cp frontend/client/.env.example frontend/client/.env
fi

if [ ! -f "frontend/admin/.env" ]; then
    echo -e "${YELLOW}Creating frontend/admin/.env from example...${NC}"
    cp frontend/admin/.env.example frontend/admin/.env
fi

# Build and start services
echo -e "${BLUE}🏗️  Building and starting development services...${NC}"
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
sleep 30

# Health checks
echo -e "${BLUE}🔍 Checking service health...${NC}"

check_service() {
    local service=$1
    local url=$2
    local max_attempts=20
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ ${service} is ready${NC}"
            return 0
        fi
        
        if [ $((attempt % 5)) -eq 0 ]; then
            echo -e "${YELLOW}⏳ Still waiting for ${service}... (${attempt}/${max_attempts})${NC}"
        fi
        
        sleep 5
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ ${service} failed to start within expected time${NC}"
    return 1
}

# Check services
FAILED_SERVICES=0

if ! check_service "MongoDB" "http://localhost:27017"; then
    echo -e "${YELLOW}⚠️  MongoDB might be starting up - this is expected${NC}"
fi

if ! check_service "Backend API" "http://localhost:5000/health"; then
    FAILED_SERVICES=$((FAILED_SERVICES + 1))
fi

# Give frontend services more time to compile
sleep 15

if ! check_service "Client App" "http://localhost:3000"; then
    echo -e "${YELLOW}⚠️  Client app might still be compiling - check logs if it doesn't appear soon${NC}"
fi

if ! check_service "Admin Dashboard" "http://localhost:3001"; then
    echo -e "${YELLOW}⚠️  Admin dashboard might still be compiling - check logs if it doesn't appear soon${NC}"
fi

# Show container status
echo -e "${BLUE}📋 Container Status:${NC}"
docker-compose -f docker-compose.dev.yml ps

if [ $FAILED_SERVICES -eq 0 ]; then
    echo -e "${GREEN}🎉 Development environment is ready!${NC}"
else
    echo -e "${YELLOW}⚠️  Some services may need more time to start. Check the logs if needed.${NC}"
fi

echo -e "${BLUE}🌐 Application URLs:${NC}"
echo -e "  ${GREEN}📱 Client App: http://localhost:3000${NC}"
echo -e "  ${GREEN}🔧 Admin Dashboard: http://localhost:3001${NC}"
echo -e "  ${GREEN}🚀 Backend API: http://localhost:5000${NC}"
echo -e "  ${GREEN}📚 API Documentation: http://localhost:5000/api-docs${NC}"
echo -e "  ${GREEN}🗄️  MongoDB: localhost:27017${NC}"
echo -e "  ${GREEN}💾 Redis: localhost:6379${NC}"

echo -e "${YELLOW}🔧 Development Commands:${NC}"
echo -e "  View logs: ${BLUE}docker-compose -f docker-compose.dev.yml logs -f [service]${NC}"
echo -e "  Stop all: ${BLUE}docker-compose -f docker-compose.dev.yml down${NC}"
echo -e "  Restart service: ${BLUE}docker-compose -f docker-compose.dev.yml restart [service]${NC}"
echo -e "  Enter container: ${BLUE}docker-compose -f docker-compose.dev.yml exec [service] sh${NC}"
echo -e "  Rebuild service: ${BLUE}docker-compose -f docker-compose.dev.yml build [service]${NC}"

echo -e "${YELLOW}🎯 Default Login Credentials:${NC}"
echo -e "  Email: ${BLUE}admin@fullstack.com${NC}"
echo -e "  Password: ${BLUE}password123${NC}"

echo -e "${GREEN}✨ Happy coding!${NC}"
