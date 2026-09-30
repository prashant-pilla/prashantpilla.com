import { profile } from '@content/profile';
import { getResearch } from '@content/research';
import type { Post, Project } from '@content/types';
import { SITE_URL } from '@/lib/site';

/**
 * schema.org JSON-LD builders. Everything derives from `content/` so the
 * structured data can never disagree with the rendered page. Rendered by
 * `<JsonLd/>`; kept as plain objects here so they are unit-testable and
 * usable from the llms.txt route.
 */

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

type JsonLdObject = Record<string, unknown>;

function socialUrls(): string[] {
  return profile.socials.filter((s) => s.platform !== 'email').map((s) => s.href);
}

export function personJsonLd(): JsonLdObject {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: profile.name,
    alternateName: profile.fullName,
    jobTitle: profile.role,
    description: profile.bio,
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image`,
    email: `mailto:${profile.email}`,
    sameAs: socialUrls(),
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.location.city,
      addressRegion: profile.location.region,
      addressCountry: 'US',
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'University of Minnesota',
      sameAs: 'https://twin-cities.umn.edu/',
    },
    knowsAbout: [
      'Applied AI',
      'LLM agents',
      'Machine learning',
      'Quantitative finance',
      'Software engineering',
      'Blockchain',
    ],
    knowsLanguage: profile.languages,
  };
}

export function websiteJsonLd(): JsonLdObject {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: profile.name,
    url: SITE_URL,
    author: { '@id': PERSON_ID },
    inLanguage: 'en-US',
  };
}

/** One ScholarlyArticle per arXiv/journal item in `content/research.ts`. */
export function researchJsonLd(): JsonLdObject[] {
  return getResearch()
    .filter((r) => r.venue === 'arXiv' || r.venue === 'Journal')
    .map((r) => ({
      '@type': 'ScholarlyArticle',
      '@id': r.href,
      headline: r.title,
      url: r.href,
      abstract: r.summary,
      datePublished: r.date,
      author: (r.authors ?? [profile.name]).map((name) =>
        name === profile.name || name === profile.fullName
          ? { '@id': PERSON_ID }
          : { '@type': 'Person', name },
      ),
      publisher: { '@type': 'Organization', name: r.venue },
    }));
}

export function projectJsonLd(project: Project): JsonLdObject {
  return {
    '@type': 'SoftwareSourceCode',
    name: project.title,
    description: project.summary,
    url: `${SITE_URL}/work/${project.slug}`,
    codeRepository: project.links.github,
    programmingLanguage: project.stack,
    dateCreated: String(project.year),
    author: { '@id': PERSON_ID },
    ...(project.links.live ? { installUrl: project.links.live } : {}),
  };
}

export function postJsonLd(post: Post): JsonLdObject {
  return {
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    url: `${SITE_URL}/writing/${post.slug}`,
    datePublished: post.date,
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    keywords: post.tags,
    isPartOf: { '@id': WEBSITE_ID },
  };
}

/** Wrap one or more nodes in a single `@graph` document. */
export function graph(nodes: JsonLdObject[]): JsonLdObject {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
