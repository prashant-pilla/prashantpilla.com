'use client';

import { useEffect } from 'react';
import { useShortcuts } from '@/components/experience/shortcuts/ShortcutsProvider';
import { Cursor } from './Cursor';
import { JS_CLASS, MOTION_CLASS, PRELOAD_CLASS } from './constants';
import { MQ, ScrollTrigger, gsap } from './gsap';
import { Magnetic } from './Magnetic';
import { PageTransition } from './PageTransition';
import { ScrollReveals } from './ScrollReveals';
import { SmoothScroll } from './SmoothScroll';
import { WorkPreview } from './WorkPreview';

/**
 * Mounts the whole motion layer as siblings (nothing here wraps the page
 * tree, so a failure in any effect cannot take the content down with it).
 * Marks <html> with `pp-motion` so the inline bootstrap's safety timeout
 * stands down, and downgrades live if the visitor switches on reduced
 * motion mid-session: every effect's `gsap.matchMedia` reverts itself and
 * we drop the `js` class so CSS stops hiding `[data-reveal]`.
 *
 * The Preloader is mounted separately by Providers, first in <body>, so
 * its server-rendered curtain is part of the first paint; being earlier in
 * the tree its effects (scroll lock) still run before Lenis exists.
 * PageTransition goes last so its initial `page:enter` is emitted after
 * the listeners above have subscribed.
 */
export function MotionProvider() {
  const { open } = useShortcuts();

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add(MOTION_CLASS);

    const mm = gsap.matchMedia();
    mm.add(MQ.reduce, () => {
      html.classList.remove(JS_CLASS, PRELOAD_CLASS);
      gsap.set('[data-reveal], [data-hero-canvas]', { clearProps: 'opacity,transform' });
      ScrollTrigger.getAll().forEach((t) => t.kill());
    });

    return () => {
      mm.revert();
      html.classList.remove(MOTION_CLASS);
    };
  }, []);

  return (
    <>
      <SmoothScroll />
      <ScrollReveals />
      <WorkPreview />
      <Magnetic />
      <Cursor hidden={open} />
      <PageTransition />
    </>
  );
}
