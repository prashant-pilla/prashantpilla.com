import { padIndex } from '@/lib/site';
import { tileGradient } from './GradientTile';

interface ProjectPosterProps {
  title: string;
  /** Short phrase shown large; falls back to the title. */
  tagline?: string;
  /** 1-based position in the Selected Work list. */
  index: number;
  year: number;
  className?: string;
}

/* Deterministic PRNG so the constellation is identical on server and client. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 400;
const H = 300;
const POINTS = 22;
const NEIGHBOURS = 2;

interface Node {
  x: number;
  y: number;
  r: number;
}

/** A small seeded node graph, echoing the hero field, weighted to the right. */
function constellation(seed: number): { nodes: Node[]; edges: [Node, Node][] } {
  const rand = mulberry32(seed * 7919 + 17);
  const nodes: Node[] = Array.from({ length: POINTS }, () => {
    // Bias x toward the right two thirds so the tagline on the left stays clear.
    const x = W * (0.3 + 0.68 * Math.sqrt(rand()));
    const y = H * (0.08 + 0.72 * rand());
    const hub = rand() < 0.18;
    return { x, y, r: hub ? 3.2 : 1.4 + rand() * 0.8 };
  });

  const edges: [Node, Node][] = [];
  const seen = new Set<string>();
  nodes.forEach((a, i) => {
    const near = nodes
      .map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }))
      .filter((n) => n.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, NEIGHBOURS);
    for (const n of near) {
      const key = i < n.j ? `${i}-${n.j}` : `${n.j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push([a, nodes[n.j]]);
    }
  });
  return { nodes, edges };
}

/**
 * Designed cover for a project: theme gradient, a seeded constellation,
 * index and year in mono, and the tagline in serif. Renders identically
 * on the server; sizes with its container via `cqw` units so the same
 * component works as the 22rem hover tile and a full-width header.
 */
export function ProjectPoster({ title, tagline, index, year, className }: ProjectPosterProps) {
  const { nodes, edges } = constellation(index);
  const phrase = tagline ?? title;

  return (
    <div
      aria-hidden="true"
      className={['@container relative overflow-hidden bg-bg-elevated text-fg', className]
        .filter(Boolean)
        .join(' ')}
      style={{ backgroundImage: tileGradient(index) }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        style={{
          maskImage: 'radial-gradient(70% 80% at 70% 40%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(70% 80% at 70% 40%, black 30%, transparent 100%)',
        }}
      >
        <g stroke="rgb(var(--hero-b) / 0.28)" strokeWidth="0.6">
          {edges.map(([a, b], i) => (
            <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
          ))}
        </g>
        <g fill="rgb(var(--hero-b) / 0.9)">
          {nodes.map((n, i) => (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill={n.r > 3 ? 'var(--accent)' : undefined}
            />
          ))}
        </g>
      </svg>

      {/* Legibility wash behind the copy. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(180deg, transparent 40%, rgb(from var(--bg) r g b / 0.45) 100%)',
        }}
      />

      <div className="relative flex h-full flex-col justify-between p-[max(1.25rem,4cqw)]">
        <div className="flex items-baseline justify-between font-mono text-[max(0.6875rem,2.4cqw)] tracking-mono uppercase">
          <span>{padIndex(index)}</span>
          <span>{year}</span>
        </div>
        <div>
          <p className="font-serif text-[length:clamp(1.5rem,9cqw,4.5rem)] leading-[0.98] tracking-display text-balance">
            {phrase}
          </p>
          <p className="mt-[max(0.5rem,1.6cqw)] font-mono text-[max(0.6875rem,2.2cqw)] tracking-mono text-fg-muted uppercase">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}
