'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';
import { registerScroller } from '@/lib/scroll';
import { MQ, ScrollTrigger, gsap } from './gsap';

const SCROLL_DURATION = 1.15;
const expoOut = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * One Lenis instance, driven by the GSAP ticker and feeding ScrollTrigger.
 * Only created for fine-pointer devices that allow motion; touch devices
 * and reduced-motion visitors keep native scrolling. Registers itself in
 * the scroll registry so shortcuts / palette / anchor links scroll through
 * Lenis instead of `scrollIntoView` (which would fight the smoothing).
 */
export function SmoothScroll() {
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(`${MQ.motion} and ${MQ.fine}`, () => {
      const lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
        autoRaf: false,
        anchors: false,
      });

      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      const offScroll = lenis.on('scroll', ScrollTrigger.update);

      registerScroller({
        scrollTo: (target, options = {}) =>
          lenis.scrollTo(target, {
            immediate: options.immediate,
            offset: options.offset ?? 0,
            duration: SCROLL_DURATION,
            easing: expoOut,
            // Programmatic scrolls must win even while the preloader lock is up.
            force: true,
          }),
        stop: () => lenis.stop(),
        start: () => lenis.start(),
      });

      return () => {
        registerScroller(null);
        offScroll();
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    });

    return () => mm.revert();
  }, []);

  return null;
}
