import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProject, getProjectSlugs, getProjects } from '@/lib/content';
import { Mdx } from '@/lib/mdx';
import { padIndex } from '@/lib/site';
import { PageHeader } from '@/components/ui/PageHeader';
import { ButtonLink } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { GradientTile } from '@/components/ui/GradientTile';
import { Arrow } from '@/components/ui/Arrow';
import { JsonLd } from '@/components/seo/JsonLd';
import { graph, projectJsonLd } from '@/lib/jsonld';

interface Params {
  slug: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: project.title,
      description: project.summary,
      type: 'article',
      url: `/work/${project.slug}`,
    },
  };
}

const LINK_LABEL = { github: 'GitHub', live: 'Live site', video: 'Watch demo' } as const;

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const all = getProjects();
  const index = all.findIndex((p) => p.slug === project.slug);
  const prev = index > 0 ? all[index - 1] : undefined;
  const next = index < all.length - 1 ? all[index + 1] : undefined;

  const links = (Object.keys(LINK_LABEL) as (keyof typeof LINK_LABEL)[])
    .filter((k) => project.links[k])
    .map((k) => ({ key: k, href: project.links[k]!, label: LINK_LABEL[k] }));

  return (
    <article className="px-page pb-section" data-case-study={project.slug}>
      <JsonLd data={graph([projectJsonLd(project)])} />
      <div className="mx-auto max-w-(--content-max)">
        <PageHeader
          eyebrow={`Work · ${padIndex(index + 1)} / ${padIndex(all.length)} · ${project.year}`}
          title={project.title}
          lede={project.summary}
          back={{ href: '/#work', label: 'Selected work' }}
        >
          <dl className="mt-12 grid gap-8 border-t border-border pt-8 md:grid-cols-12 md:gap-gutter">
            <div className="md:col-span-3">
              <dt className="font-mono text-micro tracking-mono text-fg-muted uppercase">Role</dt>
              <dd className="mt-2 text-body text-fg">{project.role}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="font-mono text-micro tracking-mono text-fg-muted uppercase">Year</dt>
              <dd className="mt-2 text-body text-fg tabular-nums">{project.year}</dd>
            </div>
            <div className="md:col-span-7">
              <dt className="font-mono text-micro tracking-mono text-fg-muted uppercase">Stack</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {project.stack.map((s) => (
                  <Tag key={s}>{s}</Tag>
                ))}
              </dd>
            </div>
          </dl>

          {links.length ? (
            <div className="mt-8 flex flex-wrap gap-3" data-reveal>
              {links.map((l, i) => (
                <ButtonLink key={l.key} href={l.href} variant={i === 0 ? 'primary' : 'ghost'}>
                  {l.label}
                </ButtonLink>
              ))}
            </div>
          ) : null}
        </PageHeader>

        <GradientTile
          seed={index + 1}
          cover={project.cover}
          alt={project.cover ? `${project.title} cover` : ''}
          className="aspect-[21/9] w-full rounded-lg border border-border"
        />

        <div className="mt-16 grid gap-12 md:mt-24 md:grid-cols-12 md:gap-gutter">
          <aside className="hidden md:col-span-3 md:block">
            <p className="sticky top-32 font-mono text-micro tracking-mono text-fg-muted uppercase">
              Case study
            </p>
          </aside>
          <div className="prose md:col-span-8 md:col-start-4" data-reveal>
            <Mdx source={project.body} />
          </div>
        </div>

        <nav
          aria-label="More work"
          className="mt-section-sm grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
        >
          {prev ? <AdjacentLink project={prev} direction="prev" /> : <span />}
          {next ? <AdjacentLink project={next} direction="next" /> : <span />}
        </nav>
      </div>
    </article>
  );
}

function AdjacentLink({
  project,
  direction,
}: {
  project: { slug: string; title: string; summary: string };
  direction: 'prev' | 'next';
}) {
  const isNext = direction === 'next';
  return (
    <Link
      href={`/work/${project.slug}`}
      className={[
        'group flex flex-col gap-3 rounded-lg border border-border p-6 transition-colors duration-(--dur-fast) ease-out-quart hover:border-fg-muted',
        isNext ? 'sm:text-right' : '',
      ].join(' ')}
    >
      <span
        className={[
          'inline-flex items-center gap-1.5 font-mono text-micro tracking-mono text-fg-muted uppercase',
          isNext ? 'sm:justify-end' : '',
        ].join(' ')}
      >
        {isNext ? null : <Arrow direction="w" />}
        {isNext ? 'Next' : 'Previous'}
        {isNext ? <Arrow direction="e" /> : null}
      </span>
      <span className="font-serif text-h2 text-fg transition-colors duration-(--dur-fast) ease-out-quart group-hover:text-accent">
        {project.title}
      </span>
    </Link>
  );
}
