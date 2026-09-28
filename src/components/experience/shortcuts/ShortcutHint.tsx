'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { SHORTCUTS, SHORTCUT_HINT_TARGET_ID, modKeyLabel } from '@/lib/shortcuts';
import { useShortcuts } from './ShortcutsProvider';

const HINTS = SHORTCUTS.filter((s) => s.hint);

/**
 * Paradigm-style mono hint bar: `⌘K menu · w work · h highlights · t theme · ? all`.
 *
 * The footer is server-rendered by the page (not ours), so we portal into
 * `#shortcut-hint` once it exists. A MutationObserver on <body> keeps the
 * target current across client-side navigations (the footer element is
 * unmounted/remounted when the route changes). Hidden on coarse pointers,
 * where PaletteTrigger takes over.
 */
export function ShortcutHint() {
  const pathname = usePathname();
  const { apple, openPalette } = useShortcuts();
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const find = () => document.getElementById(SHORTCUT_HINT_TARGET_ID);
    let current = find();
    setTarget(current);

    const observer = new MutationObserver(() => {
      const next = find();
      if (next !== current) {
        current = next;
        setTarget(next);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  if (!target) return null;

  const mod = modKeyLabel(apple);

  return createPortal(
    <div
      data-pp-shortcut-hint
      className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-micro tracking-mono text-fg-muted normal-case select-none pointer-coarse:hidden"
      aria-label="Keyboard shortcuts"
    >
      <button
        type="button"
        onClick={() => openPalette('root')}
        className="inline-flex items-center gap-1.5 rounded-xs normal-case transition-colors duration-(--dur-fast) hover:text-fg"
      >
        <Key>{mod}K</Key>
        <span>menu</span>
      </button>
      {HINTS.map((s) => (
        <span key={s.key} className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="text-fg-muted/50">
            ·
          </span>
          <Key>{s.key}</Key>
          <span>{s.label.toLowerCase()}</span>
        </span>
      ))}
    </div>,
    target,
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-xs border border-border px-1.5 py-px font-mono text-micro text-fg">
      {children}
    </kbd>
  );
}
