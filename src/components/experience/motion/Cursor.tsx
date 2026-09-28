'use client';

import { useEffect, useRef } from 'react';
import { CURSOR_CLASS } from './constants';
import { MQ, gsap } from './gsap';

type CursorState = 'default' | 'link' | 'view' | 'drag' | 'copy';

const LABEL: Partial<Record<CursorState, string>> = { view: 'View', drag: 'Drag', copy: 'Copy' };
const INTERACTIVE =
  'a[href], button, [role="button"], input, textarea, select, summary, label, [tabindex]:not([tabindex="-1"])';

function isState(v: string | undefined): v is CursorState {
  return v === 'link' || v === 'view' || v === 'drag' || v === 'copy';
}

/**
 * Dot + ring cursor with contextual states read from the nearest
 * `[data-cursor]` ancestor (`view` on work rows, `drag` on the hero canvas,
 * `copy` on the copy-email button); plain links and buttons get the
 * `link` grow. The native cursor is hidden only while the custom one is
 * active (html.pp-cursor), so nothing breaks if the pointer never moves.
 * Disabled on touch/coarse pointers and under reduced motion; hidden while
 * the command palette is open.
 */
export function Cursor({ hidden = false }: { hidden?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef(hidden);
  const applyHidden = useRef<((h: boolean) => void) | null>(null);

  useEffect(() => {
    hiddenRef.current = hidden;
    applyHidden.current?.(hidden);
  }, [hidden]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();

    mm.add(`${MQ.motion} and ${MQ.fine}`, () => {
      const html = document.documentElement;
      const dot = el.querySelector<HTMLElement>('[data-cursor-dot]');
      const ring = el.querySelector<HTMLElement>('[data-cursor-ring]');
      const label = el.querySelector<HTMLElement>('[data-cursor-label]');
      if (!dot || !ring || !label) return;

      let active = false;
      let visible = false;
      let state: CursorState = 'default';

      gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });
      const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
      const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
      const ringX = gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3' });
      const ringY = gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3' });

      const show = () => {
        if (visible || hiddenRef.current) return;
        visible = true;
        html.classList.add(CURSOR_CLASS);
        gsap.to([dot, ring], { opacity: 1, duration: 0.3, overwrite: 'auto' });
      };
      const hide = () => {
        if (!visible) return;
        visible = false;
        html.classList.remove(CURSOR_CLASS);
        gsap.to([dot, ring], { opacity: 0, duration: 0.25, overwrite: 'auto' });
      };
      applyHidden.current = (h) => {
        if (h) hide();
        else if (active) show();
      };

      const applyState = (next: CursorState) => {
        if (next === state) return;
        state = next;
        el.dataset.state = next;
        const text = LABEL[next];
        label.textContent = text ?? '';
        const labelled = Boolean(text);
        gsap.to(ring, {
          width: labelled ? 84 : next === 'link' ? 48 : 28,
          height: labelled ? 84 : next === 'link' ? 48 : 28,
          backgroundColor: labelled ? 'var(--fg)' : 'rgba(0,0,0,0)',
          borderColor: labelled ? 'var(--fg)' : next === 'link' ? 'var(--accent)' : 'var(--fg)',
          duration: 0.4,
          ease: 'expo.out',
          overwrite: 'auto',
        });
        gsap.to(dot, {
          scale: labelled ? 0 : next === 'link' ? 0.5 : 1,
          duration: 0.3,
          ease: 'expo.out',
          overwrite: 'auto',
        });
        gsap.to(label, { opacity: labelled ? 1 : 0, duration: 0.25, overwrite: 'auto' });
      };

      const resolveState = (target: Element | null): CursorState => {
        if (!target) return 'default';
        const tagged = target.closest<HTMLElement>('[data-cursor]');
        const v = tagged?.dataset.cursor;
        if (isState(v)) return v;
        return target.closest(INTERACTIVE) ? 'link' : 'default';
      };

      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') {
          if (active) {
            active = false;
            hide();
          }
          return;
        }
        if (!active) {
          active = true;
          gsap.set([dot, ring], { x: e.clientX, y: e.clientY });
        }
        dotX(e.clientX);
        dotY(e.clientY);
        ringX(e.clientX);
        ringY(e.clientY);
        show();
        applyState(resolveState(e.target as Element | null));
      };
      const onOut = (e: MouseEvent) => {
        if (e.relatedTarget === null) hide();
      };
      const onDown = () =>
        active && gsap.to(ring, { scale: 0.85, duration: 0.15, overwrite: 'auto' });
      const onUp = () => active && gsap.to(ring, { scale: 1, duration: 0.3, overwrite: 'auto' });

      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('mouseout', onOut);
      window.addEventListener('pointerdown', onDown, { passive: true });
      window.addEventListener('pointerup', onUp, { passive: true });
      window.addEventListener('blur', hide);

      return () => {
        window.removeEventListener('pointermove', onMove);
        document.removeEventListener('mouseout', onOut);
        window.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('blur', hide);
        html.classList.remove(CURSOR_CLASS);
        applyHidden.current = null;
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={root}
      aria-hidden="true"
      data-pp-cursor
      data-state="default"
      className="pointer-events-none fixed inset-0 z-(--z-cursor)"
    >
      <div
        data-cursor-ring
        className="absolute top-0 left-0 grid size-7 place-items-center rounded-pill border border-fg opacity-0"
        style={{ backgroundColor: 'rgba(0,0,0,0)' }}
      >
        <span
          data-cursor-label
          className="font-mono text-micro tracking-mono text-bg uppercase opacity-0 select-none"
        />
      </div>
      <div data-cursor-dot className="absolute top-0 left-0 size-1.5 rounded-pill bg-fg opacity-0" />
    </div>
  );
}
