/**
 * Tunables for the node-field hero. Units are scene units unless noted;
 * the field is roughly a unit ellipsoid viewed from `CAMERA.z`.
 */
import type { GpuTier } from '@/lib/gpu';

export const POINT_COUNT: Record<GpuTier, number> = {
  high: 1000,
  mid: 620,
};

/** Deterministic seed so the field is identical on every load. */
export const SEED = 0x50696c6c; // "Pill"

/** Concentric fibonacci shells (radius, share of points) + volume fill. */
export const SHELLS: ReadonlyArray<{ radius: number; share: number; jitter: number }> = [
  { radius: 1.0, share: 0.5, jitter: 0.11 },
  { radius: 0.72, share: 0.25, jitter: 0.09 },
  { radius: 0.42, share: 0.1, jitter: 0.07 },
];
/** Remaining share of points is scattered through the volume. */
export const VOLUME_MIN_RADIUS = 0.2;

/** Ellipsoid scale applied to the whole field so it is not a globe. */
export const FIELD_SCALE = { x: 1.32, y: 0.92, z: 1.0 } as const;

/** Fraction of points promoted to larger "hub" nodes. */
export const HUB_SHARE = 0.045;
export const HUB_SIZE = { min: 1.9, max: 2.6 } as const;
export const NODE_SIZE = { min: 0.55, max: 1.25 } as const;

/** Edges: k nearest neighbours, rejecting anything longer than max. */
export const EDGE_K = 3;
export const EDGE_MAX_LENGTH = 0.46;

export const CAMERA = { fov: 42, z: 3.3, near: 0.1, far: 12 } as const;

/** Depth fog toward `--bg`, in view-space distance from the camera. */
export const FOG = { near: 2.3, far: 4.6 } as const;

export const POINTS = {
  /** Base gl_PointSize before size attenuation and DPR. */
  size: 26,
  opacity: 0.95,
} as const;

export const EDGES = {
  opacity: 0.32,
} as const;

export const MOTION = {
  /** Idle spin around Y, radians per second. */
  idleSpin: 0.045,
  /** Idle nod around X, amplitude (rad) and speed (rad/s). */
  idleNodAmplitude: 0.08,
  idleNodSpeed: 0.21,
  /** Breathing scale amplitude and speed. */
  breathAmplitude: 0.022,
  breathSpeed: 0.45,
  /** Per-point drift amplitude (scene units). */
  drift: 0.028,
} as const;

export const POINTER = {
  /** Radius of influence in aspect-corrected NDC (1 = half viewport height). */
  radius: 0.42,
  /** How far affected points move toward the pointer ray (0..1). */
  pull: 0.3,
  /** Rate constants (1/s) for pointer smoothing and strength ramp. */
  followRate: 9,
  strengthRiseRate: 5,
  strengthFallRate: 2.2,
} as const;

export const DRAG = {
  /** Radians of rotation per NDC unit of pointer travel. */
  gain: 1.6,
  /** Spring pulling the field back to rest after release. */
  stiffness: 7,
  damping: 2.8,
  /** Clamp on accumulated offset so a wild fling cannot flip the field. */
  maxOffset: 1.4,
  /** Velocity smoothing during drag (1/s). */
  velocityRate: 14,
} as const;

/** Uniform colour lerp duration when the theme changes (seconds). */
export const THEME_LERP_SECONDS = 0.6;

/** Canvas fade-in once the WebGL context is ready (ms). */
export const FADE_IN_MS = 1100;

/** Pre-mount rAF probe window (ms). */
export const FPS_PROBE_MS = 800;

/** Largest delta the simulation accepts (s) so a paused tab does not jump. */
export const MAX_DELTA = 1 / 30;
