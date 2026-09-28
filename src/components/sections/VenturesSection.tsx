import { getVentures } from '@/lib/content';
import { formatMonthYear } from '@/lib/site';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Tag } from '@/components/ui/Tag';
import { Arrow } from '@/components/ui/Arrow';
import type { VentureStatus } from '@content/types';

const STATUS_LABEL: Record<Exclude<VentureStatus, 'placeholder'>, string> = {
  active: 'Active',
  exploring: 'Exploring',
  past: 'Past',
};

export function VenturesSection() {
  // getVentures() already drops placeholders; filter defensively anyway.
  const ventures = getVentures().filter((v) => v.status !== 'placeholder');

  return (
    <section id="ventures" className="px-page py-section" aria-labelledby="ventures-title">
      <div className="mx-auto max-w-(--content-max)">
        <SectionHeading
          id="ventures-title"
          eyebrow="04 — Ventures"
          title="Engineer, and builder."
          lede="Scouting, angel work, and the occasional company. If you are a founder or want to build something together, my inbox is open."
        />

        <ul className="grid gap-4 md:grid-cols-2" data-ventures>
          {ventures.map((v) => {
            const status = v.status as Exclude<VentureStatus, 'placeholder'>;
            const inner = (
              <>
                <div className="flex items-center justify-between gap-4">
                  <Tag tone={status === 'active' ? 'solid' : 'outline'}>{STATUS_LABEL[status]}</Tag>
                  {v.href ? (
                    <Arrow
                      direction="ne"
                      className="text-fg-muted transition-transform duration-(--dur-fast) ease-out-quart group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                    />
                  ) : null}
                </div>
                <h3 className="mt-8 font-serif text-h2 text-fg">{v.name}</h3>
                <p className="mt-2 font-mono text-micro tracking-mono text-fg-muted uppercase">
                  {v.role}
                  {v.since ? ` · since ${formatMonthYear(v.since)}` : ''}
                </p>
                <p className="mt-5 max-w-xl text-body text-fg-muted">{v.description}</p>
              </>
            );
            const cls =
              'group flex h-full flex-col rounded-lg border border-border bg-bg-elevated p-6 transition-colors duration-(--dur-fast) ease-out-quart sm:p-8';
            return (
              <li key={v.name} data-reveal>
                {v.href ? (
                  <a
                    href={v.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={`${cls} hover:border-fg-muted`}
                  >
                    {inner}
                  </a>
                ) : (
                  <article className={cls}>{inner}</article>
                )}
              </li>
            );
          })}

          {/* Open slot: reads as intent, not emptiness. */}
          <li data-reveal>
            <a
              href="#contact"
              className="group flex h-full min-h-56 flex-col justify-between rounded-lg border border-dashed border-border p-6 transition-colors duration-(--dur-fast) ease-out-quart hover:border-accent sm:p-8"
            >
              <Tag>Next</Tag>
              <span>
                <span className="block font-serif text-h2 text-fg-muted transition-colors duration-(--dur-fast) ease-out-quart group-hover:text-fg">
                  Something we have not built yet.
                </span>
                <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-micro tracking-mono text-fg-muted uppercase group-hover:text-accent">
                  Start a conversation <Arrow direction="e" />
                </span>
              </span>
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
