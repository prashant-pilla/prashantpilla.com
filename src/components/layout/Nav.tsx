import Link from 'next/link';
import { profile } from '@content/profile';
import { SITE_NAV } from '@/lib/site';
import { LocalTime } from '@/components/ui/LocalTime';

/**
 * Fixed top bar. Wordmark left; section links and the live New York
 * clock right. The trailing spacer reserves room for the theme switcher,
 * which the theme engine mounts as its own fixed element in that corner.
 */
export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-(--z-nav)" data-nav>
      {/* Frosted backing that fades out, so it reads as air over the hero and as a bar over content. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -bottom-6 bg-bg/70 [mask-image:linear-gradient(to_bottom,black_55%,transparent)] backdrop-blur-md"
      />
      <a
        href="#main"
        data-native
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-(--z-overlay) focus:rounded-pill focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-micro focus:tracking-mono focus:text-accent-fg focus:uppercase"
      >
        Skip to content
      </a>
      <nav
        aria-label="Primary"
        className="relative flex items-center justify-between gap-6 px-page py-5 text-fg"
      >
        <Link
          href="/"
          className="inline-block font-serif text-h3 leading-none tracking-display transition-colors duration-(--dur-fast) ease-out-quart hover:text-accent"
          data-magnetic
        >
          {profile.name}
        </Link>

        <div className="flex items-center gap-6 font-mono text-micro tracking-mono uppercase">
          <ul className="hidden items-center gap-5 sm:flex">
            {SITE_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-fg-muted transition-colors duration-(--dur-fast) ease-out-quart hover:text-fg"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <span className="flex items-center gap-2 text-fg-muted">
            <span className="hidden md:inline">{profile.location.city}</span>
            <LocalTime timeZone={profile.location.timezone} className="text-fg" />
          </span>
          {/* Reserved for the theme switcher (mounted separately). */}
          <span aria-hidden="true" className="w-10 shrink-0 sm:w-12" data-nav-spacer />
        </div>
      </nav>
    </header>
  );
}
