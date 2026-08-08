const STORAGE_KEY = "theme";

// Check localStorage first, then fall back to browser preference
export function getInitialTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return saved;

  const prefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
  return prefersDark ? "dark" : "light";
}

export function persistTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEY, theme);
}
