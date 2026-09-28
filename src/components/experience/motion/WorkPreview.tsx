'use client';

import { useEffect } from 'react';
import { on } from './bus';
import { MQ, gsap } from './gsap';

const ROW = '[data-work-list] [data-preview]';
const TILE = '[data-preview-tile]';
const TITLE = '[data-preview-title]';

/**
 * Selected Work hover preview (Dennis style). On desktop pointer devices
 * the hidden `[data-preview-tile]` of the hovered row scales in and
 * follows the cursor with a lerp; the row title nudges right and the other
 * rows dim. Event delegation on `document` means it survives client-side
 * navigation for free; a `page:enter` rescan re-applies base styles.
 * Nothing runs on touch or under reduced motion.
 */
export function WorkPreview() {
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(`${MQ.motion} and ${MQ.fine} and ${MQ.md}`, () => {
      let active: HTMLElement | null = null;
      let moveX: ((v: number) => void) | null = null;
      let moveY: ((v: number) => void) | null = null;

      const rows = () => gsap.utils.toArray<HTMLElement>(ROW);
      // Dim the row's link, not the row: the <li> carries the scroll reveal.
      const links = (except?: HTMLElement) =>
        rows()
          .filter((r) => r !== except)
          .map((r) => r.querySelector<HTMLElement>('a'))
          .filter((a): a is HTMLElement => a !== null);

      const prime = () => {
        rows().forEach((row) => {
          const tile = row.querySelector<HTMLElement>(TILE);
          if (!tile) return;
          // Take over from the Tailwind placement classes.
          gsap.set(tile, {
            top: 0,
            left: 0,
            right: 'auto',
            xPercent: -50,
            yPercent: -50,
            opacity: 0,
            scale: 0.85,
            rotate: -3,
            zIndex: 20,
          });
        });
      };
      prime();
      const offEnter = on('page:enter', () => {
        requestAnimationFrame(prime);
      });

      const place = (row: HTMLElement, tile: HTMLElement, e: PointerEvent) => {
        const r = row.getBoundingClientRect();
        moveX?.(e.clientX - r.left);
        moveY?.(e.clientY - r.top);
      };

      const leave = () => {
        const row = active;
        if (!row) return;
        active = null;
        const tile = row.querySelector<HTMLElement>(TILE);
        const title = row.querySelector<HTMLElement>(TITLE);
        if (tile) {
          gsap.to(tile, {
            opacity: 0,
            scale: 0.85,
            rotate: -3,
            duration: 0.35,
            ease: 'power3.out',
            overwrite: true,
          });
        }
        if (title) gsap.to(title, { x: 0, duration: 0.5, ease: 'expo.out', overwrite: true });
        gsap.to(links(), { opacity: 1, duration: 0.4, ease: 'power2.out', overwrite: true });
        moveX = moveY = null;
      };

      const enter = (row: HTMLElement, e: PointerEvent) => {
        if (active === row) return;
        if (active) leave();
        active = row;
        const tile = row.querySelector<HTMLElement>(TILE);
        const title = row.querySelector<HTMLElement>(TITLE);
        if (tile) {
          const r = row.getBoundingClientRect();
          gsap.set(tile, { x: e.clientX - r.left, y: e.clientY - r.top });
          moveX = gsap.quickTo(tile, 'x', { duration: 0.5, ease: 'power3' });
          moveY = gsap.quickTo(tile, 'y', { duration: 0.5, ease: 'power3' });
          gsap.to(tile, {
            opacity: 1,
            scale: 1,
            rotate: 0,
            duration: 0.55,
            ease: 'expo.out',
            overwrite: true,
          });
        }
        if (title) gsap.to(title, { x: 16, duration: 0.6, ease: 'expo.out', overwrite: true });
        gsap.to(links(row), { opacity: 0.35, duration: 0.45, ease: 'power2.out', overwrite: true });
      };

      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        const target = e.target as Element | null;
        const row = target?.closest?.(ROW) as HTMLElement | null;
        if (!row) {
          if (active) leave();
          return;
        }
        if (row !== active) enter(row, e);
        const tile = row.querySelector<HTMLElement>(TILE);
        if (tile) place(row, tile, e);
      };

      document.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerleave', leave);

      return () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerleave', leave);
        offEnter();
        gsap.set(gsap.utils.toArray<HTMLElement>(`${ROW} ${TILE}, ${ROW} ${TITLE}, ${ROW} > a`), {
          clearProps: 'all',
        });
      };
    });

    return () => mm.revert();
  }, []);

  return null;
}
