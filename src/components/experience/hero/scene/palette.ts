/**
 * Reads the hero palette from CSS custom properties on <html> and
 * notifies subscribers when the theme changes.
 *
 * Sources of change:
 *   - MutationObserver on <html> `data-theme` (the theme engine's contract)
 *   - `window` CustomEvent `pp:theme-change` (belt and braces; fires the
 *     same read, so a theme engine may dispatch it after swapping CSS)
 *
 * `--hero-a/b/c` are RGB triplets ("r g b", 0..255). `--bg` is any CSS
 * colour three.js can parse (hex, rgb(), named). Everything is converted
 * to linear RGB in three's working colour space.
 */
import { Color, SRGBColorSpace } from 'three';

export interface HeroPalette {
  a: Color;
  b: Color;
  c: Color;
  bg: Color;
}

export const THEME_CHANGE_EVENT = 'pp:theme-change';

const TRIPLET = /^\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*$/;

/** Fallbacks mirror the graphite theme in tokens.css. */
const DEFAULTS = {
  a: '217 160 102',
  b: '242 237 228',
  c: '92 78 66',
  bg: '#0e0e0e',
} as const;

function parseCssColor(raw: string, fallback: string, target: Color): Color {
  const value = raw.trim() || fallback;
  const m = TRIPLET.exec(value);
  if (m) {
    return target.setRGB(
      Number(m[1]) / 255,
      Number(m[2]) / 255,
      Number(m[3]) / 255,
      SRGBColorSpace,
    );
  }
  try {
    target.setStyle(value, SRGBColorSpace);
  } catch {
    target.setStyle(fallback, SRGBColorSpace);
  }
  return target;
}

/** Reads the current palette into `target` (no allocation when supplied). */
export function readHeroPalette(target: HeroPalette = createPalette()): HeroPalette {
  if (typeof document === 'undefined') return target;
  const style = getComputedStyle(document.documentElement);
  parseCssColor(style.getPropertyValue('--hero-a'), DEFAULTS.a, target.a);
  parseCssColor(style.getPropertyValue('--hero-b'), DEFAULTS.b, target.b);
  parseCssColor(style.getPropertyValue('--hero-c'), DEFAULTS.c, target.c);
  parseCssColor(style.getPropertyValue('--bg'), DEFAULTS.bg, target.bg);
  return target;
}

export function createPalette(): HeroPalette {
  return { a: new Color(), b: new Color(), c: new Color(), bg: new Color() };
}

export function copyPalette(from: HeroPalette, to: HeroPalette): void {
  to.a.copy(from.a);
  to.b.copy(from.b);
  to.c.copy(from.c);
  to.bg.copy(from.bg);
}

export function lerpPalette(from: HeroPalette, to: HeroPalette, t: number, out: HeroPalette): void {
  out.a.lerpColors(from.a, to.a, t);
  out.b.lerpColors(from.b, to.b, t);
  out.c.lerpColors(from.c, to.c, t);
  out.bg.lerpColors(from.bg, to.bg, t);
}

/**
 * Calls `onChange` whenever the theme changes. Returns an unsubscribe.
 * Does not fire for the initial state; call `readHeroPalette` yourself.
 */
export function subscribeThemeChange(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

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
