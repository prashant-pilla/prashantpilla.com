'use client';

/**
 * The lazily loaded WebGL half of the hero: owns the R3F <Canvas>, the
 * pointer listeners, and the "am I worth rendering" logic (pauses the
 * frameloop when the canvas is scrolled offscreen or the tab is hidden).
 *
 * Imported only via `next/dynamic` from Hero3D.lazy.tsx so three.js and
 * @react-three/fiber never land in the page's initial JS.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, type RootState } from '@react-three/fiber';
import type { GpuTier } from '@/lib/gpu';
import { CAMERA } from './config';
import { attachInteraction, createInteractionState } from './interaction';
import { NodeField } from './NodeField';

export interface HeroSceneProps {
  tier: GpuTier;
  intensity: number;
  /** Called once the WebGL context exists and the first frame is imminent. */
  onReady?: () => void;
  /** Called when WebGL cannot continue (context lost); parent should fall back. */
  onFail?: (reason: string) => void;
}

const GL_OPTIONS = {
  antialias: false,
  powerPreference: 'high-performance',
  alpha: true,
  stencil: false,
} as const;

const DPR: [number, number] = [1, 1.5];

export default function HeroScene({ tier, intensity, onReady, onFail }: HeroSceneProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const interaction = useMemo(createInteractionState, []);
  const [onscreen, setOnscreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  // Keep the latest callbacks without re-creating the Canvas.
  const onReadyRef = useRef(onReady);
  const onFailRef = useRef(onFail);
  onReadyRef.current = onReady;
  onFailRef.current = onFail;

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    return attachInteraction(el, interaction);
  }, [interaction]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (entry) setOnscreen(entry.isIntersecting);
      },
      { threshold: 0 },
    );
    io.observe(el);

    const onVisibility = () => setTabVisible(document.visibilityState !== 'hidden');
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const handleCreated = (state: RootState) => {
    const canvas = state.gl.domElement;
    canvas.style.touchAction = 'pan-y';
    state.gl.setClearColor(0x000000, 0);
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      onFailRef.current?.('webgl-context-lost');
    });
    onReadyRef.current?.();
  };

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'pan-y' }}
    >
      <Canvas
        dpr={DPR}
        flat
        frameloop={onscreen && tabVisible ? 'always' : 'never'}
        gl={GL_OPTIONS}
        camera={{
          fov: CAMERA.fov,
          near: CAMERA.near,
          far: CAMERA.far,
          position: [0, 0, CAMERA.z],
        }}
        onCreated={handleCreated}
        style={{ touchAction: 'pan-y' }}
      >
        <NodeField tier={tier} intensity={intensity} interaction={interaction} />
      </Canvas>
    </div>
  );
}
