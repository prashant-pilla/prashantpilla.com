'use client';

import { useShortcuts } from '@/components/experience/shortcuts/ShortcutsProvider';

/**
 * Compact floating button that opens the command palette on touch
 * devices, where the keyboard shortcuts and the footer hint bar are
 * irrelevant. Visibility is CSS-only (`pointer-coarse:`), so the server
 * and client markup match and there is no hydration flicker. Sits
 * directly above the ThemeSwitcher in the bottom-right dock.
 */
export function PaletteTrigger() {
  const { open, openPalette } = useShortcuts();
  return (
    <button
      type="button"
      onClick={() => openPalette('root')}
      aria-label="Open menu"
      aria-haspopup="dialog"
      aria-expanded={open}
      data-pp-palette-trigger
      className="fixed right-(--pp-dock-right) bottom-(--pp-dock-stack) z-(--z-overlay) hidden h-9 items-center gap-2 rounded-pill border border-border bg-bg-elevated/85 px-3.5 font-mono text-micro tracking-mono text-fg uppercase shadow-[0_8px_30px_-12px_rgb(0_0_0/0.5)] backdrop-blur-md transition-colors duration-(--dur-fast) ease-out-expo hover:border-accent/50 active:bg-accent/12 pointer-coarse:inline-flex"
    >
      <span aria-hidden="true" className="text-accent">
        ›
      </span>
      Menu
    </button>
  );
}
