# Frontend Documentation

This frontend consists of two separate applications: a **Client App** for end users and an **Admin Dashboard** for administrators.

## Architecture

- **Client App** (`/frontend/client`) - User-facing application (Port 3000)
- **Admin Dashboard** (`/frontend/admin`) - Administrative interface (Port 3001)
- **Shared Types** (`/shared`) - Common types and interfaces
- **Backend API** (`/backend`) - REST API server (Port 5000)

## Tech Stack

### Core Technologies
- **React 18+** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router v6** for routing

### State Management & Data Fetching
- **Redux Toolkit** for global state
- **React Query** for server state
- **React Hook Form** with Zod validation

### UI Components & Styling
- **Headless UI** for accessible components
- **Lucide React** for icons
- **React Hot Toast** for notifications
- **Tailwind CSS** with custom design system

### Development Tools
- **TypeScript** for type safety
- **ESLint & Prettier** for code quality
- **Vitest** for testing
- **Husky** for git hooks

## 📁 Project Structure

```
frontend/
├── client/                 # Client application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── store/          # Redux store & slices
│   │   ├── api/            # API client & endpoints
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript types
│   │   └── assets/         # Static assets
│   ├── public/             # Public assets
│   └── package.json
├── admin/                  # Admin dashboard
│   └── [similar structure]
└── package.json           # Root package.json
```

## Setup & Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Install all dependencies:**
   ```bash
   cd frontend
   npm run install:all
   ```

2. **Start development servers:**
   ```bash
   # Start both client and admin apps
   npm run dev

   # Or start individually
   npm run dev:client    # Client app on port 3000
   npm run dev:admin     # Admin app on port 3001
   ```

3. **Environment setup:**
   ```bash
   # Client app
   cd client
   cp .env.example .env.local

   # Admin app
   cd ../admin
   cp .env.example .env.local
   ```

### Available Scripts

```bash
# Development
npm run dev              # Start both apps
npm run dev:client       # Start client app only
npm run dev:admin        # Start admin app only

# Building
npm run build            # Build both apps
npm run build:client     # Build client app only
npm run build:admin      # Build admin app only

# Testing
npm run test             # Run tests for both apps
npm run test:client      # Run client tests only
npm run test:admin       # Run admin tests only

# Code Quality
npm run lint             # Lint both apps
npm run lint:fix         # Fix linting issues
```

## Authentication & Authorization

### Authentication Flow
1. User registers/logs in via `/auth/login` or `/auth/register`
2. Server returns JWT tokens (access + refresh)
3. Tokens stored in Redux + localStorage via redux-persist
4. Axios interceptors handle token refresh automatically
5. Protected routes check authentication status

### Role-Based Access Control (RBAC)
- **USER**: Standard user permissions
- **ADMIN**: Administrative access
- **SUPER_ADMIN**: Full system access

### Protected Routes
```tsx
// Protect entire route
<ProtectedRoute requiredRole={UserRole.ADMIN}>
  <AdminDashboard />
</ProtectedRoute>

// Protect specific permissions
<ProtectedRoute requiredPermission={Permission.READ_ADMIN}>
  <AdminUserList />
</ProtectedRoute>
```

## UI Components & Design System

### Custom Components
- **Button** - Multiple variants and sizes
- **Input** - Form inputs with validation
- **Modal** - Accessible modal dialogs
- **Table** - Data tables with sorting/pagination
- **Layout** - Page layout components
- **FormField** - Form field wrapper with labels/errors

### Design System
```css
/* Color Palette */
primary-50 to primary-950    /* Primary blue scale */
gray-50 to gray-950          /* Neutral gray scale */

/* Component Classes */
.btn-primary, .btn-secondary  /* Button variants */
.input, .label               /* Form elements */
.card, .card-header          /* Card components */
```

### Responsive Design
- Mobile-first approach
- Tailwind's responsive utilities
- Custom breakpoints as needed

## State Management

### Redux Store Structure
```typescript
interface RootState {
  auth: AuthState;           // User authentication
  ui: UIState;               // UI state (theme, sidebar)
  // Add feature slices as needed
}
```

### React Query Integration
- Server state management
- Automatic caching & background updates
- Error handling & loading states
- Optimistic updates

### Local Storage Persistence
- Authentication state persisted
- User preferences saved
- Automatic rehydration on app load

## API Integration

### Axios Configuration
```typescript
// Base configuration
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Automatic token handling
apiClient.interceptors.request.use(/* token injection */);
apiClient.interceptors.response.use(/* token refresh */);
```

### API Endpoints
- **Auth**: `/api/auth/*` - Authentication endpoints
- **Users**: `/api/users/*` - User management
- **Admin**: `/api/admin/*` - Admin operations

### Error Handling
- Global error boundaries
- Toast notifications for errors
- Retry mechanisms for failed requests
- Offline state detection

## 🧪 Testing Strategy

### Testing Tools
- **Vitest** for unit testing
- **React Testing Library** for component testing
- **MSW** for API mocking
- **Jest DOM** for DOM assertions

### Test Structure
```
src/
├── components/
│   └── __tests__/          # Component tests
├── hooks/
│   └── __tests__/          # Hook tests
├── utils/
│   └── __tests__/          # Utility tests
└── __mocks__/              # Global mocks
```

### Testing Best Practices
- Test user interactions, not implementation
- Mock external dependencies
- Test error states and edge cases
- Maintain high test coverage

## 🔧 Development Guidelines

### Code Style
- **TypeScript** for all new code
- **Functional components** with hooks
- **Custom hooks** for reusable logic
- **Proper error boundaries**

### File Naming Conventions
```
components/Button/index.tsx     # Component files
hooks/useAuth.ts               # Custom hooks
utils/formatDate.ts            # Utility functions
types/api.ts                   # Type definitions
```

### Import Organization
```typescript
// External libraries
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// Internal imports
import { Button } from '@/components';
import { useAuth } from '@/hooks';
import type { User } from '@/types';
```

## Deployment

### Build Process
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables
```env
VITE_API_URL=https://api.yourapp.com
VITE_APP_NAME=Your App Name
VITE_APP_VERSION=1.0.0
```

### Deployment Targets
- **Vercel** - Recommended for frontend
- **Netlify** - Alternative hosting
- **AWS S3 + CloudFront** - For enterprise
- **Docker** - Containerized deployment

## Performance Optimization

### Code Splitting
- Route-based code splitting
- Dynamic imports for heavy components
- Lazy loading for non-critical features

### Bundle Optimization
- Tree shaking for unused code
- Vendor chunk splitting
- Asset optimization

### Runtime Performance
- React.memo for expensive components
- useMemo/useCallback for expensive calculations
- Virtual scrolling for large lists
- Image optimization and lazy loading

## 🔍 Debugging & Monitoring

### Development Tools
- React Developer Tools
- Redux DevTools
- React Query DevTools
- Vite's built-in debugging

### Error Monitoring
- Error boundaries for graceful failures
- Console logging in development
- Integration with error tracking services