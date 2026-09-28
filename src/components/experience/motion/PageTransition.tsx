'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { registerNavigator } from '@/lib/navigation';
import { scrollToElement, scrollToTop } from '@/lib/scroll';
import { emit, motionState } from './bus';
import { TRANSITIONING_CLASS } from './constants';
import { gsap, prefersReducedMotion } from './gsap';

const IN = 0.45;
const OUT = 0.5;
/** If the route never commits (offline, error boundary), reveal anyway. */
const FALLBACK_MS = 4000;

const COVERED = 'inset(0% 0 0% 0)';
const BELOW = 'inset(100% 0 0% 0)';
const ABOVE = 'inset(0% 0 100% 0)';

function normalizePath(p: string): string {
  return p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p;
}

/**
 * Cinematic cut between routes. A single panel in `--bg-elevated` slices
 * up from the bottom (clip-path), the route is pushed underneath it, and
 * once the new pathname commits the panel continues off the top. One cut,
 * nothing overlapping.
 *
 * Interception happens in a capturing `click` listener on `document`, so
 * every internal <a>/<Link> gets the cut without wrapping; shortcuts and
 * the palette go through `navigateWithTransition`. Same-page hash links
 * become smooth scrolls. Back/forward (popstate) gets no curtain: the
 * pathname changes with nothing pending and we just announce `page:enter`.
 * Under reduced motion the handler declines and Next navigates natively.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const pending = useRef<string | null>(null);
  const fallback = useRef<number | null>(null);
  const first = useRef(true);
  const revealRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const html = document.documentElement;
    const el = panel.current;
    if (!el) return;

    const clearFallback = () => {
      if (fallback.current) window.clearTimeout(fallback.current);
      fallback.current = null;
    };

    const reveal = () => {
      if (!pending.current) return;
      clearFallback();
      pending.current = null;
      motionState.transitionPending = false;
      emit('page:enter', { pathname: normalizePath(window.location.pathname), via: 'transition' });
      gsap.to(el, {
        clipPath: ABOVE,
        duration: OUT,
        ease: 'power4.inOut',
        overwrite: true,
        onComplete: () => {
          gsap.set(el, { clipPath: BELOW, visibility: 'hidden' });
          html.classList.remove(TRANSITIONING_CLASS);
        },
      });
    };
    revealRef.current = reveal;

    const start = (href: string): boolean => {
      if (prefersReducedMotion() || pending.current) return false;
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return false;
      }
      if (url.origin !== window.location.origin) return false;

      const samePath = normalizePath(url.pathname) === normalizePath(window.location.pathname);
      if (samePath) {
        // Hash-only: smooth scroll, no cut.
        const id = decodeURIComponent(url.hash.slice(1));
        const target = id ? document.getElementById(id) : null;
        if (id && !target) return false;
        if (target) scrollToElement(target);
        else scrollToTop();
        window.history.replaceState(window.history.state, '', url.hash || url.pathname);
        return true;
      }

      const next = url.pathname + url.search + url.hash;
      pending.current = next;
      motionState.transitionPending = true;
      emit('page:leave', { href: next });
      html.classList.add(TRANSITIONING_CLASS);
      router.prefetch(url.pathname);

      gsap.set(el, { clipPath: BELOW, visibility: 'visible' });
      gsap.to(el, {
        clipPath: COVERED,
        duration: IN,
        ease: 'power4.inOut',
        overwrite: true,
        onComplete: () => {
          router.push(next);
          fallback.current = window.setTimeout(reveal, FALLBACK_MS);
        },
      });
      return true;
    };

    registerNavigator(start);

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as Element | null;
      const a = target?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a) return;
      if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      if (a.hasAttribute('data-native')) return;
      const href = a.getAttribute('href') ?? '';
      if (!href || /^(https?:|mailto:|tel:|\/\/)/i.test(href)) return;
      if (start(href)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('click', onClick, true);

    return () => {
      registerNavigator(null);
      revealRef.current = null;
      document.removeEventListener('click', onClick, true);
      clearFallback();
    };
  }, [router]);

  /* The route committed: reset scroll, lift the panel, announce the page. */
  useEffect(() => {
    if (first.current) {
      first.current = false;
      emit('page:enter', { pathname, via: 'initial' });
      return;
    }
    if (!pending.current) {
      emit('page:enter', { pathname, via: 'history' });
      return;
    }
    const hasHash = pending.current.includes('#');
    if (!hasHash) scrollToTop({ immediate: true });
    // Give the browser a beat to settle its own hash scroll before lifting.
    const id = window.setTimeout(() => revealRef.current?.(), hasHash ? 120 : 40);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return (
    <div
      ref={panel}
      aria-hidden="true"
      data-pp-transition
      className="fixed inset-0 z-(--z-transition) bg-bg-elevated"
      style={{ clipPath: BELOW, visibility: 'hidden' }}
    >
      <div className="absolute inset-x-0 bottom-0 h-px bg-accent/60" />
    </div>
  );
}
