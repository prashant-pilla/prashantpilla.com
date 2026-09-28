'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { profile } from '@content/profile';
import {
  CYCLE_FILTER_EVENT,
  SECTION_IDS,
  SHORTCUTS,
  hasModifier,
  isApplePlatform,
  isEditableTarget,
  isElementInView,
  openExternal,
  scrollToId,
  type PalettePage,
  type PaletteProject,
  type SectionId,
  type ShortcutAction,
} from '@/lib/shortcuts';
import { useTheme } from '@/components/experience/theme/ThemeProvider';

interface ShortcutsContextValue {
  /** Palette open state (owned here so keys, trigger and hint agree). */
  open: boolean;
  page: PalettePage;
  openPalette: (page?: PalettePage) => void;
  closePalette: () => void;
  setOpen: (open: boolean) => void;
  setPage: (page: PalettePage) => void;
  /** Scroll to a home section, navigating to `/` first from other routes. */
  navigateTo: (id: SectionId) => void;
  /** Execute any registered shortcut action. */
  run: (action: ShortcutAction) => void;
  /** Whether to render ⌘ (true) or Ctrl (false). False until mounted. */
  apple: boolean;
  projects: PaletteProject[];
}

const ShortcutsContext = createContext<ShortcutsContextValue | null>(null);

const GITHUB_HREF =
  profile.socials.find((s) => s.platform === 'github')?.href ?? 'https://github.com';

export function ShortcutsProvider({
  projects,
  children,
}: {
  projects: PaletteProject[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { cycleTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [page, setPage] = useState<PalettePage>('root');
  const [apple, setApple] = useState(false);

  useEffect(() => {
    setApple(isApplePlatform());
  }, []);

  const openPalette = useCallback((p: PalettePage = 'root') => {
    setPage(p);
    setOpen(true);
  }, []);

  const closePalette = useCallback(() => setOpen(false), []);

  const isHome = pathname === '/';

  const navigateTo = useCallback(
    (id: SectionId) => {
      if (isHome && scrollToId(id)) return;
      router.push(id === SECTION_IDS.hero ? '/' : `/#${id}`);
    },
    [isHome, router],
  );

  const run = useCallback(
    (action: ShortcutAction) => {
      switch (action.type) {
        case 'section':
          navigateTo(action.id);
          return;
        case 'resume':
          openExternal(profile.resumePath);
          return;
        case 'github':
          openExternal(GITHUB_HREF);
          return;
        case 'cycle-theme':
          cycleTheme();
          return;
        case 'cycle-filter': {
          if (!isHome) {
            router.push(`/#${SECTION_IDS.highlights}`);
            return;
          }
          window.dispatchEvent(new CustomEvent(CYCLE_FILTER_EVENT));
          const el = document.getElementById(SECTION_IDS.highlights);
          if (el && !isElementInView(el)) scrollToId(SECTION_IDS.highlights);
          return;
        }
        case 'palette':
          openPalette('root');
          return;
        case 'help':
          openPalette('shortcuts');
          return;
      }
    },
    [cycleTheme, isHome, navigateTo, openPalette, router],
  );

  /* Global key handling. Refs keep the listener stable across renders. */
  const openRef = useRef(open);
  const runRef = useRef(run);
  useEffect(() => {
    openRef.current = open;
    runRef.current = run;
  }, [open, run]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing || e.repeat) return;

      // Cmd/Ctrl+K toggles from anywhere, including inputs.
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (openRef.current) setOpen(false);
        else openPalette('root');
        return;
      }

      // While the palette is open cmdk + Radix own the keyboard (incl. Esc).
      if (openRef.current) return;
      if (hasModifier(e)) return;
      if (isEditableTarget(e.target)) return;

      const shortcut = SHORTCUTS.find((s) => s.key === e.key);
      if (!shortcut) return;
      e.preventDefault();
      runRef.current(shortcut.action);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openPalette]);

  const value = useMemo<ShortcutsContextValue>(
    () => ({
      open,
      page,
      openPalette,
      closePalette,
      setOpen,
      setPage,
      navigateTo,
      run,
      apple,
      projects,
    }),
    [open, page, openPalette, closePalette, navigateTo, run, apple, projects],
  );

  return <ShortcutsContext.Provider value={value}>{children}</ShortcutsContext.Provider>;
}

export function useShortcuts(): ShortcutsContextValue {
  const ctx = useContext(ShortcutsContext);
  if (!ctx) throw new Error('useShortcuts must be used within <ShortcutsProvider>');
  return ctx;
}
