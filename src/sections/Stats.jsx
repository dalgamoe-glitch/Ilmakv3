import { useEffect, useState } from 'react'
import {
  motion,
  useReducedMotion,
  useSpring,
  useTime,
  useTransform,
  useVelocity,
} from 'framer-motion'
import { STATS } from '../scrollMap.js'
import { FEATURES } from '../data/features.js'

// Scene 4 — feature cards orbiting the DNA helix in 3D.
// Each card materializes near front-center, then sweeps outward and back
// (dimming, shrinking, tilting) while the next one enters. Card text
// carries a scroll-velocity echo (a ghost copy that trails while
// scrubbing and collapses at rest).

// Six feature cards, one per ILMAK selling point. Choreography contract
// (keeps every pair of visible cards from ever overlapping):
//  - enters are 0.14u apart; each card exits at enter+0.27, so cards i and
//    i+2 — which share a vertical band — are never visible together;
//  - consecutive cards alternate top (y0 < 0) / bottom (y0 > 0) bands whose
//    rects can't intersect vertically (band offset 142 > cardHeight/2 + bob
//    + rotateZ bleed), and perspective scales offset and size together, so
//    the bands never cross at any orbit angle;
//  - front moment (theta = 0) lands at enter + theta0/sweep ≈ enter + 0.13.
// Orbit choreography per card, merged with the shared FEATURES copy below.
const CHOREOGRAPHY = [
  { enter: 0.04, exit: 0.31, theta0: 0.42, sweep: 3.2, y0: -142, rz: -1, phase: 0 },
  { enter: 0.18, exit: 0.45, theta0: 0.42, sweep: 3.2, y0: 142, rz: 1, phase: 2.1 },
  { enter: 0.32, exit: 0.59, theta0: 0.42, sweep: 3.2, y0: -142, rz: 0.8, phase: 4.2 },
  { enter: 0.46, exit: 0.73, theta0: 0.42, sweep: 3.2, y0: 142, rz: -0.8, phase: 1.3 },
  { enter: 0.6, exit: 0.87, theta0: 0.42, sweep: 3.2, y0: -142, rz: 1, phase: 3.4 },
  // exit: 2 — the section fade-out retires this last card instead of an orbit exit
  { enter: 0.74, exit: 2, theta0: 0.42, sweep: 3.2, y0: 142, rz: -1, phase: 5.1 },
]

const CARDS = FEATURES.map((feature, i) => ({ ...feature, ...CHOREOGRAPHY[i] }))

const smooth = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}

const cardTheta = (card, u) => card.theta0 - card.sweep * Math.max(u - card.enter, 0)

function CardBody({ card }) {
  return (
    <>
      <div className="stat-head">
        <h3 className="stat-name">{card.name}</h3>
        <span className="stat-stat">{card.stat}</span>
      </div>
      <div className="stat-divider" />
      <p className="stat-copy">{card.copy}</p>
    </>
  )
}

function OrbitCard({ card, u, time, echoPx, radius, laneScale }) {
  const transform = useTransform([u, time], ([uv, tv]) => {
    const th = cardTheta(card, uv)
    const bob = Math.sin((tv / 1000) * 0.7 + card.phase) * 4
    const x = radius * Math.sin(th)
    const y = card.y0 * laneScale + bob
    const z = radius * (Math.cos(th) - 1)
    const ry = -th * 0.55
    const rz = card.rz + Math.sin((tv / 1000) * 0.5 + card.phase) * 0.6
    return (
      `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ` +
      `${z.toFixed(1)}px) rotateY(${ry.toFixed(3)}rad) rotateZ(${rz.toFixed(2)}deg)`
    )
  })

  // NOTE: the wrapper must stay free of CSS `filter`, and its opacity must
  // be exactly 1 at the front — an ancestor filter (even blur(0)) or
  // opacity < 1 creates a new backdrop root, which cuts the card's
  // backdrop-filter off from the particle canvas and kills the frosting.
  const opacity = useTransform(u, (uv) => {
    const th = cardTheta(card, uv)
    const depth = 0.45 + 0.55 * Math.pow(Math.max(Math.cos(th), 0), 1.2)
    const entered = smooth(card.enter, card.enter + 0.07, uv)
    const exited = 1 - smooth(card.exit - 0.08, card.exit, uv)
    const o = depth * entered * exited
    return o > 0.985 ? 1 : o
  })

  // entry + depth blur live on the inner content, where they can't break
  // the glass backdrop chain
  const innerFilter = useTransform(u, (uv) => {
    const th = cardTheta(card, uv)
    const d = (1 - Math.cos(th)) / 2
    const entry = 1 - smooth(card.enter, card.enter + 0.07, uv)
    const blur = d * 2.0 + entry * 8
    const bright = 1 - 0.25 * d
    return `blur(${blur.toFixed(2)}px) brightness(${bright.toFixed(3)})`
  })

  const zIndex = useTransform(u, (uv) =>
    Math.round(60 + Math.cos(cardTheta(card, uv)) * 40),
  )

  const echoO = useTransform(echoPx, (v) => Math.min(Math.abs(v) / 16, 1) * 0.4)

  return (
    <motion.div className="orbit-card" style={{ transform, opacity, zIndex }}>
      <article className="glass stat-card">
        <motion.div className="card-inner" style={{ filter: innerFilter }}>
          <CardBody card={card} />
          <motion.div
            className="card-echo"
            style={{ x: echoPx, opacity: echoO }}
            aria-hidden="true"
          >
            <CardBody card={card} />
          </motion.div>
        </motion.div>
      </article>
    </motion.div>
  )
}

export default function Stats({ progress }) {
  const reducedMotion = useReducedMotion()
  const time = useTime()

  // keyframes span 0..1 — see the ScrollTimeline note in Hero.jsx
  const opacity = useTransform(
    progress,
    [0, STATS.start, STATS.inEnd, STATS.outStart, STATS.end, 1],
    [0, 0, 1, 1, 0, 0],
  )
  const pointerEvents = useTransform(opacity, (o) => (o > 0.25 ? 'auto' : 'none'))
  const u = useTransform(progress, [STATS.start, STATS.end], [0, 1])

  // scroll-velocity → text-echo offset (px); collapses to 0 at rest
  const velocity = useVelocity(progress)
  const velocitySmooth = useSpring(velocity, { stiffness: 220, damping: 36 })
  const echoPx = useTransform(velocitySmooth, (v) =>
    Math.max(-16, Math.min(16, v * 240)),
  )

  // narrow screens compress the orbit sideways, so the y-bands spread out
  // instead — keeps the top/bottom bands clearly separated
  const measure = () => {
    const radius = Math.min(480, window.innerWidth * 0.42)
    const spread = radius < 340 ? 1.3 : 1
    return {
      radius,
      laneScale: Math.min(1, window.innerHeight / 760) * spread,
    }
  }
  const [dims, setDims] = useState(() =>
    typeof window !== 'undefined' ? measure() : { radius: 480, laneScale: 1 },
  )
  useEffect(() => {
    const onResize = () => setDims(measure())
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  if (reducedMotion) {
    // static pinned layout, no orbit or echoes — three representative cards
    return (
      <motion.section
        className="overlay stats"
        style={{ opacity, pointerEvents }}
        aria-label="ILMAK features"
      >
        <div className="stat-pos stat-left">
          <article className="glass stat-card stat-tilt-left">
            <div className="card-inner">
              <CardBody card={CARDS[0]} />
            </div>
          </article>
        </div>
        <div className="stat-pos stat-right">
          <article className="glass stat-card stat-tilt-right">
            <div className="card-inner">
              <CardBody card={CARDS[2]} />
            </div>
          </article>
        </div>
        <div className="stat-pos stat-bottom">
          <article className="glass stat-card stat-tilt-left">
            <div className="card-inner">
              <CardBody card={CARDS[3]} />
            </div>
          </article>
        </div>
      </motion.section>
    )
  }

  return (
    <motion.section
      className="overlay stats"
      style={{ opacity, pointerEvents }}
      aria-label="ILMAK features"
    >
      {CARDS.map((card) => (
        <OrbitCard
          key={card.name}
          card={card}
          u={u}
          time={time}
          echoPx={echoPx}
          radius={dims.radius}
          laneScale={dims.laneScale}
        />
      ))}
    </motion.section>
  )
}
