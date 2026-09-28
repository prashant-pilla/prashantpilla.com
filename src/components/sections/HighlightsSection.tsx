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
              Things I have built, <span className="text-fg-muted italic">and a few I have lived.</span>
            </>
          }
          lede="Builds, research, ventures, and life. Press f to cycle the filter."
        />
        <HighlightsGrid items={items} />
      </div>
    </section>
  );
}
