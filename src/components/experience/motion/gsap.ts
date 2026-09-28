'use client';

/**
 * Single GSAP entry point for the motion layer. Registers the plugins once
 * and exposes the shared media queries and helpers every effect checks.
 * Import gsap from here, never from 'gsap' directly, so plugin registration
 * cannot be forgotten.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: 'expo.out', duration: 0.9 });
}

export { gsap, ScrollTrigger, SplitText };

/** Media queries used with `gsap.matchMedia()` and `window.matchMedia`. */
export const MQ = {
  motion: '(prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
  fine: '(hover: hover) and (pointer: fine)',
  md: '(min-width: 768px)',
} as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(MQ.reduce).matches;
}

export function hasFinePointer(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(MQ.fine).matches;
}

/** Resolves once web fonts are loaded (SplitText must run after this). */
export function fontsReady(): Promise<unknown> {
  if (typeof document === 'undefined' || !('fonts' in document)) return Promise.resolve();
  return document.fonts.ready;
}
