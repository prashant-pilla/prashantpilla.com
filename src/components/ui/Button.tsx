import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Arrow } from './Arrow';

type Variant = 'primary' | 'ghost';

interface BaseProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  /** Show a trailing arrow (auto-rotates for external links). */
  arrow?: boolean;
}

type AnchorProps = BaseProps & { href: string } & Omit<ComponentPropsWithoutRef<'a'>, 'href'>;

const base =
  'group inline-flex items-center gap-2 rounded-pill px-5 py-2.5 font-sans text-label transition-colors duration-(--dur-fast) ease-out-quart';

const variants: Record<Variant, string> = {
  primary: 'bg-fg text-bg hover:bg-accent hover:text-accent-fg',
  ghost: 'border border-border text-fg hover:border-accent hover:text-accent',
};

function isExternal(href: string) {
  return /^(https?:)?\/\//.test(href) || href.startsWith('mailto:');
}

/**
 * Pill button rendered as a link. Internal hrefs use next/link; external
 * ones open in a new tab with safe rel attributes.
 */
export function ButtonLink({
  href,
  variant = 'ghost',
  arrow = true,
  className,
  children,
  ...rest
}: AnchorProps) {
  const cls = [base, variants[variant], className].filter(Boolean).join(' ');
  const external = isExternal(href);
  const arrowEl = arrow ? (
    <Arrow
      direction={external && !href.startsWith('mailto:') ? 'ne' : 'e'}
      className="transition-transform duration-(--dur-fast) ease-out-quart group-hover:translate-x-0.5"
    />
  ) : null;

  if (external) {
    return (
      <a
        href={href}
        className={cls}
        {...(href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noreferrer noopener' })}
        {...rest}
      >
        {children}
        {arrowEl}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
      {arrowEl}
    </Link>
  );
}
