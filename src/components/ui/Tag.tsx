import type { ReactNode } from 'react';

interface TagProps {
  children: ReactNode;
  /** `solid` uses the accent; `outline` is the default hairline chip. */
  tone?: 'outline' | 'solid' | 'muted';
  className?: string;
}

/** Small mono label chip used for stacks, kinds, statuses, and metrics. */
export function Tag({ children, tone = 'outline', className }: TagProps) {
  const tones = {
    outline: 'border border-border text-fg-muted',
    solid: 'bg-accent text-accent-fg',
    muted: 'bg-bg-elevated text-fg-muted',
  } as const;
  return (
    <span
      className={[
        'inline-flex items-center rounded-pill px-2.5 py-1 font-mono text-micro tracking-mono whitespace-nowrap uppercase',
        tones[tone],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
