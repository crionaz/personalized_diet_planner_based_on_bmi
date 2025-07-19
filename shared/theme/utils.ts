import { themeClasses, type Theme, type ThemeClassKey } from './types';

// Re-export types from types.ts
export type { Theme, ThemeConfig, ThemeClassKey } from './types';

/**
 * Get theme-specific classes based on current theme
 */
export function getThemeClasses(
  theme: 'light' | 'dark',
  category: ThemeClassKey,
  key: string
): string {
  const themeData = themeClasses[theme];
  const categoryData = themeData[category] as Record<string, string>;
  return categoryData[key] || '';
}

/**
 * Utility function to apply conditional theme classes
 */
export function themeClass(lightClass: string, darkClass: string): string {
  return `${lightClass} dark:${darkClass}`;
}

/**
 * Generate responsive theme classes
 */
export function responsiveThemeClass(
  classes: Record<string, { light: string; dark: string }>
): string {
  return Object.entries(classes)
    .map(([breakpoint, { light, dark }]) => {
      const prefix = breakpoint === 'base' ? '' : `${breakpoint}:`;
      return `${prefix}${light} ${prefix}dark:${dark}`;
    })
    .join(' ');
}

/**
 * System theme detection
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light';
  
  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;
  
  // Remove existing theme classes
  document.documentElement.classList.remove('light', 'dark');
  
  // Add new theme class
  document.documentElement.classList.add(resolvedTheme);
  
  // Update data attribute for CSS selectors
  document.documentElement.setAttribute('data-theme', resolvedTheme);
  
  return resolvedTheme;
}

/**
 * Listen for system theme changes
 */
export function watchSystemTheme(callback: (theme: 'light' | 'dark') => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };
  
  mediaQuery.addEventListener('change', handler);
  
  return () => mediaQuery.removeEventListener('change', handler);
}

/**
 * Store theme preference in localStorage
 */
export function storeThemePreference(theme: Theme): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('theme', theme);
}

/**
 * Get stored theme preference from localStorage
 */
export function getStoredThemePreference(): Theme | null {
  if (typeof localStorage === 'undefined') return null;
  const stored = localStorage.getItem('theme');
  return (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : null;
}
