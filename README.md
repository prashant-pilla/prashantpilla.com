# prashantpilla.com

Personal site of Prashant Pilla: selected work, research, and a changelog. Live at [prashantpilla.com](https://prashantpilla.com).

Pure static export. No server runtime, no database, no CMS: the whole site is data files in `content/` rendered to HTML at build time and served from Vercel's CDN.

## Stack

- Next.js 15 (App Router, `output: 'export'`), React 19, TypeScript 5 (strict)
- Tailwind CSS 4, with the single stylesheet inlined into each page
- MDX via `next-mdx-remote/rsc` + `gray-matter` for case studies and posts
- GSAP + Lenis for the motion layer, `@react-three/fiber` for the hero scene (loaded at idle, never blocks first paint)
- `cmdk` for the command palette (`Ctrl/⌘ K`), plus single-key shortcuts
- Fonts self-hosted at build time through `next/font`

## Content model

Everything a visitor reads lives in `content/` and conforms to the types in [`content/types.ts`](content/types.ts). Components never hard-code copy.

| File | What it drives |
| --- | --- |
| `content/profile.ts` | Hero, About, facts, socials, contact, `openTo`, metadata description |
| `content/projects/*.mdx` | `/work/[slug]` case studies and the Selected Work list (`featured`, `order`) |
| `content/writing/*.mdx` | `/writing/[slug]` posts (`draft: true` hides a post everywhere) |
| `content/research.ts` | Published research cards (About section, `/writing`, JSON-LD) |
| `content/highlights.ts` | The filterable highlights grid (`weight` orders it) |
| `content/ventures.ts` | Ventures section |
| `content/changelog.ts` | `/changelog` and sitemap `lastModified` |

To add a project: create `content/projects/<slug>.mdx` with the frontmatter shape in `ProjectFrontmatter`, set `featured` and `order`, push. Same for a post under `content/writing/`. The loader in [`src/lib/content.ts`](src/lib/content.ts) validates frontmatter and fails the build on a bad file, so a typo cannot ship.

## SEO and machine-readable surfaces

- Canonical URLs, Open Graph and Twitter cards with a generated image (`src/app/opengraph-image.tsx`)
- `sitemap.xml` and `robots.txt` generated from content (`src/app/sitemap.ts`, `src/app/robots.ts`); AI crawlers are allowed explicitly
- schema.org JSON-LD (`Person`, `WebSite`, `ScholarlyArticle`, `SoftwareSourceCode`, `BlogPosting`) built from the same content files in [`src/lib/jsonld.ts`](src/lib/jsonld.ts)
- `/llms.txt` for AI assistants, generated at build from `content/` (`src/app/llms.txt/route.ts`)

## Development

Requires Node 24 (see `.nvmrc`).

```bash
npm ci
npm run dev          # http://localhost:3000
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run build        # static export to out/
npm start            # serve out/ locally
```

CI runs typecheck, lint, and build on every push and pull request. Vercel deploys `main`.

## Accessibility and performance

Targets: Lighthouse 100 for accessibility, best practices, and SEO; Core Web Vitals green on mobile. The motion layer respects `prefers-reduced-motion`, every interactive element has a visible focus state and a touch target of at least 44px, and the hero copy paints in the first frame before any JavaScript runs.

## License

Code is MIT licensed (see [`LICENSE`](LICENSE)). The written content, images, and resume under `content/` and `public/` are © Prashant Reddy Pilla and are not covered by the MIT license.
