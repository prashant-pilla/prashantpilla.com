import Image from 'next/image';

interface GradientTileProps {
  /** Any integer; varies the composition so neighbouring tiles differ. */
  seed?: number;
  /** Optional cover image path/URL; rendered on top of the gradient. */
  cover?: string;
  alt?: string;
  className?: string;
}

/**
 * Theme-driven abstract tile. Reads the `--hero-a/b/c` RGB triplets so it
 * recolors live with the theme. Used as the Selected Work hover preview
 * and anywhere a project has no cover image.
 */
export function GradientTile({ seed = 0, cover, alt = '', className }: GradientTileProps) {
  const angle = (seed * 47) % 360;
  const x = 20 + ((seed * 37) % 60);
  const y = 20 + ((seed * 53) % 60);

  return (
    <div
      aria-hidden={cover ? undefined : true}
      className={['relative overflow-hidden bg-bg-elevated', className].filter(Boolean).join(' ')}
      style={{
        backgroundImage: [
          `radial-gradient(60% 70% at ${x}% ${y}%, rgb(var(--hero-a) / 0.85), transparent 70%)`,
          `radial-gradient(50% 60% at ${100 - x}% ${100 - y}%, rgb(var(--hero-c) / 0.9), transparent 70%)`,
          `linear-gradient(${angle}deg, rgb(var(--hero-c) / 0.6), rgb(var(--hero-b) / 0.08))`,
        ].join(', '),
      }}
    >
      {cover ? (
        <Image
          src={cover}
          alt={alt}
          fill
          sizes="(min-width: 768px) 40vw, 90vw"
          className="object-cover"
        />
      ) : null}
    </div>
  );
}
