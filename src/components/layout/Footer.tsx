import { profile } from '@content/profile';
import { LocalTime } from '@/components/ui/LocalTime';
import { CopyEmail } from '@/components/ui/CopyEmail';
import { Arrow } from '@/components/ui/Arrow';

/**
 * Contact section and site footer in one. `id="contact"` is a shortcut
 * target (`c`); `#shortcut-hint` is an empty slot the command palette
 * fills with its key legend.
 */
export function Footer() {
  const year = new Date().getFullYear();
  const socials = profile.socials.filter((s) => s.platform !== 'email');

  return (
    <footer id="contact" className="relative border-t border-border px-page pt-section pb-8">
      <div className="mx-auto max-w-(--content-max)">
        <p className="mb-6 font-mono text-micro tracking-mono text-fg-muted uppercase" data-reveal>
          Contact
        </p>
        <h2 className="max-w-5xl font-serif text-display text-fg" data-reveal>
          Let&rsquo;s build <span className="text-accent">something.</span>
        </h2>

        <div className="mt-12 grid gap-12 md:grid-cols-12 md:gap-gutter">
          <div className="md:col-span-7">
            <p className="max-w-xl text-lead text-fg-muted" data-reveal>
              Open to {formatList(profile.openTo)} roles, and to founders who need someone who has
              shipped where the stakes were real.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3" data-reveal>
              <a
                href={`mailto:${profile.email}`}
                className="group inline-flex items-center gap-2 font-sans text-h3 text-fg transition-colors duration-(--dur-fast) ease-out-quart hover:text-accent"
                data-magnetic
              >
                {profile.email}
                <Arrow
                  direction="ne"
                  className="text-fg-muted transition-transform duration-(--dur-fast) ease-out-quart group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                />
              </a>
              <CopyEmail email={profile.email} />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-micro tracking-mono uppercase">
              <a
                href={profile.resumePath}
                download
                className="inline-flex items-center gap-1.5 text-fg-muted transition-colors duration-(--dur-fast) ease-out-quart hover:text-accent pointer-coarse:-my-3 pointer-coarse:py-3"
                data-resume-link
                data-magnetic
              >
                Resume
                <Arrow direction="s" />
              </a>
              <span className="text-fg-muted">
                {profile.location.city} ·{' '}
                <LocalTime timeZone={profile.location.timezone} className="text-fg" /> local
              </span>
            </div>
          </div>

          <nav aria-label="Social" className="md:col-span-5" data-reveal>
            <ul className="divide-y divide-border border-y border-border">
              {socials.map((s) => (
                <li key={s.platform}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-center justify-between gap-4 py-4 transition-colors duration-(--dur-fast) ease-out-quart hover:text-accent"
                    data-magnetic
                  >
                    <span className="font-sans text-body">{s.label}</span>
                    <span className="flex items-center gap-2 font-mono text-label text-fg-muted group-hover:text-accent">
                      {s.handle}
                      <Arrow direction="ne" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-border pt-6 font-mono text-micro tracking-mono text-fg-muted uppercase md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {year} {profile.fullName}
          </p>
          {/* Filled by the command palette with its shortcut legend (not a live
              region: a static legend must not be announced on every mount). */}
          <div id="shortcut-hint" className="min-h-[1.4em]" />
        </div>
      </div>
    </footer>
  );
}

function formatList(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}
