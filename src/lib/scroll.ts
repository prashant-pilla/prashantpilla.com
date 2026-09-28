/**
 * Scroll registry: a tiny indirection so SSR-safe code (shortcuts, palette,
 * links) can ask for a smooth scroll without knowing whether Lenis is
 * running. The motion layer registers a scroller when it mounts; until
 * then (and under reduced motion, on touch devices, or with JS partially
 * failed) everything falls back to native `scrollIntoView`.
 */

export interface ScrollOptions {
  /** Jump instead of animating. */
  immediate?: boolean;
  /** Extra pixels added to the target position. */
  offset?: number;
}

export interface Scroller {
  scrollTo: (target: HTMLElement | number, options?: ScrollOptions) => void;
  /** Freeze user scrolling (preloader, transitions). */
  stop: () => void;
  start: () => void;
}

let scroller: Scroller | null = null;
let locks = 0;

const LOCK_CLASS = 'pp-scroll-lock';

function reduced(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Called by the smooth-scroll component on mount/unmount. */
export function registerScroller(next: Scroller | null): void {
  scroller = next;
  if (next && locks > 0) next.stop();
}

export function hasScroller(): boolean {
  return scroller !== null;
}

export function scrollToElement(el: HTMLElement, options: ScrollOptions = {}): void {
  if (scroller) {
    scroller.scrollTo(el, options);
    return;
  }
  el.scrollIntoView({
    behavior: options.immediate || reduced() ? 'auto' : 'smooth',
    block: 'start',
  });
  if (options.offset) window.scrollBy(0, options.offset);
}

export function scrollToTop(options: ScrollOptions = {}): void {
  if (scroller) {
    scroller.scrollTo(0, options);
    return;
  }
  window.scrollTo({ top: 0, behavior: options.immediate || reduced() ? 'auto' : 'smooth' });
}

/**
 * Reference-counted scroll lock. Adds `pp-scroll-lock` to <html>
 * (overflow: hidden, see globals.css) and stops Lenis when present.
 */
export function lockScroll(): void {
  locks += 1;
  if (typeof document === 'undefined') return;
  document.documentElement.classList.add(LOCK_CLASS);
  scroller?.stop();
}

export function unlockScroll(): void {
  locks = Math.max(0, locks - 1);
  if (locks > 0 || typeof document === 'undefined') return;
  document.documentElement.classList.remove(LOCK_CLASS);
  scroller?.start();
}
