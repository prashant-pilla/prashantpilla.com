import type { ChangelogEntry } from './types';

/**
 * Newest first. The only dated surface on the site; keep entries short.
 * `YYYY-MM` is used where only the month is known.
 */
export const changelog: ChangelogEntry[] = [
  {
    date: '2026-09-22',
    text: 'Shipped the insurance claims SOP agent harness: a deterministic controller enforces the procedure, the LLM only extracts and phrases.',
    href: 'https://github.com/prashant-pilla/insurance-sop-agent-harness',
  },
  {
    date: '2026-09-18',
    text: 'Published the maintained Gopher Drone Sim repo with a demo video and Docker image.',
    href: 'https://github.com/prashant-pilla/gopher-drone-sim',
  },
  {
    date: '2026-09-08',
    text: 'Released Citework, grounded investment-committee memos where Python does the math and a human approves before prose.',
    href: 'https://github.com/prashant-pilla/citework',
  },
  {
    date: '2026-09-08',
    text: 'Refreshed open-verse: LLM trading agents competing on Alpaca and Binance paper markets.',
    href: 'https://github.com/prashant-pilla/open-verse',
  },
  {
    date: '2026-06',
    text: 'Certified Palantir Foundry Aware Professional and Foundry & AIP Builder Foundations.',
    href: 'https://verify.skilljar.com/c/5ajaegdfz82d',
  },
  {
    date: '2025-11-11',
    text: 'ADIN made its first investment.',
    href: 'https://www.linkedin.com/posts/prashant-pilla_startup-vc-ai-activity-7394083586913701888-_6sl',
  },
  {
    date: '2025-10',
    text: 'Started open-verse, an arena for LLM trading agents on paper markets.',
    href: 'https://github.com/prashant-pilla/open-verse',
  },
  {
    date: '2025-09',
    text: 'Joined Tribute Labs as a Software Engineer and began scouting for ADIN.',
  },
  {
    date: '2025-07',
    text: 'Built the ADIN marketing site (Tribute-UI) in Next.js 15 and Tailwind 4.',
    href: 'https://tribute-ui-alpha.vercel.app',
  },
  {
    date: '2025-05',
    text: 'Colosseum Breakout Hackathon finalist with Tabi.',
    href: 'https://tabi-eight.vercel.app/',
  },
  {
    date: '2025-05',
    text: 'Graduated from the University of Minnesota, B.S. in Computer Science.',
  },
  {
    date: '2025-01-29',
    text: '"Forecasting S&P 500 Using LSTM Models" published on arXiv.',
    href: 'https://arxiv.org/abs/2501.17366',
  },
];

export function getChangelog(): ChangelogEntry[] {
  return [...changelog].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
