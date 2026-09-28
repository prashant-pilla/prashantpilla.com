'use client';

import { useCallback, useRef, useState } from 'react';
import {
  THEMES,
  THEME_DESCRIPTIONS,
  THEME_LABELS,
  THEME_SWATCHES,
  type ThemeId,
} from '@/lib/theme';
import { useTheme } from './ThemeProvider';

/**
 * Five swatch dots, fixed bottom-right. Radiogroup semantics with roving
 * tabindex: Tab lands on the active swatch, arrows move + select,
 * Home/End jump. Swatches are painted from THEME_SWATCHES (mirrors
 * tokens.css) so each dot shows its own mood regardless of the active
 * theme. The active dot is ringed with the live `--accent`.
 *
 * Layout note: PaletteTrigger stacks directly above this on touch
 * devices; see --pp-dock-* in globals.css for the shared offsets.
 */
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [hovered, setHovered] = useState<ThemeId | null>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  const focusAndSelect = useCallback(
    (next: ThemeId) => {
      setTheme(next);
      const el = groupRef.current?.querySelector<HTMLButtonElement>(`[data-theme-id="${next}"]`);
      el?.focus();
    },
    [setTheme],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const i = THEMES.indexOf(theme);
    let next: ThemeId | null = null;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = THEMES[(i + 1) % THEMES.length];
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = THEMES[(i - 1 + THEMES.length) % THEMES.length];
        break;
      case 'Home':
        next = THEMES[0];
        break;
      case 'End':
        next = THEMES[THEMES.length - 1];
        break;
      default:
        return;
    }
    e.preventDefault();
    focusAndSelect(next);
  };

  const shown = hovered ?? theme;

  return (
    <div
      className="group/switcher pointer-events-none fixed right-(--pp-dock-right) bottom-(--pp-dock-bottom) z-(--z-overlay) flex items-center gap-2"
      data-pp-theme-switcher
    >
      {/* Label: appears on hover / focus-within, names the hovered or active theme. */}
      <span
        aria-hidden="true"
        className="pointer-events-none rounded-pill border border-border bg-bg-elevated/85 px-2.5 py-1 font-mono text-micro tracking-mono text-fg-muted uppercase opacity-0 backdrop-blur-md transition-opacity duration-(--dur-fast) ease-out-expo select-none group-focus-within/switcher:opacity-100 group-hover/switcher:opacity-100"
      >
        {THEME_LABELS[shown]}
      </span>

      <div
        ref={groupRef}
        role="radiogroup"
        aria-label="Site theme"
        onKeyDown={onKeyDown}
        onMouseLeave={() => setHovered(null)}
        className="pointer-events-auto flex items-center gap-1.5 rounded-pill border border-border bg-bg-elevated/85 p-1.5 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.5)] backdrop-blur-md"
      >
        {THEMES.map((id) => {
          const active = id === theme;
          const sw = THEME_SWATCHES[id];
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${THEME_LABELS[id]} theme. ${THEME_DESCRIPTIONS[id]}`}
              title={THEME_LABELS[id]}
              tabIndex={active ? 0 : -1}
              data-theme-id={id}
              onClick={() => setTheme(id)}
              onMouseEnter={() => setHovered(id)}
              onFocus={() => setHovered(id)}
              onBlur={() => setHovered(null)}
              className="relative grid size-6 cursor-pointer place-items-center rounded-pill outline-none focus-visible:outline-none"
            >
              <span
                aria-hidden="true"
                className="block size-3.5 rounded-pill border transition-transform duration-(--dur-fast) ease-out-expo group-hover/switcher:scale-100 hover:scale-110 motion-reduce:transition-none"
                style={{
                  background: `linear-gradient(135deg, ${sw.accent} 0 50%, ${sw.bg} 50% 100%)`,
                  borderColor: active ? 'transparent' : 'var(--border)',
                  boxShadow: active
                    ? '0 0 0 2px var(--bg-elevated), 0 0 0 3.5px var(--accent)'
                    : 'none',
                }}
              />
              {/* Focus ring for keyboard users (separate from the active ring). */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-pill ring-accent/60 ring-offset-2 ring-offset-bg-elevated [button:focus-visible>&]:ring-2"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
