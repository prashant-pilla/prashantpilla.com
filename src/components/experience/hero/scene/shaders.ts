/**
 * GLSL for the node-field. Points and edges share `SHARED_VERTEX`, so
 * every displacement (breathing, drift, pointer attraction) is computed
 * identically for a node and for the line endpoints that reference it.
 * Nothing is animated on the CPU.
 *
 * Colours arrive as linear RGB; `colorspace_fragment` converts to the
 * renderer's output colour space (sRGB).
 */

const SHARED_UNIFORMS = /* glsl */ `
  uniform float uTime;
  uniform float uBreath;
  uniform float uDrift;
  uniform vec2 uPointer;          // NDC, aspect not applied
  uniform float uPointerStrength; // 0..1
  uniform float uPointerRadius;   // aspect-corrected NDC
  uniform float uPointerPull;     // 0..1
  uniform vec2 uViewScale;        // (tan(fov/2) * aspect, tan(fov/2))
  uniform float uAspect;
  uniform float uFogNear;
  uniform float uFogFar;
`;

const SHARED_VERTEX = /* glsl */ `
  ${SHARED_UNIFORMS}
  attribute float aPhase;
  varying float vFog;

  vec3 displace(vec3 p, float phase) {
    float ph = phase * 6.2831853;
    p *= uBreath;
    vec3 d = vec3(
      sin(uTime * 0.53 + ph),
      cos(uTime * 0.41 + ph * 1.7),
      sin(uTime * 0.37 + ph * 2.3)
    );
    return p + d * uDrift;
  }

  // Pulls view-space points toward the pointer ray at their own depth.
  vec4 toView(vec3 p) {
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    vec2 delta = (uPointer - ndc) * vec2(uAspect, 1.0);
    float infl = 1.0 - smoothstep(0.0, uPointerRadius, length(delta));
    infl *= infl * uPointerStrength;
    vec3 target = vec3(uPointer * uViewScale * -mv.z, mv.z);
    mv.xyz = mix(mv.xyz, target, infl * uPointerPull);
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);
    return mv;
  }
`;

export const POINTS_VERTEX = /* glsl */ `
  ${SHARED_VERTEX}
  uniform float uPointSize;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute float aMix;
  varying float vMix;
  varying float vAlpha;

  void main() {
    vec4 mv = toView(displace(position, aPhase));
    gl_Position = projectionMatrix * mv;
    float depth = max(-mv.z, 0.001);
    vMix = clamp(aMix * 0.65 + vFog * 0.35, 0.0, 1.0);
    gl_PointSize = uPointSize * aSize * uPixelRatio / depth;
    vAlpha = 0.72 + 0.28 * sin(uTime * 0.9 + aPhase * 6.2831853);
  }
`;

export const POINTS_FRAGMENT = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uFogColor;
  uniform float uOpacity;
  varying float vFog;
  varying float vMix;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float halo = smoothstep(0.5, 0.12, d);
    float core = smoothstep(0.2, 0.0, d);
    float a = (halo * 0.5 + core * 0.5) * vAlpha * uOpacity * (1.0 - vFog * 0.65);
    if (a < 0.004) discard;
    vec3 col = mix(mix(uColorA, uColorB, vMix), uFogColor, vFog * 0.7);
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`;

export const EDGES_VERTEX = /* glsl */ `
  ${SHARED_VERTEX}

  void main() {
    vec4 mv = toView(displace(position, aPhase));
    gl_Position = projectionMatrix * mv;
  }
`;

export const EDGES_FRAGMENT = /* glsl */ `
  uniform vec3 uColorC;
  uniform vec3 uFogColor;
  uniform float uOpacity;
  varying float vFog;

  void main() {
    float a = uOpacity * (1.0 - vFog * 0.8);
    if (a < 0.004) discard;
    vec3 col = mix(uColorC, uFogColor, vFog * 0.8);
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`;
