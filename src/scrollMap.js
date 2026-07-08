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
// outStart/end fade Ecosystem out right at the very end of the track (rather
// than holding at opacity 1 forever) so it doesn't sit fixed on top of the
// static sections (product preview, proof, pricing, FAQ, footer) that now
// follow the cinematic track in normal document flow.
export const ECO = { start: 0.9, inEnd: 0.95, outStart: 0.985, end: 1 }

// Card orbit timing (Stats.jsx) — the single source of truth for each
// card's entry moment and shared angular parameters, so both the orbit
// choreography and the snap-scroll stops below derive from the same
// numbers instead of duplicating them.
export const CARD_THETA0 = 0.42
export const CARD_SWEEP = 3.2
export const CARD_ENTERS = [0.04, 0.18, 0.32, 0.46, 0.6, 0.74]
export const CARD_EXIT_SPAN = 0.27 // each card exits at enter + this

// u (STATS-local, 0..1) at which a card given this entry time is dead-center
// front — theta = 0.
export function cardFrontU(enter) {
  return enter + CARD_THETA0 / CARD_SWEEP
}

// Midpoints of flat (held) SCENE_KEYS segments for the given scene numbers —
// used below for scenes that have no overlay copy of their own (so there's
// no *_inEnd to snap to; the shape itself is the beat).
function sceneHoldMidpoints(scenes) {
  const mids = []
  for (let i = 1; i < SCENE_KEYS.length; i++) {
    const [p0, s0] = SCENE_KEYS[i - 1]
    const [p1, s1] = SCENE_KEYS[i]
    if (s0 === s1 && scenes.includes(s0)) mids.push((p0 + p1) / 2)
  }
  return mids
}

// Every readable beat inside the cinematic track, as global (0..1) progress
// fractions — consumed by useSnapScroll so a glide never settles somewhere
// half-faded. Combines: scene holds with no overlay of their own (strands,
// funnel, mesh, black hole), each feature card's front-facing moment, and
// the fully-visible point of the Growth/Ecosystem overlays.
export const TRACK_SNAPS = [
  ...sceneHoldMidpoints([1, 2, 3, 6]),
  ...CARD_ENTERS.map(
    (enter) => STATS.start + cardFrontU(enter) * (STATS.end - STATS.start),
  ),
  GROWTH.inEnd,
  ECO.inEnd,
].sort((a, b) => a - b)
