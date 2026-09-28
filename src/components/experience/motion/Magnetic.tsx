'use client';

import { useEffect } from 'react';
import { MQ, gsap } from './gsap';

const SELECTOR = '[data-magnetic]';
/** Fraction of the pointer offset the element follows, clamped so wide
 * elements (full-width social rows) do not fly across the layout. */
const PULL = 0.3;
const MAX_SHIFT = 14;
const clampShift = gsap.utils.clamp(-MAX_SHIFT, MAX_SHIFT);

/**
 * Magnetic hover for `[data-magnetic]` elements (footer email, socials,
 * resume link, nav wordmark). Delegated from `document` so it works across
 * client-side navigations without rescans. Fine pointers + motion only.
 */
export function Magnetic() {
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(`${MQ.motion} and ${MQ.fine}`, () => {
      let current: HTMLElement | null = null;
      let toX: ((v: number) => void) | null = null;
      let toY: ((v: number) => void) | null = null;

      const release = () => {
        if (!current) return;
        gsap.to(current, {
          x: 0,
          y: 0,
          duration: 0.9,
          ease: 'elastic.out(1, 0.45)',
          overwrite: true,
          clearProps: 'transform',
        });
        current = null;
        toX = toY = null;
      };

      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        const target = (e.target as Element | null)?.closest?.(SELECTOR) as HTMLElement | null;

        if (target !== current) {
          release();
          if (target) {
            current = target;
            toX = gsap.quickTo(target, 'x', { duration: 0.6, ease: 'power3' });
            toY = gsap.quickTo(target, 'y', { duration: 0.6, ease: 'power3' });
          }
        }
        if (!current || !toX || !toY) return;
        const r = current.getBoundingClientRect();
        toX(clampShift((e.clientX - (r.left + r.width / 2)) * PULL));
        toY(clampShift((e.clientY - (r.top + r.height / 2)) * PULL));
      };

      document.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerleave', release);
      return () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerleave', release);
        release();
      };
    });

    return () => mm.revert();
  }, []);

  return null;
}
