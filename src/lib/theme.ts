/**
 * Theme registry. The CSS for each theme lives in src/styles/tokens.css
 * under `[data-theme="<id>"]`. The theme engine (phase 3) will set
 * `document.documentElement.dataset.theme` and persist to localStorage;
 * this module is the single source of truth for the list and default.
 */
export const THEMES = ['graphite', 'ember', 'sage', 'ultraviolet', 'paper'] as const;

export type ThemeId = (typeof THEMES)[number];

export const DEFAULT_THEME: ThemeId = 'graphite';

export const THEME_LABELS: Record<ThemeId, string> = {
  graphite: 'Graphite',
  ember: 'Ember',
  sage: 'Sage',
  ultraviolet: 'Ultraviolet',
  paper: 'Paper',
};

/** Which themes are light (used for color-scheme hints and 3D fallbacks). */
export const LIGHT_THEMES: ReadonlySet<ThemeId> = new Set<ThemeId>(['paper']);

export function isTheme(value: unknown): value is ThemeId {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}
