import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Not found',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section
      className="flex min-h-svh flex-col justify-end px-page pt-32 pb-16"
      aria-labelledby="nf-title"
    >
      <div className="mx-auto w-full max-w-(--content-max)">
        <p className="mb-6 font-mono text-micro tracking-mono text-fg-muted uppercase">
          404 — Page not found
        </p>
        <h1 id="nf-title" className="font-serif text-hero tracking-display text-fg">
          Lost<span className="text-accent">.</span>
        </h1>
        <p className="mt-8 max-w-(--prose-max) font-serif text-h3 text-fg-muted italic">
          This page moved, never existed, or is waiting to be built. The work is still here.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/" variant="primary">
            Home
          </ButtonLink>
          <ButtonLink href="/#work">Selected work</ButtonLink>
          <ButtonLink href="/changelog">Changelog</ButtonLink>
        </div>
      </div>
    </section>
  );
}
