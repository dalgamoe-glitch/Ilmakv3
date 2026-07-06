// Single source of truth for the scroll choreography.
// The page scrolls over TRACK_VH; normalized progress (0..1) maps onto the
// particle scenes:
//   0 torus · 1 strands · 2 funnel · 3 mesh · 4 helix · 5 terrain
//   6 black hole · 7 galaxy
// Every overlay keyframe array derived from these MUST span the full 0..1
// range — framer may hand transforms off to a native ScrollTimeline, which
// appends an implicit keyframe at offset 1 using the element's base value
// if the range ends early (elements would fade back in down the page).

export const TRACK_VH = 850

// [progress, scene] pairs — flat segments are holds on a formation.
export const SCENE_KEYS = [
  [0.0, 0],
  [0.08, 0],
  [0.14, 1],
  [0.17, 1],
  [0.23, 2],
  [0.26, 2],
  [0.31, 3],
  [0.34, 3],
  [0.42, 4],
  [0.6, 4],
  [0.66, 5],
  [0.73, 5],
  [0.79, 6],
  [0.84, 6],
  [0.91, 7],
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
export const HERO = { holdEnd: 0.02, fadeStart: 0.07, fadeEnd: 0.12 }
export const STATS = { start: 0.3, inEnd: 0.335, outStart: 0.575, end: 0.625 }
export const GROWTH = {
  start: 0.63,
  inEnd: 0.675,
  outStart: 0.74,
  end: 0.79,
}
export const ECO = { start: 0.9, inEnd: 0.95 }
export const FOOTER = { start: 0.972, inEnd: 0.996 }

export const NAV_LABELS = [
  [0.0, 'ORIGIN'],
  [0.3, 'STRUCTURE'],
  [0.63, 'FLOW'],
  [0.76, 'VOYAGE'],
  [0.88, 'COSMOS'],
]
