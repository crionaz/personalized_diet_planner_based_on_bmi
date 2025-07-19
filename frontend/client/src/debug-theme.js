// Theme initialization script - add this to index.html or run manually in console

// Function to debug and force theme application
function debugTheme() {
  console.log('Current theme classes on html:', document.documentElement.classList.toString());
  console.log('Current data-theme attribute:', document.documentElement.getAttribute('data-theme'));
  
  // Force dark theme for testing
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add('dark');
  document.documentElement.setAttribute('data-theme', 'dark');
  
  console.log('Applied dark theme');
  console.log('New classes:', document.documentElement.classList.toString());
}

// Function to toggle theme manually
function toggleThemeManually() {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');
  
  html.classList.remove('light', 'dark');
  html.classList.add(isDark ? 'light' : 'dark');
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  
  console.log('Toggled to:', isDark ? 'light' : 'dark');
}

// Run debug immediately
debugTheme();

// Make functions available globally for testing
window.debugTheme = debugTheme;
window.toggleThemeManually = toggleThemeManually;

console.log('Theme debug functions available: debugTheme(), toggleThemeManually()');
