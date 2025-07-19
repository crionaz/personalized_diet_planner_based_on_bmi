import { useTheme } from '../../hooks/useTheme';
import { type Theme } from '@shared/theme/utils';

interface ThemeSelectorProps {
  className?: string;
}

export function ThemeSelector({ className }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();

  const themes: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' },
  ];

  return (
    <div className={className}>
      <label htmlFor="theme-select" className="sr-only">
        Choose theme
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        {themes.map(({ value, label, icon }) => (
          <option key={value} value={value}>
            {icon} {label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ThemeToggle({ className, size = 'md', showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  const sizes = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };

  const buttonClass = showLabel ? 'px-4 py-2 space-x-2' : sizes[size];

  return (
    <button
      onClick={toggleTheme}
      className={`
        inline-flex items-center justify-center rounded-md 
        bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800
        border border-gray-300 dark:border-gray-600
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${buttonClass}
        ${className || ''}
      `}
      title={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span>{resolvedTheme === 'light' ? '🌙' : '☀️'}</span>
      {showLabel && (
        <span className="text-sm font-medium">
          {resolvedTheme === 'light' ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
}
