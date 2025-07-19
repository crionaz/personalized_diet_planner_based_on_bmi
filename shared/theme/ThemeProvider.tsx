// This file exports theme utilities that can be used in React components
// The actual React components should be implemented in each app's theme folder

export {
  type Theme,
  type ThemeConfig,
  applyTheme,
  getSystemTheme,
  getStoredThemePreference,
  storeThemePreference,
  watchSystemTheme,
  getThemeClasses,
  themeClass,
} from './utils';

export { colors } from './colors';
export { themeClasses } from './types';
