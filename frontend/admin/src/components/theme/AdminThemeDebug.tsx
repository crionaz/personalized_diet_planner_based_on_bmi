import { useTheme } from '../../hooks/useTheme';

export function AdminThemeDebug() {
  const { theme, resolvedTheme, systemPreference, setTheme } = useTheme();

  return (
    <div className="fixed bottom-4 left-4 z-50 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-xs">
      <div className="font-bold mb-2">Admin Theme Debug</div>
      <div>Current: {theme}</div>
      <div>Resolved: {resolvedTheme}</div>
      <div>System: {systemPreference}</div>
      <div>HTML Class: {document.documentElement.className}</div>
      <div className="mt-2 space-x-1">
        <button
          onClick={() => setTheme('light')}
          className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs"
        >
          Light
        </button>
        <button
          onClick={() => setTheme('dark')}
          className="px-2 py-1 bg-gray-800 text-white rounded text-xs"
        >
          Dark
        </button>
        <button
          onClick={() => setTheme('system')}
          className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs"
        >
          System
        </button>
      </div>
    </div>
  );
}
