'use client';

/**
 * Hero3D — drop-in generative node-field for the hero section.
 *
 * Renders a wrapper that fills its (positioned) parent. On the server and
 * during the first client paint it shows `fallback`; once the intro
 * curtain is gone and the main thread is idle it runs the capability
 * checks in `@/lib/gpu` and either mounts the WebGL scene (code-split,
 * fades in over the fallback) or keeps the fallback.
 *
 *   <section className="relative h-screen">
 *     <Hero3D fallback={<HeroBackdrop />} />
 *     <div className="relative z-10 pointer-events-none">…copy…</div>
 *   </section>
 *
 * `data-hero-mode` is "3d" once the scene is chosen, "static" otherwise
 * (including while the probe is still running). `data-hero-reason` lists
 * why a device was sent to the static path.
 */
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { MIN_PROBE_FPS, assessGpu, probeFrameRate, type GpuTier } from '@/lib/gpu';
import { onPreloaderDone } from '@/components/experience/motion/bus';
import { LazyHeroScene, preloadHeroScene } from './Hero3D.lazy';
import { FADE_IN_MS, FPS_PROBE_MS } from './scene/config';

/** Upper bound on how long we wait for an idle slot before probing anyway. */
const IDLE_TIMEOUT_MS = 1500;

/**
 * Runs `cb` once the intro curtain is gone and the main thread has an idle
 * slot. Fetching and evaluating three.js (~900 KB of script) during the
 * initial load would compete with hydration, the preloader timeline and
 * the hero reveal; the static backdrop covers the gap and the scene
 * cross-fades in when it is ready.
 */
function whenReadyForScene(cb: () => void): () => void {
  let cancelled = false;
  let idleId: number | undefined;
  let timerId: number | undefined;
  const offPreloader = onPreloaderDone(() => {
    if (cancelled) return;
    // Safari has no requestIdleCallback; a short timeout is the fallback.
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(() => !cancelled && cb(), { timeout: IDLE_TIMEOUT_MS });
    } else {
      timerId = window.setTimeout(() => !cancelled && cb(), 250);
    }
  });
  return () => {
    cancelled = true;
    offPreloader();
    if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
    if (timerId !== undefined) window.clearTimeout(timerId);
  };
}

export interface Hero3DProps {
  /** Appended to the default `absolute inset-0 overflow-hidden`. */
  className?: string;
  /** Static poster shown on the server, while loading, and on weak devices. */
  fallback?: ReactNode;
  /** Global multiplier for drift, pointer pull and drag response. Default 1. */
  intensity?: number;
}

type Phase = 'pending' | '3d' | 'static';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function Hero3D({ className, fallback, intensity = 1 }: Hero3DProps) {
  const [phase, setPhase] = useState<Phase>('pending');
  const [reason, setReason] = useState<string | undefined>(undefined);
  const [tier, setTier] = useState<GpuTier>('mid');
  const [ready, setReady] = useState(false);
  const [fallbackMounted, setFallbackMounted] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const decide = () => {
      const verdict = assessGpu();
      if (verdict.mode === 'static') {
        setReason(verdict.reasons.join(' '));
        setPhase('static');
        return;
      }
      setTier(verdict.tier);
      void preloadHeroScene();
      void probeFrameRate(FPS_PROBE_MS).then((fps) => {
        if (cancelled) return;
        if (fps !== null && fps < MIN_PROBE_FPS) {
          setReason(`fps:${Math.round(fps)}`);
          setPhase('static');
        } else {
          setPhase('3d');
        }
      });
    };
    const cancelWait = whenReadyForScene(decide);

    // Live downgrade if the visitor turns on reduced motion mid-session.
    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    const onMediaChange = () => {
      if (media.matches) {
        setReason('prefers-reduced-motion');
        setPhase('static');
      }
    };
    media.addEventListener('change', onMediaChange);

    return () => {
      cancelled = true;
      cancelWait();
      media.removeEventListener('change', onMediaChange);
    };
  }, []);

  // Once the canvas is ready, cross-fade and then unmount the fallback.
  useEffect(() => {
    if (!ready) return;
    const id = window.setTimeout(() => setFallbackMounted(false), FADE_IN_MS + 50);
    return () => window.clearTimeout(id);
  }, [ready]);

  const handleReady = useCallback(() => setReady(true), []);
  const handleFail = useCallback((why: string) => {
    setReason(why);
    setReady(false);
    setFallbackMounted(true);
    setPhase('static');
  }, []);

  const is3d = phase === '3d';
  const showFallback = fallback !== undefined && (!is3d || fallbackMounted);
  const fade = `opacity ${FADE_IN_MS}ms cubic-bezier(0.25, 1, 0.5, 1)`;

  return (
    <div
      aria-hidden="true"
      role="presentation"
      data-hero-mode={is3d ? '3d' : 'static'}
      data-hero-reason={is3d ? undefined : reason}
      className={['absolute inset-0 overflow-hidden', className].filter(Boolean).join(' ')}
      style={{ touchAction: 'pan-y' }}
    >
      {showFallback && (
        <div
          className="absolute inset-0"
          style={{ opacity: is3d && ready ? 0 : 1, transition: fade }}
        >
          {fallback}
        </div>
      )}
      {is3d && (
        <div className="absolute inset-0" style={{ opacity: ready ? 1 : 0, transition: fade }}>
          <LazyHeroScene
            tier={tier}
            intensity={intensity}
            onReady={handleReady}
            onFail={handleFail}
          />
        </div>
      )}
    </div>
  );
}

export default Hero3D;
