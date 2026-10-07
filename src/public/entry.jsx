import React, { useEffect, useState } from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import PublicLanding from './Landing.jsx';
import { readThemePreference, persistThemePreference, resolveTheme } from '../theme-model.js';

function PublicApp() {
  const [preference, setPreference] = useState('system');
  const [theme, setTheme] = useState('light');
  const [ready, setReady] = useState(false);
  useEffect(() => { setPreference(readThemePreference()); setTheme(document.documentElement.dataset.theme || 'light'); setReady(true); }, []);
  useEffect(() => {
    if (!ready) return;
    const media = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => { const resolved = resolveTheme(preference, media.matches); document.documentElement.dataset.theme = resolved; document.documentElement.style.colorScheme = resolved; setTheme(resolved); };
    apply(); media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [preference, ready]);
  return <PublicLanding themePreference={preference} resolvedTheme={theme} onThemeChange={next => { persistThemePreference(next); setPreference(next); }} />;
}

const root = document.getElementById('root');
if (root.hasChildNodes()) hydrateRoot(root, <PublicApp />);
else createRoot(root).render(<PublicApp />);
