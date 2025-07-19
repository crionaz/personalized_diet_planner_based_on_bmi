# Backend API

A robust Node.js backend with TypeScript, Express, MongoDB, and comprehensive security features implemented for Personalized Diet Planner based on BMI, Bayer Hackathon.

## Features

- **TypeScript** for type safety
- **Express.js** web framework
- **MongoDB** with Mongoose ODM
- **JWT Authentication** with refresh tokens
- **Role-based Access Control (RBAC)**
- **Comprehensive Security**:
  - Helmet for security headers
  - CORS configuration
  - Rate limiting
  - Input validation & sanitization
  - Password hashing with bcrypt
- **API Documentation** with Swagger
- **Logging** with Winston
- **Testing** with Jest & Supertest
- **Code Quality** with ESLint & Prettier
- **Git Hooks** with Husky

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Mongoose models
├── routes/          # Express routes
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── __tests__/       # Test files
└── server.ts        # Application entry point
```

## Setup

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fullstack-app
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

## Authentication & Authorization

### User Roles
- **USER**: Standard user with basic permissions
- **ADMIN**: Administrative access to user management
- **SUPER_ADMIN**: Full system access

### Permissions
- `read:users` - View user information
- `write:users` - Create/update users
- `delete:users` - Delete users
- `read:admin` - Access admin dashboard
- `write:admin` - Admin operations
- `delete:admin` - Delete admin data

### JWT Implementation
- Access tokens (7 days default)
- Refresh tokens (30 days default)
- Automatic token refresh endpoint
- Secure password hashing with bcrypt

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/update-password` - Update password
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/verify-email/:token` - Verify email

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update profile
- `DELETE /api/users/account` - Delete account
- `GET /api/users/stats` - User statistics (Admin only)

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/system` - System information (Super Admin)
- `GET /api/admin/users` - Admin user management
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id/role` - Update user role
- `PATCH /api/admin/users/:id/status` - Toggle user status
- `DELETE /api/admin/users/:id` - Delete user
- `PATCH /api/admin/users/bulk-update` - Bulk update users

## API Documentation

Interactive API documentation is available at:
```
http://localhost:5000/api-docs
```

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Authentication Tests**: Auth flow testing
- **Database Tests**: Model and query testing

## Security Features

### Input Validation
- Express-validator for request validation
- MongoDB injection prevention
- XSS protection with helmet
- CORS configuration

### Rate Limiting
- Global rate limiting (100 requests/15 minutes)
- Configurable per endpoint
- IP-based tracking

### Password Security
- Bcrypt hashing (salt rounds: 12)
- Password strength validation
- Secure password reset flow

### JWT Security
- Secure secret keys
- Token expiration
- Refresh token rotation
- Blacklist capability

## Logging

Winston logging with:
- Different log levels (error, warn, info, debug)
- File-based logging
- Console output in development
- Log rotation
- Structured JSON logging

## Production Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Ensure all production environment variables are set:
- `NODE_ENV=production`
- `MONGODB_URI` (production database)
- `JWT_SECRET` (strong secret key)
- `JWT_REFRESH_SECRET` (strong refresh secret)

### PM2 Configuration
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/server.js --name "fullstack-api"

# Monitor
pm2 monit

# Logs
pm2 logs fullstack-api
```

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

## Development Tools

### Code Quality
- **ESLint**: Code linting with TypeScript rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **lint-staged**: Run linters on staged files

### VS Code Extensions
Recommended extensions for development:
- TypeScript Importer
- ESLint
- Prettier
- REST Client
- MongoDB for VS Code