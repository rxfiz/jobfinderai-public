export const THEME_STORAGE_KEY = 'jobfinder_theme';
const THEMES = new Set(['light', 'dark', 'system']);

export function normalizeThemePreference(value) {
  return THEMES.has(value) ? value : 'system';
}

export function readThemePreference(storage) {
  try {
    const store = storage ?? globalThis.localStorage;
    return normalizeThemePreference(store?.getItem(THEME_STORAGE_KEY));
  } catch {
    return 'system';
  }
}

export function resolveTheme(preference, systemPrefersDark) {
  const normalized = normalizeThemePreference(preference);
  return normalized === 'system' ? (systemPrefersDark ? 'dark' : 'light') : normalized;
}

export function persistThemePreference(value, storage) {
  const normalized = normalizeThemePreference(value);
  try { (storage ?? globalThis.localStorage)?.setItem(THEME_STORAGE_KEY, normalized); } catch {}
  return normalized;
}
