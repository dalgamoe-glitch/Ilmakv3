// GLSL for the morphing particle field.
// uScene runs 0→5 across: torus, curtain, helix, terrain, black hole, galaxy.
// Positions for shape 0 live in `position`; shapes 1–5 in aPos1..aPos5.
// Color params are packed: aColA = (c0,c1,c2), aColB = (c3,c4,c5).

export const particleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uScene;
  uniform float uSize;
  uniform float uDrift;
  uniform float uPixelRatio;

  attribute vec3 aPos1;
  attribute vec3 aPos2;
  attribute vec3 aPos3;
  attribute vec3 aPos4;
  attribute vec3 aPos5;
  attribute vec3 aColA;
  attribute vec3 aColB;
  attribute float aRand;
  attribute float aSize;

  varying float vCol;
  varying float vTwinkle;

  // per-particle staggered segment progress → organic dissolve, not a lerp
  float prog(float idx) {
    float t = clamp(uScene - idx, 0.0, 1.0);
    float d = 0.38 * aRand;
    return smoothstep(0.0, 1.0, clamp((t - d) / (1.0 - d), 0.0, 1.0));
  }

  vec2 rot(vec2 p, float a) {
    float c = cos(a);
    float s = sin(a);
    return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
  }

  void main() {
    float t1 = prog(0.0);
    float t2 = prog(1.0);
    float t3 = prog(2.0);
    float t4 = prog(3.0);
    float t5 = prog(4.0);

    vec3 pos = position;
    float col = aColA.x;
    pos = mix(pos, aPos1, t1); col = mix(col, aColA.y, t1);
    pos = mix(pos, aPos2, t2); col = mix(col, aColA.z, t2);
    pos = mix(pos, aPos3, t3); col = mix(col, aColB.x, t3);
    pos = mix(pos, aPos4, t4); col = mix(col, aColB.y, t4);
    pos = mix(pos, aPos5, t5); col = mix(col, aColB.z, t5);

    // turbulence while particles are in transit between shapes
    float travel = t1 * (1.0 - t1) + t2 * (1.0 - t2) + t3 * (1.0 - t3)
                 + t4 * (1.0 - t4) + t5 * (1.0 - t5);
    float ph = aRand * 6.2831;
    pos += vec3(
      sin(uTime * 0.9 + ph + pos.y * 0.5),
      cos(uTime * 0.8 + ph * 1.7 + pos.x * 0.4),
      sin(uTime * 0.7 + ph * 2.3)
    ) * travel * 3.4;

    // scene weights for per-shape idle motion
    float w0 = 1.0 - min(uScene, 1.0);
    float w2 = 1.0 - min(abs(uScene - 2.0), 1.0);
    float w3 = 1.0 - min(abs(uScene - 3.0), 1.0);
    float w4 = 1.0 - min(abs(uScene - 4.0), 1.0);
    float w5 = clamp(uScene - 4.0, 0.0, 1.0);

    // energy flowing around the hero ring
    pos.xy = rot(pos.xy, uTime * (0.05 * w0 + 0.10 * w4 + 0.06 * w5));
    // helix slowly revolving
    pos.xz = rot(pos.xz, uTime * 0.28 * w2);
    // terrain waves rolling
    pos.y += sin(pos.x * 0.38 + uTime * 0.9 + pos.z * 0.5) * 0.4 * w3;

    // black hole / galaxy tilt (shapes are baked flat, facing camera)
    float tilt = -0.14 * w4 + 1.12 * w5 * w5;
    pos.yz = rot(pos.yz, tilt);
    pos.y -= 2.3 * w5;

    // ambient per-particle drift so the field always feels alive
    pos += vec3(
      sin(uTime * 0.6 + ph + pos.y * 0.33),
      cos(uTime * 0.5 + ph * 2.0 + pos.x * 0.29),
      sin(uTime * 0.4 + ph * 3.1)
    ) * uDrift;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aSize * uPixelRatio * (26.0 / -mv.z);

    vCol = col;
    vTwinkle = 0.72 + 0.28 * sin(uTime * (1.5 + aRand * 2.5) + ph * 4.0);
  }
`

export const particleFragment = /* glsl */ `
  precision highp float;

  uniform float uAlpha;

  varying float vCol;
  varying float vTwinkle;

  vec3 grad(float c) {
    vec3 lav = vec3(0.655, 0.545, 0.980);   /* #A78BFA */
    vec3 vio = vec3(0.486, 0.227, 0.929);   /* #7C3AED */
    vec3 pnk = vec3(0.925, 0.282, 0.600);   /* #EC4899 */
    vec3 col = mix(lav, vio, smoothstep(0.0, 0.55, c));
    col = mix(col, pnk, smoothstep(0.45, 1.0, c));
    col = mix(col, vec3(1.0, 0.96, 0.99), clamp((c - 1.0) * 2.2, 0.0, 1.0));
    return col;
  }

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float halo = smoothstep(0.5, 0.04, d) * 0.5;
    float core = smoothstep(0.24, 0.0, d);
    float a = (halo + core) * vTwinkle * uAlpha;
    gl_FragColor = vec4(grad(vCol) * a, a);
  }
`

export const starVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute float aPhase;
  attribute float aTint;
  varying float vTint;
  varying float vTwinkle;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (30.0 / -mv.z);
    vTint = aTint;
    vTwinkle = 0.55 + 0.45 * sin(uTime * (0.8 + aPhase * 2.0) + aPhase * 40.0);
  }
`

export const starFragment = /* glsl */ `
  precision highp float;
  varying float vTint;
  varying float vTwinkle;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d) * vTwinkle;
    vec3 white = vec3(0.92, 0.90, 0.98);
    vec3 lav = vec3(0.72, 0.62, 0.99);
    vec3 pnk = vec3(0.95, 0.55, 0.78);
    vec3 col = mix(white, mix(lav, pnk, step(0.8, vTint)), step(0.55, vTint));
    gl_FragColor = vec4(col * a, a);
  }
`

// Soft black disc that occludes the swirl at the black-hole scene
export const holeVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const holeFragment = /* glsl */ `
  precision highp float;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = smoothstep(1.0, 0.7, d) * uOpacity;
    gl_FragColor = vec4(0.008, 0.002, 0.014, a);
  }
`
