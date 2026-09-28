'use client';

/**
 * Minimal typed event bus + shared flags for the motion layer. Components
 * are siblings (preloader, transitions, reveals, hero) and only need a few
 * signals to sequence themselves:
 *
 *   preloader:done  the first-load curtain has started lifting
 *   page:leave      a cinematic cut has begun covering the page
 *   page:enter      a page is (about to be) visible: after hydration, after
 *                   a transition arrives, or after back/forward
 */

export type PageEnterVia = 'initial' | 'transition' | 'history';

interface Events {
  'preloader:done': undefined;
  'page:leave': { href: string };
  'page:enter': { pathname: string; via: PageEnterVia };
}

type Listener<K extends keyof Events> = (payload: Events[K]) => void;

// Erased to a loose map internally; the public `on`/`emit` signatures stay typed.
const listeners = new Map<keyof Events, Set<(payload: never) => void>>();

export const motionState = {
  /** True once the preloader finished or was skipped. */
  preloaderDone: false,
  /** True between a cut starting and the new page being revealed. */
  transitionPending: false,
};

export function on<K extends keyof Events>(event: K, cb: Listener<K>): () => void {
  let set = listeners.get(event);
  if (!set) {
    set = new Set();
    listeners.set(event, set);
  }
  const entry = cb as (payload: never) => void;
  set.add(entry);
  return () => {
    set.delete(entry);
  };
}

export function once<K extends keyof Events>(event: K, cb: Listener<K>): () => void {
  const off = on(event, (payload) => {
    off();
    cb(payload);
  });
  return off;
}

export function emit<K extends keyof Events>(event: K, payload: Events[K]): void {
  const set = listeners.get(event);
  if (!set) return;
  for (const cb of Array.from(set)) (cb as Listener<K>)(payload);
}

/** Runs `cb` when the preloader is done (immediately if it already is). */
export function onPreloaderDone(cb: () => void): () => void {
  if (motionState.preloaderDone) {
    cb();
    return () => {};
  }
  return once('preloader:done', cb);
}

export function finishPreloader(): void {
  if (motionState.preloaderDone) return;
  motionState.preloaderDone = true;
  emit('preloader:done', undefined);
}
