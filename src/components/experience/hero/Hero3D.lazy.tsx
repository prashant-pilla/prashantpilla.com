'use client';

/**
 * Code-split boundary for the WebGL scene. `ssr: false` keeps three.js
 * out of the static HTML build and out of the page's initial JS; the
 * chunk is fetched only when Hero3D decides the device can handle it.
 */
import dynamic from 'next/dynamic';

export const LazyHeroScene = dynamic(() => import('./scene/HeroScene'), {
  ssr: false,
  loading: () => null,
});

/** Kick off the chunk download early (e.g. while the fps probe runs). */
export function preloadHeroScene(): Promise<unknown> {
  return import('./scene/HeroScene');
}
