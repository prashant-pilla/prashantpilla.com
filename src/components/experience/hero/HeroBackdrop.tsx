/**
 * Static hero backdrop: a layered CSS gradient composition driven by the
 * theme's `--hero-a/b/c` RGB triplets, with a soft vignette. Zero JS.
 *
 * This is the low-power / reduced-motion fallback for the 3D node field
 * and the poster shown while the R3F scene loads. It lives inside the
 * `[data-hero-canvas]` wrapper in HeroSection so the 3D phase can mount
 * its canvas alongside or in place of it.
 */
export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-bg" data-hero-backdrop>
      {/* Colour field */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            'radial-gradient(55% 60% at 72% 30%, rgb(var(--hero-a) / 0.32), transparent 70%)',
            'radial-gradient(45% 50% at 20% 75%, rgb(var(--hero-c) / 0.55), transparent 70%)',
            'radial-gradient(35% 40% at 55% 85%, rgb(var(--hero-b) / 0.06), transparent 70%)',
            'linear-gradient(180deg, rgb(var(--hero-c) / 0.18), transparent 60%)',
          ].join(', '),
        }}
      />

      {/* Faint node-field suggestion: a sparse dot lattice, masked to the centre. */}
      <svg
        className="absolute inset-0 h-full w-full opacity-40"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          maskImage: 'radial-gradient(60% 60% at 60% 45%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(60% 60% at 60% 45%, black 20%, transparent 100%)',
        }}
      >
        <defs>
          <pattern id="hero-dots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgb(var(--hero-b) / 0.35)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-dots)" />
      </svg>

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(120% 90% at 50% 40%, transparent 45%, var(--bg) 100%), linear-gradient(180deg, transparent 70%, var(--bg) 100%)',
        }}
      />
    </div>
  );
}
