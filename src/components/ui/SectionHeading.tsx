import type { ReactNode } from 'react';

interface SectionHeadingProps {
  /** Mono eyebrow, e.g. "01 — Highlights". */
  eyebrow: string;
  title: ReactNode;
  /** Optional one-line description under the title. */
  lede?: ReactNode;
  /** Optional slot rendered to the right of the heading on wide screens. */
  aside?: ReactNode;
  /** Heading element; the home page uses h2, sub-pages use h1. */
  as?: 'h1' | 'h2';
  id?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  aside,
  as: Heading = 'h2',
  id,
  className,
}: SectionHeadingProps) {
  return (
    <header
      className={[
        'mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="max-w-3xl">
        <p className="mb-4 font-mono text-micro tracking-mono text-fg-muted uppercase" data-reveal>
          {eyebrow}
        </p>
        <Heading id={id} className="font-serif text-h1 text-fg" data-reveal>
          {title}
        </Heading>
        {lede ? (
          <p className="mt-4 max-w-2xl text-lead text-fg-muted" data-reveal>
            {lede}
          </p>
        ) : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </header>
  );
}
