'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';
import {
  DEFAULT_THEME,
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  applyTheme,
  isTheme,
  nextTheme,
  readDomTheme,
  syncThemeColorMeta,
  type ThemeId,
} from '@/lib/theme';

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  cycleTheme: () => ThemeId;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/* The store is the `data-theme` attribute on <html>. Any writer (our
 * setTheme, the inline bootstrap script, devtools, another component's
 * MutationObserver-free write) is picked up here, so React state can
 * never drift from what CSS is actually rendering. */
function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => {
    observer.disconnect();
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
  };
}

function getServerSnapshot(): ThemeId {
  return DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, readDomTheme, getServerSnapshot);

  const setTheme = useCallback((next: ThemeId) => {
    if (isTheme(next)) applyTheme(next);
  }, []);

  const cycleTheme = useCallback(() => {
    const next = nextTheme(readDomTheme());
    applyTheme(next);
    return next;
  }, []);

  /* Browser chrome color follows --bg. Runs after each theme change, and
   * once on mount to reflect a stored theme applied by the inline script. */
  useEffect(() => {
    syncThemeColorMeta();
  }, [theme]);

  /* Cross-tab sync: another tab changed the theme. */
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && isTheme(e.newValue)) applyTheme(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, cycleTheme }),
    [theme, setTheme, cycleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
