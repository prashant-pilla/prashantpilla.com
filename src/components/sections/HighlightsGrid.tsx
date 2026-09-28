'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Highlight, HighlightKind } from '@content/types';
import { Arrow } from '@/components/ui/Arrow';

export type HighlightFilter = 'all' | HighlightKind;

export const HIGHLIGHT_FILTERS: { id: HighlightFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'build', label: 'Builds' },
  { id: 'research', label: 'Research' },
  { id: 'venture', label: 'Ventures' },
  { id: 'life', label: 'Life' },
];

const KIND_LABEL: Record<HighlightKind, string> = {
  build: 'Build',
  research: 'Research',
  venture: 'Venture',
  life: 'Life',
};

/** Window event dispatched by the command palette on `f` to advance the filter. */
export const CYCLE_FILTER_EVENT = 'pp:cycle-filter';

interface HighlightsGridProps {
  /** Pre-sorted by weight desc (see getHighlights()). */
  items: Highlight[];
}

export function HighlightsGrid({ items }: HighlightsGridProps) {
  const [filter, setFilter] = useState<HighlightFilter>('all');

  const cycle = useCallback(() => {
    setFilter((current) => {
      const i = HIGHLIGHT_FILTERS.findIndex((f) => f.id === current);
      return HIGHLIGHT_FILTERS[(i + 1) % HIGHLIGHT_FILTERS.length].id;
    });
  }, []);

  useEffect(() => {
    window.addEventListener(CYCLE_FILTER_EVENT, cycle);
    return () => window.removeEventListener(CYCLE_FILTER_EVENT, cycle);
  }, [cycle]);

  const visible = useMemo(
    () => (filter === 'all' ? items : items.filter((h) => h.kind === filter)),
    [items, filter],
  );

  return (
    <div data-highlights data-filter={filter}>
      <div
        role="group"
        aria-label="Filter highlights"
        className="mb-10 flex flex-wrap gap-2"
        data-reveal
      >
        {HIGHLIGHT_FILTERS.map((f) => {
          const active = f.id === filter;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.id)}
              data-filter-chip={f.id}
              className={[
                'rounded-pill border px-3.5 py-1.5 font-mono text-micro tracking-mono uppercase transition-colors duration-(--dur-fast) ease-out-quart',
                active
                  ? 'border-fg bg-fg text-bg'
                  : 'border-border text-fg-muted hover:border-fg-muted hover:text-fg',
              ].join(' ')}
            >
              {f.label}
            </button>
          );
        })}
        <span className="sr-only" aria-live="polite">
          Showing {visible.length} {filter === 'all' ? 'highlights' : `${filter} highlights`}
        </span>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-highlights-grid>
        {visible.map((h) => (
          <li key={h.id} data-reveal data-kind={h.kind}>
            <HighlightCard item={h} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function HighlightCard({ item }: { item: Highlight }) {
  const external = !!item.href;
  const body = (
    <>
      {item.image ? (
        <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-md border border-border">
          <Image
            src={item.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-3 font-mono text-micro tracking-mono text-fg-muted uppercase">
        <span className="text-accent">{KIND_LABEL[item.kind]}</span>
        {external ? (
          <Arrow
            direction="ne"
            className="transition-transform duration-(--dur-fast) ease-out-quart group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
          />
        ) : null}
      </div>
      <h3 className="mt-6 font-sans text-h3 leading-tight text-fg">{item.title}</h3>
      <p className="mt-3 line-clamp-3 text-body text-fg-muted">{item.blurb}</p>
      {item.meta ? (
        <p className="mt-auto pt-6 font-mono text-micro tracking-mono text-fg-muted uppercase">
          {item.meta}
        </p>
      ) : null}
    </>
  );

  const cls =
    'group flex h-full flex-col rounded-lg border border-border bg-bg-elevated p-6 transition-colors duration-(--dur-fast) ease-out-quart sm:p-7';

  if (external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer noopener"
        className={`${cls} hover:border-fg-muted`}
        aria-label={`${item.title} (opens in a new tab)`}
      >
        {body}
      </a>
    );
  }
  return <article className={cls}>{body}</article>;
}
