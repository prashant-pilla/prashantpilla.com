import { profile } from '@/lib/content';

/**
 * Phase 1 placeholder. Renders identity from content so the deployed page
 * is never blank. Phase 2 replaces this with the real sections.
 */
export default function HomePage() {
  const { location } = profile;
  return (
    <section className="flex min-h-dvh flex-col justify-between px-page py-gutter">
      <header className="flex items-center justify-between font-mono text-micro tracking-mono text-fg-muted uppercase">
        <span>{profile.fullName}</span>
        <span>
          {location.city}, {location.region}
        </span>
      </header>

      <div className="max-w-(--content-max)">
        <h1 className="font-serif text-hero tracking-display text-fg">{profile.name}</h1>
        <p className="mt-6 max-w-(--prose-max) text-lead text-fg-muted">
          {profile.role}
          <span className="text-fg"> — </span>
          <span className="text-accent">{profile.tagline}</span>
        </p>
        <p className="mt-10 max-w-(--prose-max) font-serif text-h3 text-fg">{profile.bio}</p>
      </div>

      <footer className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-4 font-mono text-micro tracking-mono text-fg-muted uppercase">
        {profile.socials.map((s) => (
          <a
            key={s.platform}
            href={s.href}
            className="transition-colors duration-(--dur-fast) ease-out-quart hover:text-accent"
            {...(s.platform === 'email' ? {} : { target: '_blank', rel: 'noreferrer noopener' })}
          >
            {s.label}
          </a>
        ))}
        <span className="ml-auto">Site in progress</span>
      </footer>
    </section>
  );
}
