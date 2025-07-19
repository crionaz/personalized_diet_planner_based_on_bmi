# Admin Dashboard

## Overview

The Admin Dashboard is a powerful React-based administrative interface built with modern technologies for managing users, analytics, and system settings.

## Tech Stack

- **React 19** - Latest React version with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Query** - Server state management
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications
- **Date-fns** - Date utilities

## Features

### 🎯 Core Features
- **User Management** - CRUD operations for users
- **Role-Based Access Control** - Admin permissions and role management
- **Analytics Dashboard** - Charts and metrics visualization
- **System Settings** - Configurable application settings
- **Profile Management** - Admin profile and security settings

### 📊 Dashboard Components
- **Statistics Cards** - Key metrics overview
- **User Growth Charts** - Area charts showing user growth trends
- **Activity Analytics** - Bar charts for user activity
- **Role Distribution** - Pie charts for user role breakdown
- **Recent Activity Feed** - Real-time activity notifications

### 👥 User Management
- **User List** - Paginated table with search and filtering
- **User Actions** - Create, edit, delete, activate/deactivate users
- **Role Management** - Change user roles dynamically
- **Status Management** - Toggle user active/inactive status
- **Advanced Filtering** - Filter by role, status, and search terms

### ⚙️ System Settings
- **General Settings** - Site configuration
- **Email Settings** - SMTP configuration
- **Security Settings** - Password policies and session management
- **Notification Settings** - Email and system notifications
- **Database Settings** - Backup and maintenance configuration

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on port 5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure environment variables:
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Admin Dashboard
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
```

4. Start the development server:
```bash
npm run dev
```

The admin dashboard will be available at `http://localhost:3001`

## Scripts

```bash
# Development
npm run dev          # Start development server

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript type checking
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Auth/           # Authentication components
│   └── Layout/         # Layout components
├── pages/              # Page components
│   ├── Auth/           # Login page
│   ├── Dashboard/      # Analytics dashboard
│   ├── Users/          # User management
│   ├── Settings/       # System settings
│   └── Profile/        # Admin profile
├── store/              # Redux store and slices
│   └── slices/         # Redux Toolkit slices
├── services/           # API service functions
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Authentication

The admin dashboard uses JWT-based authentication with the following flow:

1. Admin logs in with email/password
2. JWT token is stored in localStorage
3. Token is attached to all API requests
4. Protected routes verify admin role
5. Auto-logout on token expiration

### Admin Access
Only users with `role: 'admin'` can access the dashboard. Regular users are redirected with an access denied message.

## API Integration

The dashboard connects to the backend API for:

- **Authentication** - Login, logout, profile management
- **User Management** - CRUD operations on users
- **Analytics** - Dashboard metrics and charts data
- **Settings** - System configuration management

### API Endpoints Used
- `POST /auth/admin/login` - Admin login
- `GET /auth/profile` - Get current admin profile
- `GET /admin/users` - Get users list
- `POST /admin/users` - Create new user
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user
- `PATCH /admin/users/:id/role` - Update user role
- `PATCH /admin/users/:id/toggle-status` - Toggle user status

## Charts and Analytics

### Recharts Integration
The dashboard uses Recharts for data visualization:

- **Area Charts** - User growth trends
- **Bar Charts** - Activity metrics
- **Pie Charts** - Role distribution
- **Responsive Design** - Charts adapt to container size

### Sample Data Structure
```typescript
const userGrowthData = [
  { name: 'Jan', users: 400 },
  { name: 'Feb', users: 450 },
  // ...
]
```

## State Management

### Redux Toolkit Setup
- **Auth Slice** - Authentication state and user profile
- **User Slice** - User management state and operations
- **Async Thunks** - API call handling with loading states
- **Error Handling** - Centralized error management

### Store Structure
```typescript
{
  auth: {
    user: User | null,
    token: string | null,
    isLoading: boolean,
    error: string | null
  },
  users: {
    users: User[],
    selectedUser: User | null,
    isLoading: boolean,
    error: string | null,
    pagination: PaginationInfo
  }
}
```

## Styling

### Tailwind CSS Configuration
- **Custom Admin Classes** - Pre-defined admin-specific styles
- **Dark Mode Support** - Automatic dark/light theme switching
- **Responsive Design** - Mobile-first responsive layouts
- **Custom Components** - Buttons, cards, tables with consistent styling

### Key Design Patterns
- **Admin Cards** - `.admin-card` for consistent panel styling
- **Admin Tables** - `.admin-table` for data table styling
- **Button Variants** - Primary, secondary, danger button styles
- **Color Scheme** - Blue primary, with semantic colors for status

## Security Features

- **Role-Based Access** - Admin-only access control
- **Token Management** - Automatic token refresh and cleanup
- **Route Protection** - Protected routes with authentication checks
- **Input Validation** - Form validation and sanitization
- **CSRF Protection** - API request security headers

## Deployment

### Production Build
```bash
npm run build
```

### Environment Configuration
Ensure production environment variables are set:
- `VITE_API_URL` - Production API endpoint
- `VITE_ENVIRONMENT=production`

### Deployment Options
- **Vercel** - Zero-config deployment
- **Netlify** - Static site hosting
- **AWS S3** - S3 + CloudFront distribution
- **Docker** - Containerized deployment

## Development Guidelines

### Code Style
- **TypeScript** - Strict type checking enabled
- **ESLint** - Airbnb configuration with custom rules
- **Prettier** - Consistent code formatting
- **Import Organization** - Organized imports with path aliases

### Component Patterns
- **Functional Components** - React hooks and functional approach
- **Custom Hooks** - Reusable logic extraction
- **Error Boundaries** - Graceful error handling
- **Lazy Loading** - Code splitting for performance

### Performance Optimization
- **React Query** - Efficient server state caching
- **Code Splitting** - Route-based lazy loading
- **Image Optimization** - Responsive images and lazy loading
- **Bundle Analysis** - Regular bundle size monitoring

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for all new code
3. Include error handling in API calls
4. Add responsive design for new components
5. Update documentation for new features

## License

This project is part of the Fullstack Template and follows the same licensing terms.
