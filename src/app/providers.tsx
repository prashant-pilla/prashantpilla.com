import { getProjects } from '@/lib/content';
import { MotionProvider } from '@/components/experience/motion/MotionProvider';
import { MotionScript } from '@/components/experience/motion/MotionScript';
import { Preloader } from '@/components/experience/motion/Preloader';
import { CommandPalette } from '@/components/experience/palette/CommandPalette';
import { PaletteTrigger } from '@/components/experience/palette/PaletteTrigger';
import { ShortcutHint } from '@/components/experience/shortcuts/ShortcutHint';
import { ShortcutsProvider } from '@/components/experience/shortcuts/ShortcutsProvider';
import { ThemeProvider } from '@/components/experience/theme/ThemeProvider';
import { ThemeScript } from '@/components/experience/theme/ThemeScript';
import { ThemeSwitcher } from '@/components/experience/theme/ThemeSwitcher';

/**
 * Experience-layer providers. SERVER component on purpose: `getProjects()`
 * reads the filesystem at build time, and only the tiny serialisable
 * subset the palette needs crosses into the client tree.
 *
 * Tree:
 *   <ThemeScript/>                      inline anti-flash bootstrap
 *   <MotionScript/>                     inline `js` / preload-curtain bootstrap
 *   <ThemeProvider>                     data-theme on <html> as the store
 *     <ShortcutsProvider projects>      global keys + palette open state
 *       <Preloader/>                    first-visit curtain; first in <body>
 *                                       so its server markup is in the first paint
 *       {children}
 *       <CommandPalette projects/>      Cmd/Ctrl+K, /, ?
 *       <ThemeSwitcher/>                bottom-right swatches
 *       <PaletteTrigger/>               touch-only floating "Menu"
 *       <ShortcutHint/>                 portals into #shortcut-hint
 *       <MotionProvider/>               Lenis, reveals, cursor, cuts
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const projects = getProjects().map((p) => ({
    title: p.title,
    slug: p.slug,
    summary: p.summary,
  }));

  return (
    <>
      <ThemeScript />
      <MotionScript />
      <ThemeProvider>
        <ShortcutsProvider projects={projects}>
          <Preloader />
          {children}
          <CommandPalette projects={projects} />
          <ThemeSwitcher />
          <PaletteTrigger />
          <ShortcutHint />
          <MotionProvider />
        </ShortcutsProvider>
      </ThemeProvider>
    </>
  );
}
