/**
 * Film grain overlay.
 *
 * A fixed, pointer-events-none layer that tiles an inline SVG
 * feTurbulence noise texture over the whole viewport. Its strength is
 * driven by `--grain-opacity`, which each theme sets in tokens.css
 * (Paper mode is subtler than the dark moods). `mix-blend-mode: overlay`
 * keeps it visible on both light and dark bases.
 *
 * Pure CSS/SVG, no JS, no animation, so it costs nothing on low-end
 * devices and is safe under prefers-reduced-motion.
 */
const NOISE_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">` +
    `<filter id="n" x="0" y="0" width="100%" height="100%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>` +
    `<feColorMatrix type="saturate" values="0"/>` +
    `</filter>` +
    `<rect width="100%" height="100%" filter="url(#n)"/>` +
    `</svg>`,
);

export function Grain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-(--z-grain) mix-blend-overlay"
      style={{
        opacity: 'var(--grain-opacity)',
        backgroundImage: `url("data:image/svg+xml,${NOISE_SVG}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '240px 240px',
      }}
    />
  );
}
