import type { Venture } from './types';

/**
 * Ventures, angel work, products. Present from day one so the site reads
 * "engineer and builder." Add entries here; `status: 'placeholder'` items
 * render as an intentionally empty slot (or are hidden) at the UI's
 * discretion.
 */
export const ventures: Venture[] = [
  {
    name: 'ADIN',
    description:
      'Autonomous Deal Investment Network by Tribute Labs. An AI-first, community-powered venture network where scouts source early-stage companies and AI agents run diligence.',
    role: 'Scout',
    href: 'https://www.linkedin.com/company/adinonline',
    status: 'active',
    since: '2025-09',
  },
  // Example of the placeholder slot shape (kept empty on purpose):
  // {
  //   name: 'Next thing',
  //   description: 'TBD',
  //   role: 'Founder',
  //   status: 'placeholder',
  // },
];

export function getVentures(includePlaceholders = false): Venture[] {
  return ventures.filter((v) => includePlaceholders || v.status !== 'placeholder');
}
