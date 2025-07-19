import { useTheme } from '../../hooks/useTheme';

interface ThemeDebugProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function ThemeDebug({ position = 'top-right' }: ThemeDebugProps) {
  const { theme, resolvedTheme, systemPreference, setTheme, toggleTheme } = useTheme();

  const positions = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div className={`fixed ${positions[position]} z-50 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg p-4 shadow-lg text-xs font-mono max-w-xs`}>
      <div className="mb-2 font-bold text-gray-900 dark:text-white">Theme Debug</div>
      
      <div className="space-y-1 text-gray-700 dark:text-gray-300">
        <div>Theme: <span className="font-semibold">{theme}</span></div>
        <div>Resolved: <span className="font-semibold">{resolvedTheme}</span></div>
        <div>System: <span className="font-semibold">{systemPreference}</span></div>
        <div>HTML Class: <span className="font-semibold">{document.documentElement.className}</span></div>
      </div>
      
      <div className="mt-3 space-y-2">
        <div className="flex gap-1">
          <button 
            onClick={() => setTheme('light')}
            className={`px-2 py-1 text-xs rounded ${theme === 'light' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Light
          </button>
          <button 
            onClick={() => setTheme('dark')}
            className={`px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Dark
          </button>
          <button 
            onClick={() => setTheme('system')}
            className={`px-2 py-1 text-xs rounded ${theme === 'system' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            System
          </button>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="w-full px-2 py-1 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded"
        >
          Toggle Theme
        </button>
      </div>
      
      {/* Color test squares */}
      <div className="mt-3 space-y-1">
        <div className="text-xs font-bold text-gray-900 dark:text-white">Color Test:</div>
        <div className="grid grid-cols-4 gap-1">
          <div className="w-4 h-4 bg-white dark:bg-dark-900 border border-gray-300 dark:border-gray-600 rounded" title="bg-white dark:bg-dark-900"></div>
          <div className="w-4 h-4 bg-gray-100 dark:bg-dark-800 border border-gray-300 dark:border-gray-600 rounded" title="bg-gray-100 dark:bg-dark-800"></div>
          <div className="w-4 h-4 bg-primary-500 rounded" title="bg-primary-500"></div>
          <div className="w-4 h-4 bg-error-500 rounded" title="bg-error-500"></div>
        </div>
      </div>
    </div>
  );
}
