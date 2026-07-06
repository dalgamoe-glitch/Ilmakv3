// GLSL for the morphing particle field.
// uScene runs 0→7 across: torus, strands, funnel, mesh, helix, terrain,
// black hole, galaxy. Shape 0 lives in `position`; shapes 1–7 in aPos1..aPos7.
// Color params are packed: aColA = (c0,c1,c2), aColB = (c3,c4,c5),
// aColC = (c6,c7).

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
  attribute vec3 aPos6;
  attribute vec3 aPos7;
  attribute vec3 aColA;
  attribute vec3 aColB;
  attribute vec2 aColC;
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
    float t6 = prog(5.0);
    float t7 = prog(6.0);

    vec3 pos = position;
    float col = aColA.x;
    pos = mix(pos, aPos1, t1); col = mix(col, aColA.y, t1);
    pos = mix(pos, aPos2, t2); col = mix(col, aColA.z, t2);
    pos = mix(pos, aPos3, t3); col = mix(col, aColB.x, t3);
    pos = mix(pos, aPos4, t4); col = mix(col, aColB.y, t4);
    pos = mix(pos, aPos5, t5); col = mix(col, aColB.z, t5);
    pos = mix(pos, aPos6, t6); col = mix(col, aColC.x, t6);
    pos = mix(pos, aPos7, t7); col = mix(col, aColC.y, t7);

    // per-leg turbulence while particles are in transit between shapes.
    // Legs into the structured funnel/mesh stay calm so the grids survive;
    // the mesh→helix leg runs hot — its mid-state IS the sparkle column.
    float travel = t1 * (1.0 - t1) * 3.4
                 + t2 * (1.0 - t2) * 2.0
                 + t3 * (1.0 - t3) * 1.6
                 + t4 * (1.0 - t4) * 4.8
                 + t5 * (1.0 - t5) * 3.4
                 + t6 * (1.0 - t6) * 3.4
                 + t7 * (1.0 - t7) * 3.4;
    float ph = aRand * 6.2831;
    pos += vec3(
      sin(uTime * 0.9 + ph + pos.y * 0.5),
      cos(uTime * 0.8 + ph * 1.7 + pos.x * 0.4),
      sin(uTime * 0.7 + ph * 2.3)
    ) * travel;

    // the merge: particles get sucked down and inward entering the funnel
    float suck = t2 * (1.0 - t2) * 4.0;
    pos.y -= suck * 1.6 * aRand;
    pos.xz *= 1.0 - 0.12 * suck;

    // mesh → helix: the sheet collapses toward the axis into a dense column
    float squeeze = t4 * (1.0 - t4) * 4.0;
    pos.x *= mix(1.0, 0.55, squeeze);
    pos.z *= mix(1.0, 0.7, squeeze);

    // scene weights for per-shape idle motion
    float w0 = 1.0 - min(uScene, 1.0);
    float wFun = 1.0 - min(abs(uScene - 2.0), 1.0);
    float wMesh = 1.0 - min(abs(uScene - 3.0), 1.0);
    float wHelix = 1.0 - min(abs(uScene - 4.0), 1.0);
    float wTerr = 1.0 - min(abs(uScene - 5.0), 1.0);
    float wHole = 1.0 - min(abs(uScene - 6.0), 1.0);
    float wGal = clamp(uScene - 6.0, 0.0, 1.0);

    // energy flowing around the hero ring
    pos.xy = rot(pos.xy, uTime * (0.05 * w0 + 0.10 * wHole + 0.06 * wGal));
    // funnel vortex spinning + helix slowly revolving
    pos.xz = rot(pos.xz, uTime * (0.35 * wFun + 0.28 * wHelix));
    // mesh curtain rippling
    pos.z += sin(pos.x * 0.5 + uTime * 1.1 + pos.y * 0.4) * 0.5 * wMesh;
    pos.y += sin(pos.x * 0.35 + uTime * 0.8) * 0.25 * wMesh;
    // terrain waves rolling
    pos.y += sin(pos.x * 0.38 + uTime * 0.9 + pos.z * 0.5) * 0.4 * wTerr;

    // black hole / galaxy tilt (shapes are baked flat, facing camera)
    float tilt = -0.14 * wHole + 1.12 * wGal * wGal;
    pos.yz = rot(pos.yz, tilt);
    pos.y -= 2.3 * wGal;

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
