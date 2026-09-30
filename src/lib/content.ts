import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { Post, PostFrontmatter, Project, ProjectFrontmatter } from '@content/types';

/**
 * Filesystem content loader. Server-only (runs at build time under
 * `output: 'export'`); never import this from a client component.
 *
 * MDX strategy: `next-mdx-remote/rsc` + `gray-matter`, not `@next/mdx`.
 * `@next/mdx` wants MDX files to be routes or imported modules and needs
 * extra remark plugins to surface frontmatter as data. With
 * next-mdx-remote the MDX lives under `content/`, gray-matter gives us a
 * typed frontmatter object, and the body is compiled inside a React
 * Server Component at build time, which is exactly what a static export
 * needs. No runtime MDX, no client bundle for the compiler.
 *
 * Re-exports the TypeScript data modules so consumers have one import
 * surface: `import { getProjects, profile } from '@/lib/content'`.
 */

export { profile } from '@content/profile';
export { highlights, getHighlights } from '@content/highlights';
export { changelog, getChangelog } from '@content/changelog';
export { ventures, getVentures } from '@content/ventures';
export { research, getResearch } from '@content/research';
export type * from '@content/types';

const CONTENT_ROOT = path.join(process.cwd(), 'content');
const PROJECTS_DIR = path.join(CONTENT_ROOT, 'projects');
const WRITING_DIR = path.join(CONTENT_ROOT, 'writing');

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function listMdx(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .sort();
}

function readMdx(filePath: string): { data: Record<string, unknown>; body: string } {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  return { data, body: content.trim() };
}

function fail(file: string, msg: string): never {
  throw new Error(`[content] ${path.relative(process.cwd(), file)}: ${msg}`);
}

function str(file: string, data: Record<string, unknown>, key: string, required = true): string {
  const v = data[key];
  if (typeof v === 'string' && v.trim()) return v.trim();
  if (!required && (v === undefined || v === null)) return '';
  return fail(file, `frontmatter "${key}" must be a non-empty string`);
}

function num(file: string, data: Record<string, unknown>, key: string): number {
  const v = data[key];
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  return fail(file, `frontmatter "${key}" must be a number`);
}

function bool(
  file: string,
  data: Record<string, unknown>,
  key: string,
  fallback: boolean,
): boolean {
  const v = data[key];
  if (v === undefined) return fallback;
  if (typeof v === 'boolean') return v;
  return fail(file, `frontmatter "${key}" must be a boolean`);
}

function strList(
  file: string,
  data: Record<string, unknown>,
  key: string,
  required = true,
): string[] {
  const v = data[key];
  if (Array.isArray(v) && v.every((x) => typeof x === 'string')) return v as string[];
  if (!required && v === undefined) return [];
  return fail(file, `frontmatter "${key}" must be a list of strings`);
}

function slugFromFile(file: string): string {
  return path.basename(file).replace(/\.mdx?$/, '');
}

function estimateReadingTime(body: string): number {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

function parseProject(file: string): Project {
  const { data, body } = readMdx(file);
  const slug = str(file, data, 'slug', false) || slugFromFile(file);
  if (slug !== slugFromFile(file)) {
    fail(file, `frontmatter slug "${slug}" must match the filename`);
  }

  const rawLinks = (data.links ?? {}) as Record<string, unknown>;
  const links: ProjectFrontmatter['links'] = {};
  for (const k of ['github', 'live', 'video'] as const) {
    const v = rawLinks[k];
    if (typeof v === 'string' && v.trim()) links[k] = v.trim();
  }

  const fm: ProjectFrontmatter = {
    title: str(file, data, 'title'),
    slug,
    summary: str(file, data, 'summary'),
    role: str(file, data, 'role'),
    year: num(file, data, 'year'),
    stack: strList(file, data, 'stack'),
    links,
    cover: str(file, data, 'cover', false) || undefined,
    tagline: str(file, data, 'tagline', false) || undefined,
    featured: bool(file, data, 'featured', false),
    order: num(file, data, 'order'),
  };

  return { ...fm, body };
}

/** All projects, sorted by `order` ascending. */
export function getProjects(): Project[] {
  return listMdx(PROJECTS_DIR)
    .map((f) => parseProject(path.join(PROJECTS_DIR, f)))
    .sort((a, b) => a.order - b.order);
}

/** Projects flagged `featured: true`, sorted by `order`. */
export function getFeaturedProjects(): Project[] {
  return getProjects().filter((p) => p.featured);
}

export function getProject(slug: string): Project | undefined {
  const candidates = [`${slug}.mdx`, `${slug}.md`].map((f) => path.join(PROJECTS_DIR, f));
  const file = candidates.find((f) => fs.existsSync(f));
  return file ? parseProject(file) : undefined;
}

/** For `generateStaticParams` on /work/[slug]. */
export function getProjectSlugs(): string[] {
  return listMdx(PROJECTS_DIR).map(slugFromFile);
}

/* ------------------------------------------------------------------ */
/* Writing                                                             */
/* ------------------------------------------------------------------ */

function parsePost(file: string): Post {
  const { data, body } = readMdx(file);
  const slug = str(file, data, 'slug', false) || slugFromFile(file);
  if (slug !== slugFromFile(file)) {
    fail(file, `frontmatter slug "${slug}" must match the filename`);
  }
  const fm: PostFrontmatter = {
    title: str(file, data, 'title'),
    slug,
    date: str(file, data, 'date'),
    summary: str(file, data, 'summary'),
    tags: strList(file, data, 'tags', false),
    draft: bool(file, data, 'draft', false),
  };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.date)) {
    fail(file, `frontmatter "date" must be YYYY-MM-DD`);
  }
  return { ...fm, body, readingTime: estimateReadingTime(body) };
}

/**
 * Published posts, newest first. Returns [] when content/writing has no
 * MDX yet (only a .gitkeep), so /writing can render its "featured
 * external writing" state without special-casing.
 */
export function getWritingPosts(): Post[] {
  return listMdx(WRITING_DIR)
    .map((f) => parsePost(path.join(WRITING_DIR, f)))
    .filter((p) => !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): Post | undefined {
  const candidates = [`${slug}.mdx`, `${slug}.md`].map((f) => path.join(WRITING_DIR, f));
  const file = candidates.find((f) => fs.existsSync(f));
  if (!file) return undefined;
  const post = parsePost(file);
  return post.draft ? undefined : post;
}

/** For `generateStaticParams` on /writing/[slug]. */
export function getPostSlugs(): string[] {
  return getWritingPosts().map((p) => p.slug);
}
