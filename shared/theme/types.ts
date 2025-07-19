export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  theme: Theme;
  systemPreference: 'light' | 'dark';
  resolvedTheme: 'light' | 'dark';
}

// Theme class mappings for Tailwind CSS
export const themeClasses = {
  light: {
    // Background colors
    bg: {
      primary: 'bg-white',
      secondary: 'bg-gray-50',
      tertiary: 'bg-gray-100',
      elevated: 'bg-white',
      overlay: 'bg-white/95',
    },
    
    // Text colors
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      tertiary: 'text-gray-500',
      inverse: 'text-white',
      muted: 'text-gray-400',
    },
    
    // Border colors
    border: {
      primary: 'border-gray-200',
      secondary: 'border-gray-300',
      focus: 'border-primary-500',
      error: 'border-error-500',
    },
    
    // Ring colors (for focus states)
    ring: {
      primary: 'ring-primary-500',
      error: 'ring-error-500',
      success: 'ring-success-500',
      warning: 'ring-warning-500',
    },
    
    // Shadow colors
    shadow: {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
    },
  },
  
  dark: {
    // Background colors
    bg: {
      primary: 'bg-dark-900',
      secondary: 'bg-dark-800',
      tertiary: 'bg-dark-700',
      elevated: 'bg-dark-800',
      overlay: 'bg-dark-900/95',
    },
    
    // Text colors
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      tertiary: 'text-gray-400',
      inverse: 'text-dark-900',
      muted: 'text-gray-500',
    },
    
    // Border colors
    border: {
      primary: 'border-dark-700',
      secondary: 'border-dark-600',
      focus: 'border-primary-400',
      error: 'border-error-400',
    },
    
    // Ring colors (for focus states)
    ring: {
      primary: 'ring-primary-400',
      error: 'ring-error-400',
      success: 'ring-success-400',
      warning: 'ring-warning-400',
    },
    
    // Shadow colors
    shadow: {
      sm: 'shadow-sm shadow-black/10',
      md: 'shadow-md shadow-black/20',
      lg: 'shadow-lg shadow-black/25',
      xl: 'shadow-xl shadow-black/25',
    },
  },
} as const;

export type ThemeClassKey = keyof typeof themeClasses.light;
export type ThemeSubKey<T extends ThemeClassKey> = keyof typeof themeClasses.light[T];
