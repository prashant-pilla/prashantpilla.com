import type { Highlight } from './types';

/**
 * Curated, non-chronological. `weight` controls order (higher first).
 * Builds and research lead; life items are interleaved so personality
 * shows up early instead of clumping at the bottom.
 */
export const highlights: Highlight[] = [
  {
    id: 'lstm-sp500',
    kind: 'research',
    title: 'Forecast the S&P 500 with LSTMs at 96.41% accuracy',
    blurb:
      'Compared ARIMA and LSTM networks on a decade of index data. The feature-free LSTM won with an MAE of 175.9.',
    weight: 100,
    href: 'https://arxiv.org/abs/2501.17366',
    meta: 'arXiv · Jan 2025',
  },
  {
    id: 'colosseum-finalist',
    kind: 'build',
    title: 'Colosseum Breakout Hackathon finalist',
    blurb:
      'Tabi: Solana payments, group bill splitting, and an AI advisor on your wallet, shipped as a working MVP in under 48 hours.',
    weight: 95,
    href: 'https://tabi-eight.vercel.app/',
    meta: 'Solana · May 2025',
  },
  {
    id: 'born-nz',
    kind: 'life',
    title: 'Born in New Zealand, raised in Hyderabad',
    blurb: 'Fifteen-plus countries so far, chasing culture, people, and perspective.',
    weight: 90,
    meta: 'Auckland → Hyderabad → Minneapolis → New York',
  },
  {
    id: 'adin-first-investment',
    kind: 'venture',
    title: 'First investment at ADIN',
    blurb:
      'Two months into scouting for the Autonomous Deal Investment Network, the AI-powered venture engine backed its first company.',
    weight: 85,
    href: 'https://www.linkedin.com/posts/prashant-pilla_startup-vc-ai-activity-7394083586913701888-_6sl',
    meta: 'Nov 2025',
  },
  {
    id: 'gopher-drone-sim',
    kind: 'build',
    title: 'A campus drone delivery sim in C++ and Three.js',
    blurb:
      'Priority queues, a shared wind field, leader/helper battery handoff, and A* routing over the UMN map. Dockerized.',
    weight: 80,
    href: 'https://youtu.be/94SR9GqrnaE',
    meta: 'C++ · Three.js · Docker',
  },
  {
    id: 'yoga-17',
    kind: 'life',
    title: 'Certified yoga instructor at seventeen',
    blurb: 'Sivananda Ashram Yoga Camp, Quebec. One of the youngest internationally certified.',
    weight: 75,
    meta: 'Jul 2022',
  },
  {
    id: 'palantir-foundry',
    kind: 'build',
    title: 'Palantir Foundry certified, twice',
    blurb:
      'Foundry Aware Professional and Foundry & AIP Builder Foundations: ontology-driven apps, enterprise data modeling, operational workflows.',
    weight: 70,
    href: 'https://verify.skilljar.com/c/5ajaegdfz82d',
    meta: 'Jun 2026',
  },
  {
    id: 'sop-agent-harness',
    kind: 'build',
    title: 'An insurance-claims agent where the LLM cannot skip a step',
    blurb:
      'A deterministic controller owns the procedure; the model only extracts and phrases. Twelve test suites, CI, Docker.',
    weight: 88,
    href: 'https://github.com/prashant-pilla/insurance-sop-agent-harness',
    meta: 'Python · FastAPI · Sep 2026',
  },
  {
    id: 'six-languages',
    kind: 'life',
    title: 'Six languages, counting English',
    blurb: 'Telugu, Hindi, Urdu, Spanish, and French. The preloader says hello in all of them.',
    weight: 60,
  },
  {
    id: 'deans-list',
    kind: 'research',
    title: "Dean's List, three years running",
    blurb: 'University of Minnesota, 2022 through 2024, alongside the MLK and MCAE scholarships.',
    weight: 55,
    meta: 'UMN · 2022–2024',
  },
  {
    id: 'umn-blockchain-club',
    kind: 'venture',
    title: 'Outreach Coordinator, UMN Blockchain Club',
    blurb:
      'Ran events and workshops and built industry partnerships to bring blockchain to the wider campus.',
    weight: 50,
    href: 'https://www.linkedin.com/company/umnblockchain',
    meta: '2024–2025',
  },
  {
    id: 'mlk-scholar',
    kind: 'life',
    title: 'MLK Scholar',
    blurb: 'University of Minnesota. Also a CSE and CLA Student Ambassador on 10+ student panels.',
    weight: 45,
    meta: 'UMN',
  },
];

/** Sorted copy, highest weight first. */
export function getHighlights(): Highlight[] {
  return [...highlights].sort((a, b) => b.weight - a.weight);
}
