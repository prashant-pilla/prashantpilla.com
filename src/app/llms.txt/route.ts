import {
  getChangelog,
  getHighlights,
  getProjects,
  getResearch,
  getVentures,
  getWritingPosts,
  profile,
} from '@/lib/content';
import { SITE_URL, formatDate } from '@/lib/site';

export const dynamic = 'force-static';

/**
 * /llms.txt: a plain-Markdown summary of this site for AI crawlers and
 * assistants (see llmstxt.org). Generated from the same `content/` data
 * as the HTML, so a model quoting this file cannot disagree with the
 * page a human sees. Regenerates on every build.
 */
export function GET(): Response {
  const projects = getProjects();
  const research = getResearch();
  const posts = getWritingPosts();
  const ventures = getVentures();
  const highlights = getHighlights().filter((h) => h.kind !== 'life');
  const changelog = getChangelog().slice(0, 8);
  const socials = profile.socials.filter((s) => s.platform !== 'email');

  const lines: string[] = [
    `# ${profile.name}`,
    '',
    `> ${profile.fullName} is a ${profile.role.toLowerCase()} in ${profile.location.city} building ${profile.tagline}. ${profile.bio}`,
    '',
    ...profile.about,
    '',
    `Open to: ${profile.openTo.join(', ')}.`,
    `Contact: ${profile.email}`,
    `Resume: ${SITE_URL}${profile.resumePath}`,
    '',
    '## Profiles',
    '',
    ...socials.map((s) => `- [${s.label}](${s.href}): ${s.handle}`),
    '',
    '## Research',
    '',
    ...research.map((r) => {
      const authors = r.authors?.length ? ` by ${r.authors.join(', ')}` : '';
      const date = r.date ? `, ${formatDate(r.date)}` : '';
      return `- [${r.title}](${r.href}) (${r.venue}${date})${authors}. ${r.summary}`;
    }),
    '',
    '## Projects',
    '',
    ...projects.map((p) => {
      const links = [
        p.links.github ? `code: ${p.links.github}` : null,
        p.links.live ? `live: ${p.links.live}` : null,
        p.links.video ? `demo: ${p.links.video}` : null,
      ]
        .filter(Boolean)
        .join('; ');
      return `- [${p.title}](${SITE_URL}/work/${p.slug}) (${p.year}, ${p.role}; ${p.stack.join(', ')}). ${p.summary}${links ? ` ${links}.` : ''}`;
    }),
  ];

  if (posts.length) {
    lines.push('', '## Writing', '');
    lines.push(
      ...posts.map(
        (p) => `- [${p.title}](${SITE_URL}/writing/${p.slug}) (${formatDate(p.date)}). ${p.summary}`,
      ),
    );
  }

  if (ventures.length) {
    lines.push('', '## Ventures', '');
    lines.push(
      ...ventures.map(
        (v) => `- ${v.name} (${v.role}, ${v.status}${v.since ? ` since ${v.since}` : ''}). ${v.description}`,
      ),
    );
  }

  lines.push('', '## Highlights', '');
  lines.push(...highlights.map((h) => `- ${h.title}. ${h.blurb}${h.href ? ` ${h.href}` : ''}`));

  lines.push('', '## Recent changes', '');
  lines.push(...changelog.map((c) => `- ${c.date}: ${c.text}${c.href ? ` ${c.href}` : ''}`));

  lines.push(
    '',
    '## Facts',
    '',
    ...profile.facts.map((f) => `- ${f.label}: ${f.value}`),
    `- Languages: ${profile.languages.join(', ')}`,
    `- Cities: ${profile.cities.join(', ')}`,
    '',
    `Canonical site: ${SITE_URL}. Sitemap: ${SITE_URL}/sitemap.xml.`,
    '',
  );

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
