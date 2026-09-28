import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';

/**
 * Self-hosted at build time by next/font (no runtime Google request).
 * Each exposes a CSS variable on <html>; tokens.css aliases them to
 * --font-serif / --font-sans / --font-mono and Tailwind's
 * font-serif / font-sans / font-mono utilities.
 */
export const serif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
});

export const sans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const mono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const fontClassNames = `${serif.variable} ${sans.variable} ${mono.variable}`;
