# prashantpilla.com

Personal site of [Prashant Reddy Pilla](https://prashantpilla.com): a Software Engineer building **AI systems for finance**. Static export, one content model, no CMS.

## Stack

- Next.js 15 (App Router, `output: 'export'`)
- React 19, TypeScript (strict)
- Tailwind CSS 4
- `next-mdx-remote/rsc` + `gray-matter` for project and writing pages
- GSAP / Lenis for motion; `@react-three/fiber` for the hero
- Node version in `.nvmrc`

## Content model

Copy lives under `content/` and conforms to `content/types.ts`. Pages and structured data render from those files — not from hard-coded strings.

| Path                     | What it is                                            |
| ------------------------ | ----------------------------------------------------- |
| `content/profile.ts`     | Name, tagline, about, facts, socials, open-to         |
| `content/highlights.ts`  | Home "cool stuff" grid                                |
| `content/projects/*.mdx` | Case studies at `/work/[slug]`                        |
| `content/writing/*.mdx`  | Posts at `/writing/[slug]` (empty on purpose for now) |
| `content/research.ts`    | External papers (arXiv)                               |
| `content/ventures.ts`    | Ventures / scouting                                   |
| `content/changelog.ts`   | Dated log                                             |

To add a project: drop an MDX file in `content/projects/`, set `featured: true` if it should appear on the home page, `git push`. Same pattern for a post in `content/writing/`.

## SEO and crawlers

- Canonical URLs, Open Graph / Twitter cards, generated `opengraph-image`
- `sitemap.xml` and `robots.txt` (explicit allow for AI crawlers)
- JSON-LD: `Person`, `WebSite`, `ScholarlyArticle`, `SoftwareSourceCode`, `BlogPosting`
- `/llms.txt` generated at build from the same content modules

## Scripts

```bash
nvm use          # or any Node matching engines in package.json
npm ci
npm run dev      # next dev
npm run build    # static export to out/
npm start        # serve out/
npm run typecheck
npm run lint
npm run format:check
```

## Deploy

Push to `main`. Vercel builds the static export. CI on push and pull request runs typecheck, lint, format check, and build, then asserts `out/` contains `index.html`, `sitemap.xml`, `robots.txt`, `llms.txt`, `resume.pdf`, and JSON-LD.

## License

Source code is MIT. Text and media under `content/` and `public/` are reserved — see `LICENSE`.
