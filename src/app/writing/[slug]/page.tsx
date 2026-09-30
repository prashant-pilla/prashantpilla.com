import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPost, getPostSlugs } from '@/lib/content';
import { Mdx } from '@/lib/mdx';
import { formatDate } from '@/lib/site';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tag } from '@/components/ui/Tag';
import { ButtonLink } from '@/components/ui/Button';
import { JsonLd } from '@/components/seo/JsonLd';
import { graph, postJsonLd } from '@/lib/jsonld';

interface Params {
  slug: string;
}

/**
 * Must build with zero posts. `output: 'export'` refuses a dynamic route
 * that prerenders nothing, so when content/writing is empty we emit one
 * placeholder slug that renders a small static "coming soon" page
 * (noindex, not in sitemap, never linked). It disappears automatically
 * once the first post lands.
 */
export const dynamicParams = false;

const PLACEHOLDER_SLUG = 'coming-soon';

export function generateStaticParams(): Params[] {
  const slugs = getPostSlugs();
  return (slugs.length ? slugs : [PLACEHOLDER_SLUG]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { robots: { index: false, follow: false } };
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/writing/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.date,
      url: `/writing/${post.slug}`,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (slug === PLACEHOLDER_SLUG) return <ComingSoon />;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="px-page pb-section" data-post={post.slug}>
      <JsonLd data={graph([postJsonLd(post)])} />
      <div className="mx-auto max-w-(--content-max)">
        <PageHeader
          eyebrow={`Writing · ${formatDate(post.date)} · ${post.readingTime} min read`}
          title={post.title}
          lede={post.summary}
          back={{ href: '/writing', label: 'Writing' }}
        >
          {post.tags?.length ? (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          ) : null}
        </PageHeader>

        <div className="prose mx-auto" data-reveal>
          <Mdx source={post.body} />
        </div>

        <footer className="mx-auto mt-section-sm max-w-(--prose-max) border-t border-border pt-8">
          <ButtonLink href="/writing" arrow={false}>
            ← All writing
          </ButtonLink>
        </footer>
      </div>
    </article>
  );
}

function ComingSoon() {
  return (
    <section className="px-page pb-section" aria-labelledby="soon-title">
      <div className="mx-auto max-w-(--content-max)">
        <PageHeader
          eyebrow="Writing"
          title={
            <span id="soon-title">
              First post, <span className="text-fg-muted italic">still cooking.</span>
            </span>
          }
          lede="Nothing is published here yet. The research is on the index."
          back={{ href: '/writing', label: 'Writing' }}
        >
          <div className="mt-8">
            <ButtonLink href="/writing" variant="primary">
              Back to writing
            </ButtonLink>
          </div>
        </PageHeader>
      </div>
    </section>
  );
}
