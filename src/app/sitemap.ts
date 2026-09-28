import type { MetadataRoute } from 'next';
import { getChangelog, getProjectSlugs, getWritingPosts } from '@/lib/content';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const latestChange = getChangelog()[0]?.date;
  const lastModified = latestChange ? toDate(latestChange) : new Date();

  const work = getProjectSlugs().map((slug) => ({
    url: `${SITE_URL}/work/${slug}`,
    lastModified,
    changeFrequency: 'yearly' as const,
    priority: 0.8,
  }));

  const posts = getWritingPosts().map((p) => ({
    url: `${SITE_URL}/writing/${p.slug}`,
    lastModified: toDate(p.date),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));

  return [
    { url: SITE_URL, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/changelog`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/writing`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    ...work,
    ...posts,
  ];
}

/** `YYYY-MM` or `YYYY-MM-DD` -> Date at UTC midnight. */
function toDate(iso: string): Date {
  const [y, m, d = '1'] = iso.split('-');
  return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
}
