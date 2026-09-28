import { THEME_INIT_SCRIPT } from '@/lib/theme';

/**
 * Anti-flash bootstrap. Rendered as the first child of <body> (via
 * Providers) so the inline script executes while the document is still
 * parsing, before React hydrates and before anything paints. It reads the
 * persisted theme and sets `data-theme` on <html>; `<html>` therefore
 * carries `suppressHydrationWarning` in layout.tsx.
 *
 * Server component: no client bundle, no hooks.
 */
export function ThemeScript() {
  return (
    <script
      id="pp-theme-init"
      // Trusted constant string from src/lib/theme.ts, no user input.
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  );
}
