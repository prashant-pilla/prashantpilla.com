import { profile } from '@content/profile';
import { Hero3D } from '@/components/experience/hero/Hero3D';
import { HeroBackdrop } from '@/components/experience/hero/HeroBackdrop';
import { HeroReveal } from '@/components/experience/motion/HeroReveal';
import { LocalTime } from '@/components/ui/LocalTime';
import { Arrow } from '@/components/ui/Arrow';
import { RotatingBadge } from './RotatingBadge';

/**
 * Full-viewport opener. `[data-hero-canvas]` holds the 3D node field:
 * Hero3D renders the static backdrop on the server and while probing, then
 * code-splits the WebGL scene in (`Hero3D.lazy`, ssr: false) on capable
 * devices. A vignette sits between canvas and copy so the text stays
 * readable in every theme. Foreground pieces carry `data-hero="…"` for
 * HeroReveal's opening choreography.
 */
export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex min-h-svh flex-col justify-end overflow-hidden px-page pt-32 pb-10"
      aria-labelledby="hero-name"
    >
      <div data-hero-canvas data-cursor="drag" className="absolute inset-0 z-(--z-hero)">
        <Hero3D fallback={<HeroBackdrop />} />
        {/* Legibility layer above the canvas, below the copy. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(180deg, transparent 35%, rgb(from var(--bg) r g b / 0.55) 75%, var(--bg) 100%), radial-gradient(90% 70% at 30% 80%, rgb(from var(--bg) r g b / 0.5), transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-(--z-content) mx-auto w-full max-w-(--content-max)">
        <p
          className="mb-6 flex flex-wrap items-center gap-x-3 font-mono text-micro tracking-mono text-fg-muted uppercase"
          data-reveal
          data-hero="readout"
        >
          <span>{profile.location.city}</span>
          <span aria-hidden="true">·</span>
          <span>
            <LocalTime timeZone={profile.location.timezone} className="text-fg" /> local
          </span>
        </p>

        <h1
          id="hero-name"
          className="font-serif text-hero tracking-display text-fg"
          data-reveal
          data-split
          data-hero="name"
        >
          {profile.name}
        </h1>

        <div className="mt-10 grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="text-lead text-fg" data-reveal data-hero="role">
              {profile.role}
              <span className="text-fg-muted"> — </span>
              <span className="text-accent">{profile.tagline}</span>
            </p>
            <p
              className="mt-6 max-w-(--prose-max) font-serif text-h3 text-fg-muted italic"
              data-reveal
              data-hero="bio"
            >
              {profile.bio}
            </p>
          </div>

          <div className="flex items-end justify-between gap-6 md:col-span-5 md:justify-end">
            <RotatingBadge items={profile.cities} />
          </div>
        </div>

        <a
          href="#highlights"
          className="mt-14 inline-flex items-center gap-2 font-mono text-micro tracking-mono text-fg-muted uppercase transition-colors duration-(--dur-fast) ease-out-quart hover:text-accent"
          data-scroll-hint
        >
          Scroll
          <Arrow direction="s" className="animate-bounce motion-reduce:animate-none" />
        </a>
      </div>

      <HeroReveal />
    </section>
  );
}
