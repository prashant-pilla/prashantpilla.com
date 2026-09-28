/**
 * GPU / device capability heuristics for the 3D hero.
 *
 * Everything here is synchronous and side-effect free except
 * `supportsWebGL2()` (creates and immediately releases a probe context)
 * and `probeFrameRate()` (counts requestAnimationFrame ticks).
 *
 * Rules (any one of these forces the static fallback):
 *   1. `prefers-reduced-motion: reduce`
 *   2. no WebGL2, or WebGL2 only via a software renderer
 *      (`failIfMajorPerformanceCaveat`, SwiftShader / llvmpipe / Mesa)
 *   3. `navigator.connection.saveData === true`
 *   4. `navigator.deviceMemory <= 4` (when the browser exposes it)
 *   5. `navigator.hardwareConcurrency <= 4` AND a small viewport (< 768px)
 *   6. (async) median frame interval over the probe window is slower
 *      than `MIN_PROBE_FPS`, i.e. the page cannot even idle at 30fps.
 *
 * Tier picks the point budget: `high` for wide viewports with a fine
 * pointer and >= 8 logical cores, `mid` otherwise.
 */

export type HeroMode = '3d' | 'static';
export type GpuTier = 'mid' | 'high';

export interface GpuAssessment {
  mode: HeroMode;
  tier: GpuTier;
  /** Human-readable reasons for a `static` verdict (empty when `3d`). */
  reasons: string[];
}

/** Below this the pre-mount probe declares the device too weak. */
export const MIN_PROBE_FPS = 30;

const SMALL_VIEWPORT_PX = 768;
const SOFTWARE_RENDERER =
  /swiftshader|llvmpipe|softpipe|software|mesa offscreen|microsoft basic render/i;

interface NavigatorExtras {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

function nav(): (Navigator & NavigatorExtras) | undefined {
  return typeof navigator === 'undefined' ? undefined : (navigator as Navigator & NavigatorExtras);
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function prefersSaveData(): boolean {
  return nav()?.connection?.saveData === true;
}

export function getDeviceMemory(): number | undefined {
  const value = nav()?.deviceMemory;
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function getHardwareConcurrency(): number | undefined {
  const value = nav()?.hardwareConcurrency;
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined;
}

export function isSmallViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return Math.min(window.innerWidth, window.innerHeight) < SMALL_VIEWPORT_PX;
}

export function isCoarsePointer(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

/**
 * True when a hardware-accelerated WebGL2 context can be created.
 * The probe context is released right away via WEBGL_lose_context.
 */
export function supportsWebGL2(): boolean {
  if (typeof document === 'undefined') return false;
  let gl: WebGL2RenderingContext | null = null;
  try {
    const canvas = document.createElement('canvas');
    gl = canvas.getContext('webgl2', {
      failIfMajorPerformanceCaveat: true,
      powerPreference: 'high-performance',
    });
    if (!gl) return false;

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      if (typeof renderer === 'string' && SOFTWARE_RENDERER.test(renderer)) return false;
    }
    return true;
  } catch {
    return false;
  } finally {
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  }
}

/** Synchronous part of the decision. Call from an effect (browser only). */
export function assessGpu(): GpuAssessment {
  const reasons: string[] = [];

  if (prefersReducedMotion()) reasons.push('prefers-reduced-motion');
  if (prefersSaveData()) reasons.push('save-data');

  const memory = getDeviceMemory();
  if (memory !== undefined && memory <= 4) reasons.push(`device-memory:${memory}`);

  const cores = getHardwareConcurrency();
  const small = isSmallViewport();
  if (cores !== undefined && cores <= 4 && small) reasons.push(`cores:${cores}+small-viewport`);

  // Most expensive check last, and only if we still might render.
  if (reasons.length === 0 && !supportsWebGL2()) reasons.push('no-webgl2');

  const tier: GpuTier =
    !small && !isCoarsePointer() && (cores === undefined || cores >= 8) ? 'high' : 'mid';

  return { mode: reasons.length === 0 ? '3d' : 'static', tier, reasons };
}

/**
 * Measures the page's idle requestAnimationFrame cadence for `durationMs`
 * and resolves with the frames-per-second implied by the *median* frame
 * interval (robust to a single GC hitch). Resolves `null` when the result
 * is inconclusive (document hidden, too few frames), which callers should
 * treat as a pass.
 */
export function probeFrameRate(durationMs = 800): Promise<number | null> {
  if (typeof window === 'undefined' || typeof requestAnimationFrame !== 'function') {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    const deltas: number[] = [];
    let last = -1;
    let start = -1;
    let hidden = document.visibilityState === 'hidden';

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') hidden = true;
    };
    document.addEventListener('visibilitychange', onVisibility);

    const finish = (value: number | null) => {
      document.removeEventListener('visibilitychange', onVisibility);
      resolve(value);
    };

    const tick = (now: number) => {
      if (start < 0) start = now;
      if (last >= 0) deltas.push(now - last);
      last = now;
      if (now - start < durationMs) {
        requestAnimationFrame(tick);
        return;
      }
      if (hidden || deltas.length < 8) {
        finish(null);
        return;
      }
      deltas.sort((a, b) => a - b);
      const median = deltas[Math.floor(deltas.length / 2)];
      finish(median > 0 ? 1000 / median : null);
    };
    requestAnimationFrame(tick);
  });
}
