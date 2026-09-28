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
      const offs = [
        onPreloaderDone(() => void initReveals()),
        on('page:leave', () => resetReveals()),
        on('page:enter', ({ via }) => {
          if (via === 'initial') return; // handled by onPreloaderDone
          if (via === 'history') resetReveals();
          void initReveals({ instantInView: via === 'history' });
        }),
      ];
      return () => {
        offs.forEach((off) => off());
        resetReveals();
      };
    });

    return () => mm.revert();
  }, []);

  return null;
}
