import type { Metadata } from 'next';
import Link from 'next/link';
import { getResearch, getWritingPosts } from '@/lib/content';
import { formatDate } from '@/lib/site';
import { PageHeader } from '@/components/ui/PageHeader';
import { Arrow } from '@/components/ui/Arrow';
import { Tag } from '@/components/ui/Tag';

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Notes on building AI systems for finance. Research on arXiv.',
  alternates: { canonical: '/writing' },
};

export default function WritingPage() {
  const posts = getWritingPosts();
  const research = getResearch();

  return (
    <div className="px-page pb-section">
      <div className="mx-auto max-w-(--content-max)">
        <PageHeader
          eyebrow="Writing"
          title={
            posts.length ? (
              'Notes and essays.'
            ) : (
              <>
                Nothing here yet, <span className="text-fg-muted italic">on purpose.</span>
              </>
            )
          }
          lede={
            posts.length
              ? 'Longer-form notes on building AI systems for finance.'
              : 'The first post lands when it is worth your time. Until then, the research below is where I have already said something.'
          }
        />

        {posts.length ? (
          <ol className="mx-auto max-w-4xl border-t border-border" data-posts>
            {posts.map((p) => (
              <li key={p.slug} className="border-b border-border" data-reveal>
                <Link
                  href={`/writing/${p.slug}`}
                  className="group grid gap-3 py-8 md:grid-cols-12 md:gap-gutter"
                >
                  <time
                    dateTime={p.date}
                    className="font-mono text-micro tracking-mono text-fg-muted uppercase md:col-span-3"
                  >
                    {formatDate(p.date)} · {p.readingTime} min
                  </time>
                  <span className="md:col-span-9">
                    <span className="block font-serif text-h2 text-fg transition-colors duration-(--dur-fast) ease-out-quart group-hover:text-accent">
                      {p.title}
                    </span>
                    <span className="mt-3 block max-w-2xl text-body text-fg-muted">
                      {p.summary}
                    </span>
                    {p.tags?.length ? (
                      <span className="mt-4 flex flex-wrap gap-2">
                        {p.tags.map((t) => (
                          <Tag key={t}>{t}</Tag>
                        ))}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ) : null}

        <section
          aria-labelledby="elsewhere-title"
          className={posts.length ? 'mt-section-sm' : ''}
          data-elsewhere
        >
          <h2
            id="elsewhere-title"
            className="mb-8 font-mono text-micro tracking-mono text-fg-muted uppercase"
          >
            {posts.length ? 'Elsewhere' : 'Published elsewhere'}
          </h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {research.map((r, i) => (
              <li key={r.id} data-reveal>
                <a
                  href={r.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={[
                    'group flex h-full flex-col rounded-lg border border-border p-6 transition-colors duration-(--dur-fast) ease-out-quart hover:border-fg-muted sm:p-8',
                    i === 0 ? 'bg-bg-elevated md:col-span-2 lg:col-span-1' : '',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-4 font-mono text-micro tracking-mono text-fg-muted uppercase">
                    <span>
                      <span className="text-accent">{r.venue}</span>
                      {r.date ? ` · ${formatDate(r.date)}` : ''}
                    </span>
                    <Arrow
                      direction="ne"
                      className="transition-transform duration-(--dur-fast) ease-out-quart group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                    />
                  </div>
                  <h3 className="mt-8 font-serif text-h2 text-fg">{r.title}</h3>
                  {r.authors?.length ? (
                    <p className="mt-2 text-label text-fg-muted">{r.authors.join(', ')}</p>
                  ) : null}
                  <p className="mt-5 max-w-xl text-body text-fg-muted">{r.summary}</p>
                  {r.metrics?.length ? (
                    <div className="mt-auto flex flex-wrap gap-2 pt-8">
                      {r.metrics.slice(0, 3).map((m) => (
                        <Tag key={m.label} tone="muted">
                          {m.label}: {m.value}
                        </Tag>
                      ))}
                    </div>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
