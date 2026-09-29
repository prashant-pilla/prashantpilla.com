'use client';

import { useEffect } from 'react';
import { on, onPreloaderDone } from './bus';
import { MQ, gsap } from './gsap';
import { initReveals, resetReveals } from './reveals';

/**
 * Drives `reveals.ts` from the page lifecycle: waits for the preloader on
 * first load, re-runs after every `page:enter`, and tears everything down
 * when a cut begins (`page:leave`) so no stale ScrollTrigger survives into
 * the next page. Under reduced motion nothing runs and CSS never hid
 * anything (no `js` class).
 */
export function ScrollReveals() {
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(MQ.motion, () => {
      /* First pass runs in an idle slot: SplitText measures every heading
       * (forced layouts) and ScrollTrigger refreshes, none of which needs
       * to compete with hydration or the hero reveal. Below-the-fold
       * content stays CSS-hidden until then and scroll is still locked. */
      let idle: number | undefined;
      let timer: number | undefined;
      const initWhenIdle = () => {
        const run = () => void initReveals();
        if (typeof window.requestIdleCallback === 'function') {
          idle = window.requestIdleCallback(run, { timeout: 1000 });
        } else {
          timer = window.setTimeout(run, 120);
        }
      };
      const offs = [
        onPreloaderDone(initWhenIdle),
        on('page:leave', () => resetReveals()),
        on('page:enter', ({ via }) => {
          if (via === 'initial') return; // handled by onPreloaderDone
          if (via === 'history') resetReveals();
          void initReveals({ instantInView: via === 'history' });
        }),
      ];
      return () => {
        offs.forEach((off) => off());
        if (idle !== undefined) window.cancelIdleCallback?.(idle);
        if (timer !== undefined) window.clearTimeout(timer);
        resetReveals();
      };
    });

    return () => mm.revert();
  }, []);

  return null;
}
