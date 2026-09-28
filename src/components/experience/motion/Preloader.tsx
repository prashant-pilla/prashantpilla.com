'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { profile } from '@content/profile';
import { lockScroll, unlockScroll } from '@/lib/scroll';
import { finishPreloader } from './bus';
import { PRELOAD_CLASS, PRELOADED_KEY } from './constants';
import { gsap, prefersReducedMotion } from './gsap';

/** Seconds each greeting stays up. Six greetings ≈ 1.6s of cycling. */
const STEP = 0.27;
/** Hold on the last greeting before the exit begins. */
const HOLD = 0.3;
const EXIT = 0.9;

/**
 * First-visit-of-the-session curtain. The inline MotionScript already
 * painted a CSS curtain (`html.pp-preload::before`) so this component can
 * mount after hydration without a flash; it removes that class in a layout
 * effect once its own overlay is in the DOM.
 *
 * Sequence: greetings cycle in the serif while a mono counter and a
 * hairline run 0→100, then the whole panel lifts (clip-path) and
 * `finishPreloader()` hands off to the hero reveal. Skipped (instantly
 * finished) under reduced motion and on repeat navigations.
 */
export function Preloader() {
  const [active, setActive] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const greetings = profile.greetings.length ? profile.greetings : ['Hello'];

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const html = document.documentElement;
    const show = html.classList.contains(PRELOAD_CLASS) && !prefersReducedMotion();
    if (!show) {
      html.classList.remove(PRELOAD_CLASS);
      finishPreloader();
      return;
    }
    lockScroll();
    setActive(true);
  }, []);

  // Hand-off: our overlay is painted, drop the CSS curtain in the same frame.
  useLayoutEffect(() => {
    if (active) document.documentElement.classList.remove(PRELOAD_CLASS);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const el = root.current;
    if (!el) return;

    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      try {
        sessionStorage.setItem(PRELOADED_KEY, '1');
      } catch {
        /* storage unavailable: the preloader simply plays again next time */
      }
      unlockScroll();
      finishPreloader();
    };

    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>('[data-greeting]');
      const counter = el.querySelector<HTMLElement>('[data-counter]');
      const bar = el.querySelector<HTMLElement>('[data-bar]');
      const total = words.length * STEP + HOLD;
      const progress = { value: 0 };

      const tl = gsap.timeline({ defaults: { ease: 'none' } });

      words.forEach((w, i) => {
        tl.set(w, { autoAlpha: 1 }, i * STEP);
        if (i < words.length - 1) tl.set(w, { autoAlpha: 0 }, (i + 1) * STEP);
      });

      tl.to(
        progress,
        {
          value: 100,
          duration: total,
          ease: 'power1.inOut',
          onUpdate: () => {
            if (counter) counter.textContent = String(Math.round(progress.value)).padStart(3, '0');
          },
        },
        0,
      );
      if (bar)
        tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: total, ease: 'power1.inOut' }, 0);

      tl.to(
        [words[words.length - 1], counter, bar].filter(Boolean),
        { y: -24, autoAlpha: 0, duration: 0.45, ease: 'power2.in' },
        total,
      );
      tl.add(release, total + 0.2);
      tl.to(el, { clipPath: 'inset(0 0 100% 0)', duration: EXIT, ease: 'expo.inOut' }, total + 0.2);
      tl.add(() => setActive(false));
    }, el);

    return () => ctx.revert();
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={root}
      aria-hidden="true"
      data-preloader
      className="fixed inset-0 z-(--z-preloader) flex items-center justify-center bg-bg text-fg"
      style={{ clipPath: 'inset(0 0 0% 0)' }}
    >
      <div className="relative grid h-[1.2em] w-full place-items-center font-serif text-display tracking-display">
        {greetings.map((g, i) => (
          <span
            key={`${g}-${i}`}
            data-greeting
            lang={GREETING_LANG[i]}
            className="invisible col-start-1 row-start-1 whitespace-nowrap opacity-0"
          >
            {g}
          </span>
        ))}
      </div>

      <div className="absolute inset-x-page bottom-8 flex items-end justify-between font-mono text-micro tracking-mono text-fg-muted uppercase">
        <span>{profile.name}</span>
        <span data-counter className="text-fg tabular-nums">
          000
        </span>
      </div>
      <div
        data-bar
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-fg"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}

/* Matches profile.languages order: English, Telugu, Hindi, Urdu, Spanish, French. */
const GREETING_LANG = ['en', 'te', 'hi', 'ur', 'es', 'fr'];
