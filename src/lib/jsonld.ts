import { profile } from '@content/profile';
import { getResearch } from '@content/research';
import type { Post, Project } from '@content/types';
import { SITE_URL } from '@/lib/site';

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const ARXIV_AUTHOR = 'https://arxiv.org/search/cs?searchtype=author&query=Pilla,+P';

export function personJsonLd(): Record<string, unknown> {
  const sameAs = [
    ...profile.socials.filter((s) => s.platform !== 'email').map((s) => s.href),
    ARXIV_AUTHOR,
  ];

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
    sameAs,
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.location.city,
      addressRegion: profile.location.region,
      addressCountry: 'US',
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'University of Minnesota',
      url: 'https://twin-cities.umn.edu/',
    },
    knowsAbout: [
      profile.tagline,
      'LLM agents',
      'grounded analysis',
      'trading infrastructure',
      'software engineering',
    ],
    knowsLanguage: profile.languages,
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: profile.name,
    url: SITE_URL,
    description: `${profile.role} in ${profile.location.city} building ${profile.tagline}. ${profile.bio}`,
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
  };
}

export function researchJsonLd(): Record<string, unknown>[] {
  return getResearch()
    .filter((r) => r.venue === 'arXiv' || r.venue === 'Journal')
    .map((r) => ({
      '@type': 'ScholarlyArticle',
      '@id': r.href,
      name: r.title,
      headline: r.title,
      url: r.href,
      description: r.summary,
      datePublished: r.date,
      author: (r.authors ?? []).map((name) =>
        name === profile.name || name === profile.fullName
          ? { '@id': PERSON_ID, name }
          : { '@type': 'Person', name },
      ),
    }));
}

export function projectJsonLd(project: Project): Record<string, unknown> {
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

export function postJsonLd(post: Post): Record<string, unknown> {
  return {
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    url: `${SITE_URL}/writing/${post.slug}`,
    author: { '@id': PERSON_ID },
    keywords: post.tags,
  };
}

export function graph(nodes: Record<string, unknown>[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  };
}
