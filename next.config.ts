import type { NextConfig } from 'next';

/**
 * Pure static export. The site is served as plain HTML/CSS/JS from `out/`
 * (Vercel Hobby today; portable to any static host). No server runtime,
 * no image optimizer, no dynamic routes at request time.
 */
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  experimental: {
    /**
     * Inline the (single, ~10 KB gzipped) Tailwind stylesheet into each
     * exported HTML file instead of a render-blocking <link>. One fewer
     * round trip before first paint, which on a slow connection is the
     * largest part of FCP/LCP for this site. Nine pages, so the lost
     * cross-page cache is negligible.
     */
    inlineCss: true,
  },
};

export default nextConfig;
