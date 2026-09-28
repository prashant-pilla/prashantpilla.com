interface RotatingBadgeProps {
  items: string[];
  className?: string;
}

/**
 * Dennis-style circular text badge. Pure SVG textPath rotated by a CSS
 * animation (`animate-spin-slow`, defined in styles/components.css).
 * Under prefers-reduced-motion the global rule collapses the animation
 * so the badge simply sits still.
 */
export function RotatingBadge({ items, className }: RotatingBadgeProps) {
  const text = items.map((c) => c.toUpperCase()).join(' · ') + ' · ';
  return (
    <div
      className={['relative size-28 shrink-0 sm:size-32', className].filter(Boolean).join(' ')}
      role="img"
      aria-label={`Cities: ${items.join(', ')}`}
      data-rotating-badge
    >
      <svg
        viewBox="0 0 120 120"
        className="size-full animate-spin-slow text-fg-muted motion-reduce:animate-none"
        aria-hidden="true"
      >
        <defs>
          <path id="badge-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
        </defs>
        <text
          fill="currentColor"
          fontFamily="var(--font-mono)"
          fontSize="9.5"
          letterSpacing="1.8"
          textLength={2 * Math.PI * 44}
          lengthAdjust="spacing"
        >
          <textPath href="#badge-circle" textLength={2 * Math.PI * 44} lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      <span
        aria-hidden="true"
        className="absolute inset-0 m-auto size-2 rounded-pill bg-accent"
        data-badge-dot
      />
    </div>
  );
}
