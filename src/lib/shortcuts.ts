/**
 * Keyboard shortcut registry + shared helpers for the palette, the
 * single-key shortcut handler and the footer hint bar.
 *
 * This module is data + pure functions only (SSR-safe). Behaviour lives in
 * src/components/experience/shortcuts/ShortcutsProvider.tsx.
 */

import { scrollToElement } from './scroll';

/** Section ids on the home page (owned by the sections agent). */
export const SECTION_IDS = {
  hero: 'hero',
  highlights: 'highlights',
  work: 'work',
  about: 'about',
  ventures: 'ventures',
  contact: 'contact',
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

export const SECTION_LABELS: Record<SectionId, string> = {
  hero: 'Home',
  highlights: 'Highlights',
  work: 'Work',
  about: 'About',
  ventures: 'Ventures',
  contact: 'Contact',
};

/** Fired on window by `f`; the Highlights grid listens and advances its filter. */
export const CYCLE_FILTER_EVENT = 'pp:cycle-filter';

/** Footer element the hint bar portals into (rendered by the page footer). */
export const SHORTCUT_HINT_TARGET_ID = 'shortcut-hint';

/** Minimal project shape the palette needs; computed server-side in Providers. */
export interface PaletteProject {
  title: string;
  slug: string;
  summary: string;
}

export type PalettePage = 'root' | 'shortcuts';

export type ShortcutAction =
  | { type: 'section'; id: SectionId }
  | { type: 'resume' }
  | { type: 'github' }
  | { type: 'cycle-theme' }
  | { type: 'cycle-filter' }
  | { type: 'palette' }
  | { type: 'help' };

export interface Shortcut {
  /** `KeyboardEvent.key` value (case-sensitive; `?` requires shift). */
  key: string;
  /** Short label for the hint bar / help list. */
  label: string;
  action: ShortcutAction;
  /** Show in the compact footer hint bar. */
  hint?: boolean;
}

/**
 * Single-key shortcuts. Order here is the order in the help list.
 * Cmd/Ctrl+K and `/` (palette) and Esc are handled separately.
 */
export const SHORTCUTS: readonly Shortcut[] = [
  { key: 'w', label: 'Work', action: { type: 'section', id: 'work' }, hint: true },
  { key: 'h', label: 'Highlights', action: { type: 'section', id: 'highlights' }, hint: true },
  { key: 'a', label: 'About', action: { type: 'section', id: 'about' } },
  { key: 'v', label: 'Ventures', action: { type: 'section', id: 'ventures' } },
  { key: 'c', label: 'Contact', action: { type: 'section', id: 'contact' } },
  { key: 'f', label: 'Filter highlights', action: { type: 'cycle-filter' } },
  { key: 't', label: 'Theme', action: { type: 'cycle-theme' }, hint: true },
  { key: 'r', label: 'Resume', action: { type: 'resume' } },
  { key: 'g', label: 'GitHub', action: { type: 'github' } },
  { key: '/', label: 'Menu', action: { type: 'palette' } },
  { key: '?', label: 'All shortcuts', action: { type: 'help' }, hint: true },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** True when the keystroke originated inside something the user types into. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return Boolean(target.closest('[contenteditable=""], [contenteditable="true"]'));
}

/** Any modifier held (Shift is allowed so `?` works). */
export function hasModifier(e: KeyboardEvent): boolean {
  return e.metaKey || e.ctrlKey || e.altKey;
}

/** Apple platforms use ⌘; everything else Ctrl. Call only in the browser. */
export function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform ?? navigator.platform ?? '';
  return /mac|iphone|ipad|ipod/i.test(platform) || /Mac|iPhone|iPad/.test(navigator.userAgent);
}

export function modKeyLabel(apple: boolean): string {
  return apple ? '⌘' : 'Ctrl';
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Is a meaningful part of the element inside the viewport? */
export function isElementInView(el: Element, threshold = 0.35): boolean {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
  return visible > Math.min(r.height, vh) * threshold;
}

/**
 * Smooth-scroll to an element id on the current page; false if missing.
 * Goes through the scroll registry so Lenis drives it when present.
 */
export function scrollToId(id: string): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.getElementById(id);
  if (!el) return false;
  scrollToElement(el);
  if (window.history?.replaceState) {
    window.history.replaceState(null, '', id === SECTION_IDS.hero ? '/' : `#${id}`);
  }
  return true;
}

export function openExternal(href: string): void {
  if (typeof window === 'undefined') return;
  window.open(href, '_blank', 'noopener,noreferrer');
}
