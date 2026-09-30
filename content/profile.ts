import type { Profile } from './types';

export const profile: Profile = {
  name: 'Prashant Pilla',
  fullName: 'Prashant Reddy Pilla',
  role: 'Software Engineer',
  tagline: 'AI systems for finance',
  bio: 'I like building systems where new technology has to survive contact with real money and real people.',
  about: [
    'I build AI systems that have to survive contact with real money. Recent work includes production AI for institutional investors at Tribute Labs in New York, scouting early-stage companies for ADIN, and a run of open-source systems: an insurance-claims agent harness where a deterministic controller enforces procedure, Citework for grounded investment memos, and open-verse, an arena for LLM trading agents.',
    'I was born in New Zealand and grew up in Hyderabad. Somewhere between the two I picked up a habit of paying attention to how people from different places think, which is probably why I ended up caring more about who a system is for than what it is made of.',
    'At seventeen I became a certified yoga instructor at an ashram in Quebec. It taught me that discipline is mostly about showing up quietly and often, and that is still how I approach code, research, and the occasional 36-hour hackathon.',
    'I studied computer science at the University of Minnesota, where I published a deep learning paper on forecasting the S&P 500 and spent too many evenings at the Blockchain Club. I am happiest when a problem sits between engineering, product, and the people who have to trust the result.',
  ],
  location: {
    city: 'New York',
    region: 'NY',
    country: 'United States',
    timezone: 'America/New_York',
  },
  cities: ['Auckland', 'Hyderabad', 'Minneapolis', 'New York'],
  languages: ['English', 'Telugu', 'Hindi', 'Urdu', 'Spanish', 'French'],
  facts: [
    {
      label: 'Focus',
      value: 'AI systems for finance: agents, grounded analysis, trading infrastructure',
    },
    {
      label: 'Education',
      value: 'B.S. Computer Science, University of Minnesota',
    },
    {
      label: 'Certifications',
      value:
        'Palantir Foundry Aware Professional; Foundry & AIP Builder Foundations; Yoga Instructor Level I (Sivananda)',
    },
    {
      label: 'Cities',
      value: 'Auckland, Hyderabad, Minneapolis, New York',
    },
    {
      label: 'Languages',
      value: 'English, Telugu, Hindi, Urdu, Spanish, French',
    },
  ],
  socials: [
    {
      platform: 'github',
      label: 'GitHub',
      handle: 'prashant-pilla',
      href: 'https://github.com/prashant-pilla',
    },
    {
      platform: 'linkedin',
      label: 'LinkedIn',
      handle: 'prashant-pilla',
      href: 'https://www.linkedin.com/in/prashant-pilla',
    },
    {
      platform: 'x',
      label: 'X',
      handle: '@abstruderex',
      href: 'https://x.com/abstruderex',
    },
    // Medium returns when the first real post is imported.
    {
      platform: 'email',
      label: 'Email',
      handle: 'pilla146@umn.edu',
      href: 'mailto:pilla146@umn.edu',
    },
  ],
  email: 'pilla146@umn.edu',
  // Interim PDF from the GitHub profile repo until an updated resume lands.
  resumePath: '/resume.pdf',
  greetings: ['Hello', 'నమస్కారం', 'नमस्ते', 'السلام علیکم', 'Hola', 'Bonjour'],
  openTo: ['AI Engineering', 'Forward Deployed Engineering', 'Software Engineering'],
};
