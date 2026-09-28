/**
 * Navigation registry. The page-transition component registers a handler
 * that plays the cinematic cut before pushing the route; callers that
 * would otherwise use `router.push` (shortcuts, palette) go through
 * `navigateWithTransition` first and fall back to a plain push when no
 * handler is registered or when it declines (reduced motion, same page).
 */

export type TransitionNavigator = (href: string) => boolean;

let handler: TransitionNavigator | null = null;

export function registerNavigator(next: TransitionNavigator | null): void {
  handler = next;
}

/** Returns true when the transition layer took over the navigation. */
export function navigateWithTransition(href: string): boolean {
  if (!handler) return false;
  try {
    return handler(href);
  } catch {
    return false;
  }
}
