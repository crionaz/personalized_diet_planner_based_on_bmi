import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  type Theme, 
  type ThemeConfig,
  applyTheme,
  getSystemTheme,
  getStoredThemePreference,
  storeThemePreference,
  watchSystemTheme
} from '@shared/theme/utils';

interface ThemeContextType extends ThemeConfig {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme on mount
  useEffect(() => {
    const stored = getStoredThemePreference();
    const initialTheme = stored || defaultTheme;
    const systemTheme = getSystemTheme();
    
    setSystemPreference(systemTheme);
    setThemeState(initialTheme);
    
    const resolved = applyTheme(initialTheme);
    setResolvedTheme(resolved);
  }, [defaultTheme]);

  // Watch for system theme changes
  useEffect(() => {
    if (!enableSystem) return;
    
    const unwatch = watchSystemTheme((newSystemTheme) => {
      setSystemPreference(newSystemTheme);
      
      if (theme === 'system') {
        const resolved = applyTheme(theme);
        setResolvedTheme(resolved);
      }
    });
    
    return unwatch;
  }, [theme, enableSystem]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    storeThemePreference(newTheme);
    
    const resolved = applyTheme(newTheme);
    setResolvedTheme(resolved);
  };

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(systemPreference === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'light' ? 'dark' : 'light');
    }
  };

  const value: ThemeContextType = {
    theme,
    systemPreference,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
