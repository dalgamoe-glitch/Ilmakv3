// Shape generators for the morphing particle system.
// Every generator fills the same particle count so the vertex shader can
// blend between shapes. Positions are in world units for a camera at z=18
// (visible height ~20 at the origin plane). Each particle also gets a color
// parameter c: 0 → lavender, 0.5 → violet, 1 → pink, >1 → white-hot.

function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeGauss(rand) {
  return function gauss() {
    let u = 0
    let v = 0
    while (u === 0) u = rand()
    while (v === 0) v = rand()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
}

const TAU = Math.PI * 2

// Scene 0 — hero energy ring (torus of turbulent light facing the camera)
export function genTorus(n, seed = 11) {
  const rand = mulberry32(seed)
  const gauss = makeGauss(rand)
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n)
  const R = 8.4
  for (let i = 0; i < n; i++) {
    const th = rand() * TAU
    let rOff = gauss() * 0.42
    // wisps of flame licking outward, like the reference ring
    if (rand() < 0.22) {
      rOff += Math.pow(rand(), 2.2) * 3.2 * (rand() < 0.5 ? 1 : 0.4)
    }
    const wob = Math.sin(th * 5.0 + 1.3) * 0.35 + Math.sin(th * 9.0) * 0.2
    const r = R + rOff + wob
    pos[i * 3] = Math.cos(th) * r
    pos[i * 3 + 1] = Math.sin(th) * r
    pos[i * 3 + 2] = gauss() * 0.6
    // diagonal gradient around the ring: lavender lower-left → pink upper-right
    col[i] = Math.min(
      Math.max(0.5 + 0.5 * Math.sin(th + Math.PI / 4) + gauss() * 0.08, 0),
      1,
    )
    if (rand() < 0.03) col[i] = 1.15 // sparks of white-hot
  }
  return { pos, col }
}

// Scene 1 — twin flowing curtains / veils of particles
export function genCurtain(n, seed = 22) {
  const rand = mulberry32(seed)
  const gauss = makeGauss(rand)
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const side = rand() < 0.5 ? -1 : 1
    const y = (rand() * 2 - 1) * 11
    // veils get narrower toward the bottom and sway like fabric
    const taper = 0.5 + 0.5 * ((y + 11) / 22)
    let x = side * (4.6 + gauss() * 1.7 * taper)
    let z = gauss() * 1.2
    x += Math.sin(y * 0.32 + side * 1.7) * 1.9
    z += Math.cos(y * 0.27 + side) * 1.4
    if (rand() < 0.1) {
      // loose scatter drifting between the veils
      x = (rand() * 2 - 1) * 14
      z = (rand() * 2 - 1) * 4
    }
    pos[i * 3] = x
    pos[i * 3 + 1] = y
    pos[i * 3 + 2] = z
    col[i] = Math.min(Math.max(0.5 + x / 26 + gauss() * 0.07, 0), 1)
  }
  return { pos, col }
}

// Scene 2 — vertical DNA double helix
export function genHelix(n, seed = 33) {
  const rand = mulberry32(seed)
  const gauss = makeGauss(rand)
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n)
  const RAD = 2.35
  const TWIST = 0.52
  for (let i = 0; i < n; i++) {
    const y = (rand() * 2 - 1) * 12.5
    const strand = rand() < 0.5 ? 0 : Math.PI
    const phase = y * TWIST + strand
    let x
    let z
    if (rand() < 0.1) {
      // rungs bridging the two strands
      const s = rand()
      const a = phase - strand
      x = Math.cos(a) * RAD * (s * 2 - 1)
      z = Math.sin(a) * RAD * (s * 2 - 1)
    } else {
      const fuzz = rand() < 0.3 ? 1.5 : 0.5
      x = Math.cos(phase) * RAD + gauss() * fuzz
      z = Math.sin(phase) * RAD + gauss() * fuzz
    }
    pos[i * 3] = x
    pos[i * 3 + 1] = y + gauss() * 0.25
    pos[i * 3 + 2] = z
    // bottom lavender → top pink, hot knots along the spine
    col[i] = Math.min(Math.max(0.12 + ((y + 12.5) / 25) * 0.85 + gauss() * 0.06, 0), 1)
    if (rand() < 0.02) col[i] = 1.2
  }
  return { pos, col }
}

// Scene 3 — undulating particle terrain across the lower half
export function genTerrain(n, seed = 44) {
  const rand = mulberry32(seed)
  const gauss = makeGauss(rand)
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const x = (rand() * 2 - 1) * 19
    const z = rand() * 20 - 5
    let y =
      -4.4 -
      z * 0.1 +
      Math.sin(x * 0.3 + z * 0.45) * 0.8 +
      Math.sin(x * 0.72 - z * 0.3) * 0.42 +
      Math.sin(x * 0.16 + 1.2) * 1.15 +
      gauss() * 0.12
    if (rand() < 0.07) y += 0.4 + rand() * 5.5 // sparkles floating above the ridge
    pos[i * 3] = x
    pos[i * 3 + 1] = y
    pos[i * 3 + 2] = z
    col[i] = Math.min(Math.max((x + 19) / 38 + gauss() * 0.06, 0), 1)
    if (rand() < 0.015) col[i] = 1.1
  }
  return { pos, col }
}

// Scene 4 — black hole: dense swirl of stars with a hollow core
export function genBlackHole(n, seed = 55) {
  const rand = mulberry32(seed)
  const gauss = makeGauss(rand)
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n)
  const VOID = 3.5
  for (let i = 0; i < n; i++) {
    let r = VOID + Math.pow(rand(), 0.62) * 17
    let th = rand() * TAU + r * 0.24 // shear into a swirl
    if (rand() < 0.3) {
      // loose spiral arms
      const arm = Math.floor(rand() * 3)
      th = (arm * TAU) / 3 + r * 0.3 + gauss() * 0.25
    }
    pos[i * 3] = Math.cos(th) * r
    pos[i * 3 + 1] = Math.sin(th) * r
    pos[i * 3 + 2] = gauss() * 0.8
    const t = (r - VOID) / 17
    col[i] = Math.min(Math.max(0.15 + rand() * 0.55 + (1 - t) * 0.15, 0), 1)
    // photon ring — white-hot rim hugging the void
    if (r < VOID + 0.9 && rand() < 0.55) col[i] = 1.05 + rand() * 0.3
  }
  return { pos, col }
}

// Scene 5 — spiral galaxy with a blazing core (baked flat; tilted in shader)
export function genGalaxy(n, seed = 66) {
  const rand = mulberry32(seed)
  const gauss = makeGauss(rand)
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n)
  const ARMS = 2
  for (let i = 0; i < n; i++) {
    let r
    let th
    const k = rand()
    if (k < 0.3) {
      // dense blazing core
      r = Math.pow(rand(), 2.1) * 3.2
      th = rand() * TAU
    } else if (k < 0.45) {
      // bright orbital ring, as in the reference
      r = 8.6 + gauss() * 0.45
      th = rand() * TAU
    } else {
      r = 2 + Math.pow(rand(), 0.75) * 12
      const arm = Math.floor(rand() * ARMS)
      th = (arm * TAU) / ARMS + r * 0.4 + gauss() * (0.12 + r * 0.03)
    }
    pos[i * 3] = Math.cos(th) * r
    pos[i * 3 + 1] = Math.sin(th) * r
    pos[i * 3 + 2] = gauss() * (0.3 + r * 0.045)
    const t = Math.min(r / 13, 1)
    // white-pink core cooling to lavender arms
    col[i] = Math.min(Math.max(1.25 - t * 1.1 + gauss() * 0.06, 0), 1.4)
  }
  return { pos, col }
}

export function genSharedAttributes(n, seed = 77) {
  const rand = mulberry32(seed)
  const aRand = new Float32Array(n)
  const aSize = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    aRand[i] = rand()
    let s = 0.55 + rand() * 1.05
    if (rand() < 0.03) s = 2.2 + rand() * 1.6 // occasional large glow orbs
    aSize[i] = s
  }
  return { aRand, aSize }
}
