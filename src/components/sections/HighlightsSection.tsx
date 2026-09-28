import { getHighlights } from '@/lib/content';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { HighlightsGrid } from './HighlightsGrid';

export function HighlightsSection() {
  const items = getHighlights();
  return (
    <section id="highlights" className="px-page py-section" aria-labelledby="highlights-title">
      <div className="mx-auto max-w-(--content-max)">
        <SectionHeading
          id="highlights-title"
          eyebrow="01 — Highlights"
          title={
            <>
              A collection, <span className="text-fg-muted italic">not a timeline.</span>
            </>
          }
          lede="Builds, research, ventures, and a few things from life. Curated, not chronological. Press f to cycle the filter."
        />
        <HighlightsGrid items={items} />
      </div>
    </section>
  );
}
