import Link from 'next/link';
import { getFeaturedProjects, getProjects } from '@/lib/content';
import { padIndex } from '@/lib/site';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GradientTile } from '@/components/ui/GradientTile';
import { Arrow } from '@/components/ui/Arrow';

/**
 * Selected Work as a Dennis-style list. Each row carries
 * `data-preview="<slug>"` and a hidden `[data-preview-tile]` the motion
 * phase can reveal and move with the cursor.
 */
export function WorkSection() {
  const featured = getFeaturedProjects();
  const projects = featured.length ? featured : getProjects();

  return (
    <section id="work" className="px-page py-section" aria-labelledby="work-title">
      <div className="mx-auto max-w-(--content-max)">
        <SectionHeading
          id="work-title"
          eyebrow="02 — Selected Work"
          title="Things I have shipped."
          lede="Case studies with the problem, what I built, and what happened."
        />

        <ol className="border-t border-border" data-work-list data-reveal-group>
          {projects.map((p, i) => (
            <li
              key={p.slug}
              className="relative border-b border-border"
              data-preview={p.slug}
              data-cursor="view"
              data-reveal
            >
              <Link
                href={`/work/${p.slug}`}
                className="group grid gap-x-gutter gap-y-3 py-8 transition-colors duration-(--dur-fast) ease-out-quart hover:text-accent focus-visible:text-accent md:grid-cols-12 md:items-baseline md:py-10"
              >
                <span className="font-mono text-micro tracking-mono text-fg-muted uppercase md:col-span-1">
                  {padIndex(i + 1)}
                </span>

                <span className="md:col-span-6">
                  <span
                    className="block font-serif text-display leading-none tracking-display"
                    data-preview-title
                  >
                    {p.title}
                  </span>
                </span>

                <span className="flex flex-col gap-3 md:col-span-4">
                  <span className="text-body text-fg-muted">{p.summary}</span>
                  <span className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-micro tracking-mono text-fg-muted uppercase">
                    {p.stack.slice(0, 4).map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </span>
                </span>

                <span className="flex items-center justify-between gap-4 font-mono text-micro tracking-mono text-fg-muted uppercase md:col-span-1 md:justify-end">
                  <span>{p.year}</span>
                  <Arrow
                    direction="e"
                    className="transition-transform duration-(--dur-fast) ease-out-quart group-hover:translate-x-1 group-hover:text-accent"
                  />
                </span>
              </Link>

              {/* Hover preview: WorkPreview positions this under the cursor on desktop. */}
              <div
                data-preview-tile
                aria-hidden="true"
                className="pointer-events-none absolute top-0 left-0 hidden w-[22rem] md:block md:opacity-0"
              >
                <GradientTile
                  seed={i + 1}
                  cover={p.cover}
                  alt=""
                  className="aspect-[4/3] rounded-lg border border-border"
                />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
