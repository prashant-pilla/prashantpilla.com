import {
  getChangelog,
  getHighlights,
  getProjects,
  getResearch,
  getVentures,
  getWritingPosts,
  profile,
} from '@/lib/content';
import { formatDate, SITE_URL } from '@/lib/site';

/**
 * First-party identity file for AI crawlers (llmstxt.org). Built from the
 * same content modules the site renders, so a model describing this person
 * is reading the same source of truth as the HTML.
 */
export const dynamic = 'force-static';

export function GET(): Response {
  const research = getResearch();
  const projects = getProjects();
  const posts = getWritingPosts();
  const ventures = getVentures();
  const highlights = getHighlights().filter((h) => h.kind !== 'life');
  const changelog = getChangelog().slice(0, 8);

  const github = profile.socials.find((s) => s.platform === 'github');
  const linkedin = profile.socials.find((s) => s.platform === 'linkedin');
  const x = profile.socials.find((s) => s.platform === 'x');

  const lines: string[] = [
    `# ${profile.fullName}`,
    '',
    `> ${profile.role} in ${profile.location.city} building ${profile.tagline}.`,
    '',
    profile.about[0] ?? profile.bio,
    '',
    '## Links',
    '',
    `- Site: ${SITE_URL}`,
    `- Resume: ${SITE_URL}${profile.resumePath}`,
    github ? `- GitHub: ${github.href}` : '',
    linkedin ? `- LinkedIn: ${linkedin.href}` : '',
    x ? `- X: ${x.href}` : '',
    `- Email: ${profile.email}`,
    '',
    '## Research',
    '',
    ...research.map((r) => {
      const when = r.date ? ` (${formatDate(r.date)})` : '';
      return `- ${r.title} — ${r.venue}${when}: ${r.href}`;
    }),
    '',
    '## Work',
    '',
    ...projects.map((p) => {
      const repo = p.links.github ? ` ${p.links.github}` : '';
      return `- ${p.title} (${p.year}): ${p.summary}${repo}`;
    }),
    '',
  ];

  if (posts.length) {
    lines.push(
      '## Writing',
      '',
      ...posts.map((p) => `- ${p.title} (${formatDate(p.date)}): ${p.summary}`),
      '',
    );
  }

  if (ventures.length) {
    lines.push(
      '## Ventures',
      '',
      ...ventures.map(
        (v) =>
          `- ${v.name} (${v.role}${v.status === 'active' ? ', active' : ''}): ${v.description}`,
      ),
      '',
    );
  }

  lines.push(
    '## Highlights',
    '',
    ...highlights.map((h) => `- ${h.title}${h.meta ? ` — ${h.meta}` : ''}`),
    '',
    '## Recent',
    '',
    ...changelog.map((c) => `- ${formatDate(c.date)}: ${c.text}`),
    '',
    '## Facts',
    '',
    ...profile.facts.map((f) => `- ${f.label}: ${f.value}`),
    '',
    `Open to: ${profile.openTo.join(', ')}.`,
    '',
  );

  const body = lines.filter((line, i, arr) => !(line === '' && arr[i - 1] === '')).join('\n');

  return new Response(body.endsWith('\n') ? body : `${body}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
