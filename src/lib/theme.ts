/**
 * Theme registry + browser-side theme engine helpers.
 *
 * The CSS for each theme lives in src/styles/tokens.css under
 * `[data-theme="<id>"]`. The single source of truth at runtime is the
 * `data-theme` attribute on <html>:
 *
 *   - ThemeProvider reads it (useSyncExternalStore + MutationObserver).
 *   - `applyTheme()` writes it, persists to localStorage (`pp-theme`) and
 *     dispatches a `pp:theme-change` CustomEvent on window with
 *     `{ detail: { theme } }`.
 *   - The 3D hero (or anything else) can read the attribute or listen to
 *     the event, or observe the attribute with its own MutationObserver.
 *
 * Every DOM-touching helper here guards `window` so this module is safe
 * to import from server components.
 */
export const THEMES = ['graphite', 'ember', 'sage', 'ultraviolet', 'paper'] as const;

export type ThemeId = (typeof THEMES)[number];

export const DEFAULT_THEME: ThemeId = 'graphite';

/** localStorage key holding the visitor's chosen theme id. */
export const THEME_STORAGE_KEY = 'pp-theme';

/** window CustomEvent name fired after a theme change; `detail: { theme }`. */
export const THEME_CHANGE_EVENT = 'pp:theme-change';

export const THEME_LABELS: Record<ThemeId, string> = {
  graphite: 'Graphite',
  ember: 'Ember',
  sage: 'Sage',
  ultraviolet: 'Ultraviolet',
  paper: 'Paper',
};

/** One-line mood description, shown in the palette and switcher tooltip. */
export const THEME_DESCRIPTIONS: Record<ThemeId, string> = {
  graphite: 'Warm near-black, understated amber',
  ember: 'Red-brown base, burnt orange',
  sage: 'Green-black base, dusty sage',
  ultraviolet: 'Indigo-black base, soft violet',
  paper: 'Light. Warm white, near-black type',
};

/**
 * Swatch colors for the visible switcher. MUST mirror `--bg` / `--accent`
 * in src/styles/tokens.css for each `[data-theme]` block. They are
 * hardcoded (rather than read from computed style) so every swatch can
 * show its own theme's colors while a different theme is active.
 */
export const THEME_SWATCHES: Record<ThemeId, { bg: string; accent: string }> = {
  graphite: { bg: '#0e0e0e', accent: '#d9a066' },
  ember: { bg: '#120d0c', accent: '#e2603f' },
  sage: { bg: '#0d110f', accent: '#9dba8e' },
  ultraviolet: { bg: '#0d0b12', accent: '#b58cff' },
  paper: { bg: '#f7f5f0', accent: '#9e5e1d' },
};

/** Which themes are light (used for color-scheme hints and 3D fallbacks). */
export const LIGHT_THEMES: ReadonlySet<ThemeId> = new Set<ThemeId>(['paper']);

export function isTheme(value: unknown): value is ThemeId {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

export function nextTheme(current: ThemeId): ThemeId {
  const i = THEMES.indexOf(current);
  return THEMES[(i + 1) % THEMES.length];
}

/* ------------------------------------------------------------------ */
/* Browser helpers (all guard `window`)                                */
/* ------------------------------------------------------------------ */

/** Current theme as written on <html>; DEFAULT_THEME on the server. */
export function readDomTheme(): ThemeId {
  if (typeof document === 'undefined') return DEFAULT_THEME;
  const t = document.documentElement.getAttribute('data-theme');
  return isTheme(t) ? t : DEFAULT_THEME;
}

/** Persisted theme, or null when absent/invalid/unavailable. */
export function readStoredTheme(): ThemeId | null {
  if (typeof window === 'undefined') return null;
  try {
    const t = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(t) ? t : null;
  } catch {
    return null;
  }
}

/**
 * Write the theme to <html>, persist it and notify listeners.
 * Idempotent: does nothing (and fires nothing) if already active.
 */
export function applyTheme(theme: ThemeId): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const changed = root.getAttribute('data-theme') !== theme;
  if (changed) root.setAttribute('data-theme', theme);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* private mode / storage disabled: theme still applies for the session */
  }
  if (changed) {
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { theme } }));
  }
}

/**
 * Keep `<meta name="theme-color">` in sync with the active `--bg` so the
 * browser chrome (mobile Safari/Chrome address bar) recolors with the site.
 * Reads computed style so it always matches tokens.css.
 */
export function syncThemeColorMeta(): void {
  if (typeof document === 'undefined') return;
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  if (!bg) return;
  const metas = document.head.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
  if (metas.length === 0) {
    const m = document.createElement('meta');
    m.name = 'theme-color';
    m.content = bg;
    document.head.appendChild(m);
    return;
  }
  metas.forEach((m) => {
    m.content = bg;
  });
}

/**
 * Inline bootstrap script. Rendered as the very first child of <body> by
 * <ThemeScript/> so it runs during HTML parsing, before hydration and
 * before any content paints, eliminating the theme flash. Kept as a plain
 * string so it ships without a module wrapper or React runtime.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t&&${JSON.stringify([...THEMES])}.indexOf(t)>-1){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})();`;
