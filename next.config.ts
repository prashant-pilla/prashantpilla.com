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
};

export default nextConfig;
