import { profile, getResearch } from '@/lib/content';
import { formatDate } from '@/lib/site';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Arrow } from '@/components/ui/Arrow';

export function AboutSection() {
  const research = getResearch();
  const paper = research.find((r) => r.venue === 'arXiv');
  const medium = research.find((r) => r.venue === 'Medium');

  return (
    <section id="about" className="px-page py-section" aria-labelledby="about-title">
      <div className="mx-auto max-w-(--content-max)">
        <SectionHeading
          id="about-title"
          eyebrow="03 — About"
          title={
            <>
              Born in Auckland. Raised in Hyderabad.{' '}
              <span className="text-fg-muted italic">Building in New York.</span>
            </>
          }
        />

        <div className="grid gap-16 lg:grid-cols-12 lg:gap-gutter">
          <div className="space-y-8 lg:col-span-7">
            {profile.about.map((paragraph, i) => (
              <p key={i} className="max-w-3xl font-serif text-lead text-fg" data-reveal>
                {paragraph}
              </p>
            ))}
          </div>

          <dl className="grid content-start gap-y-6 lg:col-span-5" data-reveal>
            {profile.facts.map((f) => (
              <div key={f.label} className="grid gap-1 border-t border-border pt-4 sm:grid-cols-3">
                <dt className="font-mono text-micro tracking-mono text-fg-muted uppercase">
                  {f.label}
                </dt>
                <dd className="text-body text-fg sm:col-span-2">
                  {f.href ? (
                    <a
                      href={f.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group inline-flex items-center gap-1.5 transition-colors duration-(--dur-fast) ease-out-quart hover:text-accent"
                    >
                      {f.value}
                      <Arrow direction="ne" className="text-fg-muted group-hover:text-accent" />
                    </a>
                  ) : (
                    f.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {paper ? (
          <div
            id="research"
            className="mt-section-sm grid gap-8 rounded-lg border border-border bg-bg-elevated p-6 sm:p-8 lg:grid-cols-12 lg:gap-gutter"
            data-reveal
          >
            <div className="lg:col-span-7">
              <p className="font-mono text-micro tracking-mono text-fg-muted uppercase">
                Research · {paper.venue}
                {paper.date ? ` · ${formatDate(paper.date)}` : ''}
              </p>
              <h3 className="mt-4 font-serif text-h2 text-fg">
                <a
                  href={paper.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="transition-colors duration-(--dur-fast) ease-out-quart hover:text-accent"
                >
                  {paper.title}
                </a>
              </h3>
              {paper.authors ? (
                <p className="mt-2 text-label text-fg-muted">{paper.authors.join(', ')}</p>
              ) : null}
              <p className="mt-5 max-w-2xl text-body text-fg-muted">{paper.summary}</p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-micro tracking-mono uppercase">
                <a
                  href={paper.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-accent hover:underline"
                >
                  Read on arXiv <Arrow direction="ne" />
                </a>
                {medium ? (
                  <a
                    href={medium.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 text-fg-muted transition-colors duration-(--dur-fast) ease-out-quart hover:text-fg"
                  >
                    {medium.title} <Arrow direction="ne" />
                  </a>
                ) : null}
              </div>
            </div>

            {paper.metrics?.length ? (
              <dl className="grid gap-3 self-start sm:grid-cols-2 lg:col-span-5">
                {paper.metrics.map((m) => (
                  <div key={m.label} className="rounded-md border border-border p-4">
                    <dt className="font-mono text-micro tracking-mono text-fg-muted uppercase">
                      {m.label}
                    </dt>
                    <dd className="mt-2 font-serif text-h3 text-fg tabular-nums">{m.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
