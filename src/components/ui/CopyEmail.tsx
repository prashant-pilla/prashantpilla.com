'use client';

import { useEffect, useRef, useState } from 'react';

interface CopyEmailProps {
  email: string;
  className?: string;
}

/**
 * Copy-to-clipboard button for the contact email. Swaps its label to
 * "Copied" for a moment and announces the change to screen readers.
 * The neighbouring mailto link is the no-JS fallback.
 */
export function CopyEmail({ email, className }: CopyEmailProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const reset = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (reset.current) clearTimeout(reset.current);
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setState('copied');
    } catch {
      setState('failed');
    }
    if (reset.current) clearTimeout(reset.current);
    reset.current = setTimeout(() => setState('idle'), 1800);
  }

  const label = state === 'copied' ? 'Copied' : state === 'failed' ? 'Press ⌘C' : 'Copy';

  return (
    <button
      type="button"
      onClick={copy}
      data-copy-email
      data-cursor="copy"
      className={[
        'inline-flex min-w-[7ch] items-center justify-center rounded-pill border border-border px-3 py-1 font-mono text-micro tracking-mono uppercase transition-colors duration-(--dur-fast) ease-out-quart pointer-coarse:min-h-10 pointer-coarse:px-4',
        state === 'copied'
          ? 'border-accent bg-accent text-accent-fg'
          : 'text-fg-muted hover:border-accent hover:text-fg',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span aria-hidden="true">{label}</span>
      <span className="sr-only" role="status" aria-live="polite">
        {state === 'copied' ? 'Email copied to clipboard' : ''}
      </span>
      <span className="sr-only">Copy email address</span>
    </button>
  );
}
