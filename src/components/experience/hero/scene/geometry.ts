/**
 * Deterministic node-field generation: jittered fibonacci shells plus a
 * sparse volume fill, then k-nearest-neighbour edges. Runs once per
 * mount (O(n²) neighbour search on <= 1000 points, a few milliseconds).
 */
import {
  EDGE_K,
  EDGE_MAX_LENGTH,
  FIELD_SCALE,
  HUB_SHARE,
  HUB_SIZE,
  NODE_SIZE,
  SEED,
  SHELLS,
  VOLUME_MIN_RADIUS,
} from './config';

export interface NodeFieldData {
  count: number;
  /** xyz per node. */
  positions: Float32Array;
  /** 0..1 per node; drives drift and twinkle. */
  phases: Float32Array;
  /** Relative sprite size per node. */
  sizes: Float32Array;
  /** 0..1 per node; gradient position between hero colours a and b. */
  mixes: Float32Array;
  /** Number of line segments. */
  edgeCount: number;
  /** xyz for both endpoints of every edge. */
  edgePositions: Float32Array;
  /** phase of both endpoints of every edge. */
  edgePhases: Float32Array;
}

/** mulberry32: tiny seeded PRNG, good enough for layout jitter. */
function createRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function fibonacciShell(
  out: Float32Array,
  offset: number,
  count: number,
  radius: number,
  jitter: number,
  rnd: () => number,
): void {
  const spin = rnd() * Math.PI * 2;
  for (let i = 0; i < count; i++) {
    const y = 1 - (2 * (i + 0.5)) / count;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = GOLDEN_ANGLE * i + spin;
    const k = radius + (rnd() * 2 - 1) * jitter;
    const idx = (offset + i) * 3;
    out[idx] = Math.cos(theta) * r * k + (rnd() * 2 - 1) * jitter * 0.5;
    out[idx + 1] = y * k + (rnd() * 2 - 1) * jitter * 0.5;
    out[idx + 2] = Math.sin(theta) * r * k + (rnd() * 2 - 1) * jitter * 0.5;
  }
}

function volumeFill(
  out: Float32Array,
  offset: number,
  count: number,
  minRadius: number,
  maxRadius: number,
  rnd: () => number,
): void {
  for (let i = 0; i < count; i++) {
    // Uniform direction, radius biased outward so the core stays airy.
    const u = rnd() * 2 - 1;
    const phi = rnd() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const r = minRadius + (maxRadius - minRadius) * Math.cbrt(rnd());
    const idx = (offset + i) * 3;
    out[idx] = s * Math.cos(phi) * r;
    out[idx + 1] = u * r;
    out[idx + 2] = s * Math.sin(phi) * r;
  }
}

export function generateNodeField(count: number): NodeFieldData {
  const rnd = createRandom(SEED);
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const sizes = new Float32Array(count);
  const mixes = new Float32Array(count);

  // Distribute points across shells; whatever is left fills the volume.
  let offset = 0;
  for (const shell of SHELLS) {
    const n = Math.floor(count * shell.share);
    fibonacciShell(positions, offset, n, shell.radius, shell.jitter, rnd);
    offset += n;
  }
  volumeFill(positions, offset, count - offset, VOLUME_MIN_RADIUS, SHELLS[0].radius, rnd);

  for (let i = 0; i < count; i++) {
    positions[i * 3] *= FIELD_SCALE.x;
    positions[i * 3 + 1] *= FIELD_SCALE.y;
    positions[i * 3 + 2] *= FIELD_SCALE.z;
    phases[i] = rnd();
    mixes[i] = rnd();
    const hub = rnd() < HUB_SHARE;
    sizes[i] = hub
      ? HUB_SIZE.min + rnd() * (HUB_SIZE.max - HUB_SIZE.min)
      : NODE_SIZE.min + rnd() * (NODE_SIZE.max - NODE_SIZE.min);
  }

  // k-nearest edges, deduplicated (i < j) and length-limited.
  const maxSq = EDGE_MAX_LENGTH * EDGE_MAX_LENGTH;
  const pairs = new Set<number>();
  const bestIdx = new Int32Array(EDGE_K);
  const bestSq = new Float64Array(EDGE_K);

  for (let i = 0; i < count; i++) {
    bestIdx.fill(-1);
    bestSq.fill(Infinity);
    const ix = positions[i * 3];
    const iy = positions[i * 3 + 1];
    const iz = positions[i * 3 + 2];
    for (let j = 0; j < count; j++) {
      if (j === i) continue;
      const dx = positions[j * 3] - ix;
      const dy = positions[j * 3 + 1] - iy;
      const dz = positions[j * 3 + 2] - iz;
      const dsq = dx * dx + dy * dy + dz * dz;
      if (dsq >= bestSq[EDGE_K - 1] || dsq > maxSq) continue;
      // Insertion into the small sorted buffer.
      let k = EDGE_K - 1;
      while (k > 0 && bestSq[k - 1] > dsq) {
        bestSq[k] = bestSq[k - 1];
        bestIdx[k] = bestIdx[k - 1];
        k--;
      }
      bestSq[k] = dsq;
      bestIdx[k] = j;
    }
    for (let k = 0; k < EDGE_K; k++) {
      const j = bestIdx[k];
      if (j < 0) continue;
      const a = Math.min(i, j);
      const b = Math.max(i, j);
      pairs.add(a * count + b);
    }
  }

  const edgeCount = pairs.size;
  const edgePositions = new Float32Array(edgeCount * 6);
  const edgePhases = new Float32Array(edgeCount * 2);
  let e = 0;
  for (const key of pairs) {
    const a = Math.floor(key / count);
    const b = key - a * count;
    edgePositions.set(positions.subarray(a * 3, a * 3 + 3), e * 6);
    edgePositions.set(positions.subarray(b * 3, b * 3 + 3), e * 6 + 3);
    edgePhases[e * 2] = phases[a];
    edgePhases[e * 2 + 1] = phases[b];
    e++;
  }

  return { count, positions, phases, sizes, mixes, edgeCount, edgePositions, edgePhases };
}
