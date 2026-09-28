'use client';

/**
 * The node-field itself: one THREE.Points + one THREE.LineSegments sharing
 * a uniforms object. All motion lives in the vertex shader; the render
 * loop only updates a handful of uniforms, the group's rotation, and the
 * 600ms colour lerp on theme change. No per-frame allocations.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  LineSegments,
  NormalBlending,
  PerspectiveCamera,
  Points,
  ShaderMaterial,
  Vector2,
} from 'three';
import type { GpuTier } from '@/lib/gpu';
import {
  CAMERA,
  DRAG,
  EDGES,
  FOG,
  MAX_DELTA,
  MOTION,
  POINTER,
  POINTS,
  POINT_COUNT,
  THEME_LERP_SECONDS,
} from './config';
import { generateNodeField } from './geometry';
import type { InteractionState } from './interaction';
import {
  copyPalette,
  createPalette,
  lerpPalette,
  readHeroPalette,
  subscribeThemeChange,
  type HeroPalette,
} from './palette';
import { EDGES_FRAGMENT, EDGES_VERTEX, POINTS_FRAGMENT, POINTS_VERTEX } from './shaders';

export interface NodeFieldProps {
  tier: GpuTier;
  intensity: number;
  interaction: InteractionState;
}

// A type alias (not an interface) so it is assignable to three's
// `{ [uniform: string]: IUniform }` while staying fully typed here.
type Uniforms = {
  uTime: { value: number };
  uBreath: { value: number };
  uDrift: { value: number };
  uPointer: { value: Vector2 };
  uPointerStrength: { value: number };
  uPointerRadius: { value: number };
  uPointerPull: { value: number };
  uViewScale: { value: Vector2 };
  uAspect: { value: number };
  uFogNear: { value: number };
  uFogFar: { value: number };
  uFogColor: { value: Color };
  uColorA: { value: Color };
  uColorB: { value: Color };
  uColorC: { value: Color };
  uPointSize: { value: number };
  uPixelRatio: { value: number };
  uOpacity: { value: number };
};

interface Built {
  group: Group;
  pointUniforms: Uniforms;
  edgeUniforms: Uniforms;
  /** The live palette; its Color instances are the uniform values. */
  palette: HeroPalette;
  dispose: () => void;
}

interface Sim {
  time: number;
  pointerX: number;
  pointerY: number;
  strength: number;
  rotX: number;
  rotY: number;
  velX: number;
  velY: number;
  aspect: number;
  dpr: number;
  paletteFrom: HeroPalette;
  paletteTo: HeroPalette;
  paletteT: number;
}

function build(tier: GpuTier): Built {
  const data = generateNodeField(POINT_COUNT[tier]);
  const palette = createPalette();

  const shared = {
    uTime: { value: 0 },
    uBreath: { value: 1 },
    uDrift: { value: MOTION.drift },
    uPointer: { value: new Vector2() },
    uPointerStrength: { value: 0 },
    uPointerRadius: { value: POINTER.radius },
    uPointerPull: { value: POINTER.pull },
    uViewScale: { value: new Vector2(1, 1) },
    uAspect: { value: 1 },
    uFogNear: { value: FOG.near },
    uFogFar: { value: FOG.far },
    uFogColor: { value: palette.bg },
    uColorA: { value: palette.a },
    uColorB: { value: palette.b },
    uColorC: { value: palette.c },
    uPointSize: { value: POINTS.size },
    uPixelRatio: { value: 1 },
  };
  // Per-material opacity; every other uniform object is shared by reference
  // so one write updates both programs.
  const pointUniforms: Uniforms = { ...shared, uOpacity: { value: POINTS.opacity } };
  const edgeUniforms: Uniforms = { ...shared, uOpacity: { value: EDGES.opacity } };

  const pointGeometry = new BufferGeometry();
  pointGeometry.setAttribute('position', new BufferAttribute(data.positions, 3));
  pointGeometry.setAttribute('aPhase', new BufferAttribute(data.phases, 1));
  pointGeometry.setAttribute('aSize', new BufferAttribute(data.sizes, 1));
  pointGeometry.setAttribute('aMix', new BufferAttribute(data.mixes, 1));

  const edgeGeometry = new BufferGeometry();
  edgeGeometry.setAttribute('position', new BufferAttribute(data.edgePositions, 3));
  edgeGeometry.setAttribute('aPhase', new BufferAttribute(data.edgePhases, 1));

  const materialBase = {
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: NormalBlending,
  };
  const pointMaterial = new ShaderMaterial({
    ...materialBase,
    uniforms: pointUniforms,
    vertexShader: POINTS_VERTEX,
    fragmentShader: POINTS_FRAGMENT,
  });
  const edgeMaterial = new ShaderMaterial({
    ...materialBase,
    uniforms: edgeUniforms,
    vertexShader: EDGES_VERTEX,
    fragmentShader: EDGES_FRAGMENT,
  });

  const points = new Points(pointGeometry, pointMaterial);
  points.frustumCulled = false;
  points.renderOrder = 1;
  const edges = new LineSegments(edgeGeometry, edgeMaterial);
  edges.frustumCulled = false;
  edges.renderOrder = 0;

  const group = new Group();
  group.add(edges, points);

  return {
    group,
    pointUniforms,
    edgeUniforms,
    palette,
    dispose: () => {
      pointGeometry.dispose();
      edgeGeometry.dispose();
      pointMaterial.dispose();
      edgeMaterial.dispose();
      group.clear();
    },
  };
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

export function NodeField({ tier, intensity, interaction }: NodeFieldProps) {
  const built = useMemo(() => build(tier), [tier]);
  useEffect(() => () => built.dispose(), [built]);

  const sim = useRef<Sim>({
    time: 0,
    pointerX: 0,
    pointerY: 0,
    strength: 0,
    rotX: 0,
    rotY: 0,
    velX: 0,
    velY: 0,
    aspect: 0,
    dpr: 0,
    paletteFrom: createPalette(),
    paletteTo: createPalette(),
    paletteT: 1,
  });

  // Theme colours: snap on mount, lerp on every subsequent change.
  useEffect(() => {
    const s = sim.current;
    readHeroPalette(s.paletteTo);
    copyPalette(s.paletteTo, s.paletteFrom);
    copyPalette(s.paletteTo, built.palette);
    s.paletteT = 1;
    return subscribeThemeChange(() => {
      copyPalette(built.palette, s.paletteFrom);
      readHeroPalette(s.paletteTo);
      s.paletteT = 0;
    });
  }, [built]);

  useFrame((state, delta) => {
    const s = sim.current;
    const u = built.pointUniforms;
    const dt = Math.min(Math.max(delta, 0.0001), MAX_DELTA);
    s.time += dt;

    // Camera / viewport dependent uniforms, only when something changed.
    const camera = state.camera as PerspectiveCamera;
    const aspect = state.viewport.aspect;
    const dpr = state.viewport.dpr;
    if (aspect !== s.aspect || dpr !== s.dpr) {
      s.aspect = aspect;
      s.dpr = dpr;
      const tanHalf = Math.tan((camera.fov * Math.PI) / 360);
      u.uViewScale.value.set(tanHalf * aspect, tanHalf);
      u.uAspect.value = aspect;
      u.uPixelRatio.value = dpr;
      // Pull the camera back on portrait viewports so the field still fits.
      camera.position.z = aspect < 1 ? CAMERA.z / Math.pow(aspect, 0.65) : CAMERA.z;
    }

    u.uTime.value = s.time;
    u.uBreath.value = 1 + Math.sin(s.time * MOTION.breathSpeed) * MOTION.breathAmplitude;
    u.uDrift.value = MOTION.drift * intensity;

    // Pointer attraction: smoothed position, strength ramps in and out.
    const ia = interaction;
    const follow = 1 - Math.exp(-dt * POINTER.followRate);
    s.pointerX += (ia.x - s.pointerX) * follow;
    s.pointerY += (ia.y - s.pointerY) * follow;
    const targetStrength = ia.hovering ? 1 : 0;
    const strengthRate = ia.hovering ? POINTER.strengthRiseRate : POINTER.strengthFallRate;
    s.strength += (targetStrength - s.strength) * (1 - Math.exp(-dt * strengthRate));
    u.uPointer.value.set(s.pointerX, s.pointerY);
    u.uPointerStrength.value = s.strength * Math.min(intensity, 1.5);

    // Drag: follow the hand 1:1 while down, spring back to rest after.
    if (ia.dragging) {
      const dx = ia.dragDx * DRAG.gain * intensity;
      const dy = -ia.dragDy * DRAG.gain * intensity;
      ia.dragDx = 0;
      ia.dragDy = 0;
      s.rotY += dx;
      s.rotX += dy;
      const vk = 1 - Math.exp(-dt * DRAG.velocityRate);
      s.velY += (dx / dt - s.velY) * vk;
      s.velX += (dy / dt - s.velX) * vk;
    } else {
      s.velX += (-DRAG.stiffness * s.rotX - DRAG.damping * s.velX) * dt;
      s.velY += (-DRAG.stiffness * s.rotY - DRAG.damping * s.velY) * dt;
      s.rotX += s.velX * dt;
      s.rotY += s.velY * dt;
    }
    if (s.rotX > DRAG.maxOffset) s.rotX = DRAG.maxOffset;
    else if (s.rotX < -DRAG.maxOffset) s.rotX = -DRAG.maxOffset;
    if (s.rotY > DRAG.maxOffset) s.rotY = DRAG.maxOffset;
    else if (s.rotY < -DRAG.maxOffset) s.rotY = -DRAG.maxOffset;

    built.group.rotation.y = s.time * MOTION.idleSpin + s.rotY;
    built.group.rotation.x =
      Math.sin(s.time * MOTION.idleNodSpeed) * MOTION.idleNodAmplitude + s.rotX;

    // Theme colour transition.
    if (s.paletteT < 1) {
      s.paletteT = Math.min(1, s.paletteT + dt / THEME_LERP_SECONDS);
      lerpPalette(s.paletteFrom, s.paletteTo, smoothstep(s.paletteT), built.palette);
    }
  });

  return <primitive object={built.group} />;
}
