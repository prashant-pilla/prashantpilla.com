import Link from 'next/link';
import type { ReactNode } from 'react';
import { Arrow } from './Arrow';

interface PageHeaderProps {
  /** Mono eyebrow above the title. */
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  /** Back link; defaults to home. */
  back?: { href: string; label: string };
  children?: ReactNode;
}

/** Shared top block for sub-pages (clears the fixed nav). */
export function PageHeader({
  eyebrow,
  title,
  lede,
  back = { href: '/', label: 'Home' },
  children,
}: PageHeaderProps) {
  return (
    <header className="pt-28 pb-12 md:pt-36 md:pb-16">
      <Link
        href={back.href}
        className="group inline-flex items-center gap-2 font-mono text-micro tracking-mono text-fg-muted uppercase transition-colors duration-(--dur-fast) ease-out-quart hover:text-accent"
      >
        <Arrow
          direction="w"
          className="transition-transform duration-(--dur-fast) ease-out-quart group-hover:-translate-x-0.5"
        />
        {back.label}
      </Link>
      <p className="mt-10 font-mono text-micro tracking-mono text-fg-muted uppercase" data-reveal>
        {eyebrow}
      </p>
      <h1 className="mt-4 max-w-5xl font-serif text-display text-fg" data-reveal>
        {title}
      </h1>
      {lede ? (
        <p className="mt-6 max-w-(--prose-max) text-lead text-fg-muted" data-reveal>
          {lede}
        </p>
      ) : null}
      {children}
    </header>
  );
}
