import type { Metadata } from 'next';
import { getChangelog } from '@/lib/content';
import type { ChangelogEntry } from '@content/types';
import { formatMonthYear, monthName, parseDate } from '@/lib/site';
import { PageHeader } from '@/components/ui/PageHeader';
import { Arrow } from '@/components/ui/Arrow';

export const metadata: Metadata = {
  title: 'Changelog',
  description:
    'Dated micro-entries: what I shipped, learned, and certified. Momentum, not biography.',
  alternates: { canonical: '/changelog' },
};

interface MonthGroup {
  key: string;
  label: string;
  entries: ChangelogEntry[];
}

function groupByMonth(entries: ChangelogEntry[]): MonthGroup[] {
  const groups = new Map<string, MonthGroup>();
  for (const e of entries) {
    const key = e.date.slice(0, 7);
    if (!groups.has(key)) groups.set(key, { key, label: formatMonthYear(key), entries: [] });
    groups.get(key)!.entries.push(e);
  }
  return [...groups.values()];
}

/** "https://www.github.com/x/y" -> "github.com" */
function hostname(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return 'link';
  }
}

/** Left-column date. Day when known; otherwise the month abbreviation. */
function shortDate(iso: string): string {
  const { month, day } = parseDate(iso);
  return day ? `${monthName(month, true)} ${String(day).padStart(2, '0')}` : monthName(month, true);
}

export default function ChangelogPage() {
  const groups = groupByMonth(getChangelog());

  return (
    <div className="px-page pb-section">
      <div className="mx-auto max-w-(--content-max)">
        <PageHeader
          eyebrow="Changelog"
          title={
            <>
              What has been <span className="text-fg-muted italic">shipping lately.</span>
            </>
          }
          lede="Short entries on what shipped, what got certified, and what I am reading."
        />

        <div className="mx-auto max-w-4xl" data-changelog>
          {groups.map((g) => (
            <section
              key={g.key}
              aria-labelledby={`month-${g.key}`}
              className="grid gap-4 border-t border-border py-10 md:grid-cols-12 md:gap-gutter"
              data-reveal
            >
              <h2
                id={`month-${g.key}`}
                className="font-mono text-micro tracking-mono text-fg-muted uppercase md:col-span-3"
              >
                {g.label}
              </h2>
              <ol className="space-y-6 md:col-span-9">
                {g.entries.map((e, i) => (
                  <li key={`${e.date}-${i}`} className="grid gap-2 sm:grid-cols-[6.5rem_1fr]">
                    <time
                      dateTime={e.date}
                      className="font-mono text-micro tracking-mono text-fg-muted uppercase tabular-nums"
                    >
                      {shortDate(e.date)}
                    </time>
                    <p className="text-body text-fg">
                      {e.text}
                      {e.href ? (
                        <>
                          {' '}
                          <a
                            href={e.href}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1 align-baseline font-mono text-micro tracking-mono text-accent hover:underline"
                          >
                            {hostname(e.href)} <Arrow direction="ne" />
                          </a>
                        </>
                      ) : null}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          ))}
          <div className="border-t border-border" />
        </div>
      </div>
    </div>
  );
}
