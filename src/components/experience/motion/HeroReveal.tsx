'use client';

import { useEffect } from 'react';
import { motionState, once, onPreloaderDone } from './bus';
import { JS_CLASS } from './constants';
import { MQ, SplitText, fontsReady, gsap } from './gsap';

/**
 * Opening choreography for the hero, rendered inside HeroSection (returns
 * null). Waits for fonts, then for whichever gate applies: the preloader
 * on a first load, or the page-transition curtain on a client navigation
 * back to `/`. Under reduced motion (no `js` class) it does nothing and the
 * hero is simply visible.
 *
 * Order: canvas fades up, readout, name (words), role and bio (masked
 * lines), badge, scroll hint.
 */
export function HeroReveal() {
  useEffect(() => {
    if (!document.documentElement.classList.contains(JS_CLASS)) return;
    const mm = gsap.matchMedia();

    mm.add(MQ.motion, () => {
      const hero = document.getElementById('hero');
      if (!hero) return;
      const q = gsap.utils.selector(hero);

      let cancelled = false;
      let offGate: (() => void) | undefined;
      let tl: gsap.core.Timeline | undefined;
      const splits: SplitText[] = [];

      const play = () => {
        const canvas = q('[data-hero-canvas]');
        const readout = q('[data-hero="readout"]');
        const name = q<HTMLElement>('[data-hero="name"]');
        const copy = q<HTMLElement>('[data-hero="role"], [data-hero="bio"]');
        const badge = q('[data-rotating-badge]');
        const hint = q('[data-scroll-hint]');

        const nameSplit = name[0]
          ? SplitText.create(name[0], { type: 'words', wordsClass: 'pp-word', aria: 'auto' })
          : null;
        if (nameSplit) splits.push(nameSplit);

        const lines: Element[] = [];
        copy.forEach((el) => {
          // `aria: 'none'`: these are <p>, where aria-label is prohibited
          // (axe aria-prohibited-attr). Line splitting keeps words intact, so
          // screen readers read the line <div>s in order without help.
          const s = SplitText.create(el, {
            type: 'lines',
            mask: 'lines',
            linesClass: 'pp-line',
            aria: 'none',
          });
          splits.push(s);
          lines.push(...s.lines);
        });

        // Parents become visible; their pieces start hidden.
        gsap.set([...name, ...copy, ...readout], { opacity: 1 });
        gsap.set(hint, { opacity: 0 });

        tl = gsap.timeline({
          defaults: { ease: 'expo.out' },
          // Once the choreography is done, put the plain text back: no line
          // masks to fight a resize/orientation change, no aria-label on the
          // name, natural wrapping again.
          onComplete: () => {
            splits.splice(0).forEach((s) => s.revert());
          },
        });
        tl.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 1.8, ease: 'power2.out' }, 0);
        tl.fromTo(readout, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8 }, 0.15);
        if (nameSplit) {
          tl.from(nameSplit.words, { yPercent: 45, opacity: 0, duration: 1.4, stagger: 0.09 }, 0.2);
        }
        tl.from(lines, { yPercent: 110, duration: 1.1, stagger: 0.07 }, 0.55);
        tl.fromTo(
          badge,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 1, clearProps: 'transform' },
          0.8,
        );
        tl.to(hint, { opacity: 1, duration: 0.6 }, 1.2);
      };

      const start = () => {
        if (cancelled) return;
        void fontsReady().then(() => {
          if (!cancelled) play();
        });
      };

      if (motionState.transitionPending) offGate = once('page:enter', start);
      else offGate = onPreloaderDone(start);

      return () => {
        cancelled = true;
        offGate?.();
        tl?.kill();
        splits.forEach((s) => s.revert());
      };
    });

    return () => mm.revert();
  }, []);

  return null;
}
