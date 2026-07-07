// Single source of truth for the scroll choreography.
// The page scrolls over TRACK_VH; normalized progress (0..1) maps onto the
// particle scenes:
//   0 torus · 1 strands · 2 funnel · 3 mesh · 4 helix · 5 terrain
//   6 black hole · 7 galaxy
// Every overlay keyframe array derived from these MUST span the full 0..1
// range — framer may hand transforms off to a native ScrollTimeline, which
// appends an implicit keyframe at offset 1 using the element's base value
// if the range ends early (elements would fade back in down the page).

export const TRACK_VH = 1100

// [progress, scene] pairs — flat segments are holds on a formation.
// The helix hold is long on purpose: six feature cards orbit it.
export const SCENE_KEYS = [
  [0.0, 0],
  [0.07, 0],
  [0.115, 1],
  [0.145, 1],
  [0.19, 2],
  [0.22, 2],
  [0.26, 3],
  [0.29, 3],
  [0.37, 4],
  [0.69, 4],
  [0.74, 5],
  [0.795, 5],
  [0.845, 6],
  [0.885, 6],
  [0.93, 7],
  [1.0, 7],
]

export function progressToScene(p) {
  for (let i = 1; i < SCENE_KEYS.length; i++) {
    if (p <= SCENE_KEYS[i][0]) {
      const [p0, s0] = SCENE_KEYS[i - 1]
      const [p1, s1] = SCENE_KEYS[i]
      return s0 + ((p - p0) / (p1 - p0)) * (s1 - s0)
    }
  }
  return SCENE_KEYS[SCENE_KEYS.length - 1][1]
}

// Overlay visibility windows in progress space.
export const HERO = { holdEnd: 0.02, fadeStart: 0.06, fadeEnd: 0.1 }
export const STATS = { start: 0.27, inEnd: 0.305, outStart: 0.665, end: 0.71 }
export const GROWTH = {
  start: 0.72,
  inEnd: 0.76,
  outStart: 0.815,
  end: 0.855,
}
export const ECO = { start: 0.9, inEnd: 0.95 }
export const FOOTER = { start: 0.972, inEnd: 0.996 }

export const NAV_LABELS = [
  [0.0, 'ORIGIN'],
  [0.27, 'STRUCTURE'],
  [0.72, 'FLOW'],
  [0.83, 'VOYAGE'],
  [0.9, 'COSMOS'],
]
