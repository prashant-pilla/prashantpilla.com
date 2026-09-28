interface ArrowProps {
  /** `ne` = external link, `e` = forward, `w` = back, `s` = scroll down. */
  direction?: 'ne' | 'e' | 'w' | 's';
  className?: string;
}

const ROTATION: Record<NonNullable<ArrowProps['direction']>, string> = {
  e: 'rotate-0',
  ne: '-rotate-45',
  w: 'rotate-180',
  s: 'rotate-90',
};

/** Tiny stroke arrow used for links. Decorative; parents carry the label. */
export function Arrow({ direction = 'e', className }: ArrowProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={['inline-block shrink-0', ROTATION[direction], className]
        .filter(Boolean)
        .join(' ')}
    >
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
    </svg>
  );
}
