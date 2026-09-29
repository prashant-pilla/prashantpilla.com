'use client';

/**
 * ScrollTrigger-driven reveals for everything tagged `[data-reveal]`
 * outside the hero (the hero has its own choreography in HeroReveal).
 *
 * CSS (`html.js [data-reveal] { opacity: 0 }`) hides elements before we
 * get to them, so nothing pops in visible-then-hidden. Three treatments:
 *
 *   headings (h1/h2/h3 or `[data-split]`)  SplitText lines inside masks,
 *                                          lines slide up
 *   children of `[data-reveal-group]`      batched, staggered fade + rise
 *   everything else                        fade + rise
 *
 * `initReveals()` is idempotent per element (WeakSet guard), so
 * `refreshReveals()` can be called after any re-render (highlights filter)
 * and only new nodes are picked up. `resetReveals()` kills every trigger
 * and reverts every split; call it before a new page's elements arrive.
 */
import { ScrollTrigger, SplitText, fontsReady, gsap, prefersReducedMotion } from './gsap';

const SELECTOR = '[data-reveal]';
const HERO = '#hero';
const START = 'top 88%';

/* A Set (not WeakSet) so `resetReveals()` can forget everything: layout
 * elements such as the footer survive route changes and must be picked up
 * again by the next page's pass. */
const seen = new Set<Element>();
let ctx: gsap.Context | null = null;
let generation = 0;

export interface RevealOptions {
  /**
   * Show elements already inside the viewport without animating (used on
   * back/forward navigation, where an animated re-entry would read as a
   * glitch rather than a reveal).
   */
  instantInView?: boolean;
  root?: ParentNode;
}

function isHeading(el: HTMLElement): boolean {
  return /^H[1-3]$/.test(el.tagName) || el.hasAttribute('data-split');
}

function inView(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight * 0.92 && r.bottom > 0;
}

function showNow(els: HTMLElement[]) {
  if (!els.length) return;
  gsap.set(els, { opacity: 1, y: 0, clearProps: 'transform' });
}

function revealHeading(el: HTMLElement) {
  SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'pp-line',
    autoSplit: true,
    // Headings may carry aria-label (SplitText's default); anything else
    // tagged [data-split] (e.g. a <p>) may not, and line splits read fine.
    aria: /^H[1-6]$/.test(el.tagName) ? 'auto' : 'none',
    onSplit(self) {
      gsap.set(el, { opacity: 1 });
      if (el.dataset.revealed) return undefined;
      return gsap.from(self.lines, {
        yPercent: 110,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: START, once: true },
        onStart: () => {
          el.dataset.revealed = '1';
        },
      });
    },
  });
}

function revealBlock(el: HTMLElement) {
  gsap.fromTo(
    el,
    { opacity: 0, y: 28 },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'expo.out',
      clearProps: 'transform',
      scrollTrigger: { trigger: el, start: START, once: true },
    },
  );
}

function revealGroup(items: HTMLElement[]) {
  gsap.set(items, { opacity: 0, y: 32 });
  ScrollTrigger.batch(items, {
    start: 'top 92%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.09,
        clearProps: 'transform',
        overwrite: true,
      }),
  });
}

export async function initReveals(options: RevealOptions = {}): Promise<void> {
  // Callers outside the motion layer (HighlightsGrid's refresh) do not go
  // through gsap.matchMedia, so the reduced-motion gate lives here too.
  if (typeof document === 'undefined' || prefersReducedMotion()) return;
  const gen = ++generation;
  await fontsReady();
  // A reset happened while fonts were loading: that page is gone.
  if (gen !== generation) return;

  const root = options.root ?? document;
  const candidates = Array.from(root.querySelectorAll<HTMLElement>(SELECTOR)).filter(
    (el) => !seen.has(el) && !el.closest(HERO),
  );
  if (!candidates.length) return;
  candidates.forEach((el) => seen.add(el));

  ctx ??= gsap.context(() => {});

  ctx.add(() => {
    const instant = options.instantInView ? candidates.filter(inView) : [];
    showNow(instant);
    const remaining = candidates.filter((el) => !instant.includes(el));

    const groups = new Map<Element, HTMLElement[]>();
    const singles: HTMLElement[] = [];
    for (const el of remaining) {
      const group = el.parentElement?.closest('[data-reveal-group]');
      if (group && el.parentElement === group) {
        const list = groups.get(group) ?? [];
        list.push(el);
        groups.set(group, list);
      } else {
        singles.push(el);
      }
    }

    groups.forEach((items) => revealGroup(items));
    for (const el of singles) {
      if (isHeading(el)) revealHeading(el);
      else revealBlock(el);
    }
  });

  ScrollTrigger.refresh();
}

/** Pick up nodes added since the last run (e.g. after the highlights filter). */
export function refreshReveals(): void {
  void initReveals();
}

/** Kill every trigger/split from the current page. */
export function resetReveals(): void {
  generation += 1;
  ctx?.revert();
  ctx = null;
  seen.clear();
}
