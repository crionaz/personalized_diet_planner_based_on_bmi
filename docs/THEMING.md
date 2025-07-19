# Theming System Documentation

This template includes a comprehensive theming system with dark/light mode support for both client and admin applications.

## 🎨 Features

- **Dark/Light Mode Support**: Seamless switching between themes
- **System Theme Detection**: Automatically follows OS preference
- **Persistent Theme Storage**: Remembers user preference
- **Shared Theme Configuration**: Consistent theming across all apps
- **Tailwind CSS Integration**: Utility-first CSS with dark mode support

## 📁 File Structure

```
shared/
├── theme/
│   ├── colors.ts         # Shared color palette
│   ├── types.ts          # Theme type definitions
│   ├── utils.ts          # Theme utility functions
│   └── ThemeProvider.tsx # Theme exports (no React dependencies)

frontend/
├── client/
│   ├── src/
│   │   ├── hooks/
│   │   │   └── useTheme.tsx           # Theme context and hook
│   │   └── components/
│   │       └── theme/
│   │           └── ThemeComponents.tsx # Theme UI components
│   └── tailwind.config.js             # Updated with dark mode
└── admin/
    ├── src/
    │   ├── hooks/
    │   │   └── useTheme.tsx           # Theme context and hook
    │   └── components/
    │       └── theme/
    │           └── ThemeComponents.tsx # Theme UI components
    └── tailwind.config.js             # Updated with dark mode
```

## 🚀 Quick Setup

### 1. Install Required Dependencies

The following dependencies should already be installed in both client and admin:

```bash
npm install clsx tailwind-merge
```

### 2. Update Tailwind Configuration

Your `tailwind.config.js` should include:

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../shared/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Your existing colors plus dark theme colors
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### 3. Wrap Your App with ThemeProvider

```tsx
import { ThemeProvider } from './hooks/useTheme';

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <div className="min-h-screen bg-white dark:bg-dark-900 text-gray-900 dark:text-white">
        {/* Your app content */}
      </div>
    </ThemeProvider>
  );
}
```

### 4. Use Theme Components

```tsx
import { ThemeToggle, ThemeSelector } from './components/theme/ThemeComponents';
import { useTheme } from './hooks/useTheme';

function Navbar() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  
  return (
    <nav className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
      <div className="flex items-center justify-between p-4">
        <h1>My App</h1>
        
        {/* Simple toggle button */}
        <ThemeToggle size="sm" />
        
        {/* Dropdown selector */}
        <ThemeSelector className="w-32" />
      </div>
    </nav>
  );
}
```

## 🎯 Usage Examples

### Component with Dark Mode Support

```tsx
import { cn } from '@shared/utils/cn';

function Card({ children, className }) {
  return (
    <div className={cn(
      "bg-white dark:bg-dark-800",
      "border border-gray-200 dark:border-dark-700",
      "shadow-sm hover:shadow-md",
      "rounded-lg p-6",
      "transition-all duration-200",
      className
    )}>
      {children}
    </div>
  );
}
```

### Button with Theme Support

```tsx
function Button({ variant = 'primary', children, className, ...props }) {
  const variants = {
    primary: 'bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600',
    secondary: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600',
    outline: 'border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
  };

  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-800",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Using Theme Utilities

```tsx
import { useTheme } from './hooks/useTheme';
import { getThemeClasses, themeClass } from '@shared/theme/utils';

function MyComponent() {
  const { resolvedTheme } = useTheme();
  
  // Method 1: Using theme classes object
  const bgClass = resolvedTheme === 'dark' ? 'bg-dark-800' : 'bg-white';
  
  // Method 2: Using utility function
  const textClass = themeClass('text-gray-900', 'text-white');
  
  return (
    <div className={cn(bgClass, textClass)}>
      Content
    </div>
  );
}
```

## 🎨 Color Palette

The theme system includes a comprehensive color palette:

- **Primary**: Blue variants (50-950)
- **Success**: Green variants (50-950)  
- **Warning**: Amber variants (50-950)
- **Error**: Red variants (50-950)
- **Gray**: Neutral variants (50-950)
- **Dark**: Slate variants for dark mode (50-950)

### Color Usage Examples

```tsx
// Light mode: blue-600, Dark mode: blue-500
className="bg-primary-600 dark:bg-primary-500"

// Light mode: gray-100, Dark mode: dark-800
className="bg-gray-100 dark:bg-dark-800"

// Light mode: gray-900, Dark mode: white
className="text-gray-900 dark:text-white"
```

## 🔧 Customization

### Custom Colors

Add custom colors to your Tailwind config:

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: {
        50: '#...',
        // ... your brand colors
        950: '#...',
      }
    }
  }
}
```

### Custom Theme Classes

Extend the theme classes in `shared/theme/types.ts`:

```typescript
export const themeClasses = {
  light: {
    // Add your custom classes
    custom: {
      background: 'bg-custom-50',
      text: 'text-custom-900',
    },
    // ... existing classes
  },
  dark: {
    custom: {
      background: 'bg-custom-900',  
      text: 'text-custom-100',
    },
    // ... existing classes
  },
};
```

## 📱 Responsive Dark Mode

```tsx
// Different themes at different breakpoints
className="bg-white dark:bg-dark-900 md:bg-gray-50 md:dark:bg-dark-800"

// Hide/show elements based on theme
className="block dark:hidden" // Show only in light mode
className="hidden dark:block" // Show only in dark mode
```

## 🔄 Theme Persistence

The theme system automatically:

- Saves user preference to localStorage
- Listens for system theme changes
- Applies the correct theme on page load
- Provides fallbacks for SSR

## 🧪 Testing

Test your components in both themes:

```tsx
import { render } from '@testing-library/react';
import { ThemeProvider } from './hooks/useTheme';

test('component renders in dark mode', () => {
  render(
    <ThemeProvider defaultTheme="dark">
      <MyComponent />
    </ThemeProvider>
  );
  // Your assertions
});
```

## 🚨 Best Practices

1. **Always provide dark mode variants** for colors that change
2. **Use semantic color names** instead of specific shades
3. **Test in both themes** during development
4. **Use the cn utility** for conditional classes
5. **Leverage the theme utilities** for consistent theming
6. **Consider accessibility** - ensure sufficient contrast in both themes

## 📝 Migration Guide

To add theming to existing components:

1. **Update background colors**: Add `dark:bg-*` classes
2. **Update text colors**: Add `dark:text-*` classes  
3. **Update border colors**: Add `dark:border-*` classes
4. **Update focus states**: Add `dark:focus:ring-offset-*` classes
5. **Test thoroughly**: Verify all states work in both themes

This theming system provides a solid foundation for building modern, accessible applications with excellent user experience across different preferences and devices.
