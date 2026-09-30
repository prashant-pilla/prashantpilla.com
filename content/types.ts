/**
 * Content contracts for prashantpilla.com.
 *
 * Everything under `content/` conforms to these types. Section components
 * (phase 2), the command palette (phase 3), and SEO routes render from
 * these shapes and never from hard-coded copy. To add a job, project,
 * venture, or changelog entry in the future: edit the matching data file,
 * `git push`, done.
 *
 * Dates are ISO strings. Where only a month is known, `YYYY-MM` is used
 * and consumers should format at month precision.
 */

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

export type SocialPlatform = 'github' | 'linkedin' | 'x' | 'medium' | 'email';

export interface Social {
  platform: SocialPlatform;
  label: string;
  /** Display handle, e.g. "@abstruderex" or "prashant-pilla". */
  handle: string;
  href: string;
}

export interface Fact {
  label: string;
  value: string;
  href?: string;
}

export interface Location {
  city: string;
  region: string;
  country: string;
  /** IANA timezone used for the live "local time" readout. */
  timezone: string;
}

export interface Profile {
  /** Short display name used in the hero and title. */
  name: string;
  fullName: string;
  role: string;
  /** Short positioning line, e.g. "AI systems for finance". */
  tagline: string;
  /** One reflective sentence under the hero. */
  bio: string;
  /** 3-4 short first-person paragraphs for the About section. */
  about: string[];
  location: Location;
  /** Cities lived in, for the rotating hero badge. */
  cities: string[];
  languages: string[];
  /** Facts grid for the About section. */
  facts: Fact[];
  socials: Social[];
  email: string;
  /**
   * Path to the resume PDF under /public. The file may be absent; UI must
   * treat this as a plain link and not fetch/validate it at build time.
   */
  resumePath: string;
  /** Greeting cycle for the multilingual preloader, in display order. */
  greetings: string[];
  /** Roles currently open to (Contact section). */
  openTo: string[];
}

/* ------------------------------------------------------------------ */
/* Highlights (the non-chronological "cool stuff" grid)                */
/* ------------------------------------------------------------------ */

export type HighlightKind = 'build' | 'research' | 'venture' | 'life';

export interface Highlight {
  id: string;
  kind: HighlightKind;
  title: string;
  /** Two lines max. */
  blurb: string;
  /** Curation weight; higher renders earlier. */
  weight: number;
  href?: string;
  /** Path under /public or absolute URL. */
  image?: string;
  /** Small mono caption, e.g. "arXiv · Jan 2025". */
  meta?: string;
}

/* ------------------------------------------------------------------ */
/* Projects (content/projects/*.mdx)                                   */
/* ------------------------------------------------------------------ */

export interface ProjectLinks {
  github?: string;
  live?: string;
  video?: string;
}

export interface ProjectFrontmatter {
  title: string;
  slug: string;
  summary: string;
  role: string;
  year: number;
  stack: string[];
  links: ProjectLinks;
  /** Path under /public or absolute URL. */
  cover?: string;
  featured: boolean;
  /** Ascending sort key for the Selected Work list. */
  order: number;
}

export interface Project extends ProjectFrontmatter {
  /** Raw MDX body (frontmatter stripped). Render with <Mdx source=…/>. */
  body: string;
}

/* ------------------------------------------------------------------ */
/* Writing (content/writing/*.mdx)                                     */
/* ------------------------------------------------------------------ */

export interface PostFrontmatter {
  title: string;
  slug: string;
  /** YYYY-MM-DD */
  date: string;
  summary: string;
  tags?: string[];
  draft?: boolean;
}

export interface Post extends PostFrontmatter {
  body: string;
  /** Approximate minutes, computed by the loader. */
  readingTime: number;
}

/* ------------------------------------------------------------------ */
/* Research and external writing                                       */
/* ------------------------------------------------------------------ */

export type ResearchVenue = 'arXiv' | 'Medium' | 'Journal' | 'Other';

export interface ResearchMetric {
  label: string;
  value: string;
}

export interface ResearchItem {
  id: string;
  title: string;
  venue: ResearchVenue;
  href: string;
  /** YYYY-MM-DD or YYYY-MM. Omit when unknown (e.g. a profile link). */
  date?: string;
  authors?: string[];
  summary: string;
  metrics?: ResearchMetric[];
}

/* ------------------------------------------------------------------ */
/* Changelog (/changelog)                                              */
/* ------------------------------------------------------------------ */

export interface ChangelogEntry {
  /** YYYY-MM-DD, or YYYY-MM when only the month is known. */
  date: string;
  text: string;
  href?: string;
}

/* ------------------------------------------------------------------ */
/* Ventures                                                            */
/* ------------------------------------------------------------------ */

export type VentureStatus = 'active' | 'exploring' | 'past' | 'placeholder';

export interface Venture {
  name: string;
  description: string;
  role: string;
  href?: string;
  status: VentureStatus;
  /** YYYY-MM */
  since?: string;
}
