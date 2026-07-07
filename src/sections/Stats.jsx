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

// Scene 4 — frosted stat cards orbiting the DNA helix in 3D.
// Each card materializes near front-center, then sweeps outward and back
// (dimming, shrinking, tilting) while the next one enters — matching the
// reference clip. Card text carries a scroll-velocity echo (ghost copies
// that trail while scrubbing and collapse at rest).

const CARDS = [
  {
    eyebrow: 'AI TEACHER',
    figure: '24/7',
    title: 'Your private AI teacher',
    copy: 'Ask anything about your exact lesson — it answers from your own textbook, in Arabic or English, even at 2am before the exam.',
    enter: 0.06, // u (0..1 inside the stats window) where the card materializes
    exit: 0.64, // hands off just before card 2 reaches the front
    theta0: 0.35, // orbit angle at entry (0 = front center, +x = right)
    sweep: 1.7, // radians swept over the rest of the window (to the left/back)
    y0: 30,
    rz: -2,
    phase: 0,
  },
  {
    eyebrow: 'FLASHCARDS & QUIZZES',
    figure: '1 tap',
    title: 'Revision that makes itself',
    copy: 'Every lesson becomes flashcards, quizzes and keynotes automatically — hours of prep done before you even sit down.',
    enter: 0.28,
    exit: 2,
    theta0: 0.8,
    sweep: 2.9, // clears the front before card 3 arrives
    y0: -20,
    rz: 2,
    phase: 2.1,
  },
  {
    eyebrow: 'WORKSHEET SOLVER',
    figure: 'A+',
    title: 'Every step, explained',
    copy: 'Snap any worksheet or past paper and get full step-by-step solutions you actually understand — not just the final answer.',
    enter: 0.42,
    exit: 2,
    theta0: 0.85,
    sweep: 2.2, // front moment lands before the section fade-out begins
    y0: -150,
    rz: 3,
    phase: 4.2,
  },
]

const smooth = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}

const cardTheta = (card, u) => card.theta0 - card.sweep * Math.max(u - card.enter, 0)

function CardBody({ card }) {
  return (
    <>
      <p className="stat-eyebrow">
        <span className="nav-dot" /> {card.eyebrow}
      </p>
      <p className="stat-figure">{card.figure}</p>
      <div className="stat-divider" />
      <h3 className="stat-title">{card.title}</h3>
      <p className="stat-copy">{card.copy}</p>
    </>
  )
}

function OrbitCard({ card, u, time, echoPx, radius, laneScale }) {
  const transform = useTransform([u, time], ([uv, tv]) => {
    const th = cardTheta(card, uv)
    const bob = Math.sin((tv / 1000) * 0.7 + card.phase) * 6
    const x = radius * Math.sin(th)
    const y = card.y0 * laneScale + bob
    const z = radius * (Math.cos(th) - 1)
    const ry = -th * 0.55
    const rz = card.rz + Math.sin((tv / 1000) * 0.5 + card.phase) * 1
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

  const echoO = useTransform(echoPx, (v) => Math.min(Math.abs(v) / 16, 1) * 0.5)
  const echoPx2 = useTransform(echoPx, (v) => v * 1.9)
  const echoO2 = useTransform(echoO, (o) => o * 0.5)

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
          <motion.div
            className="card-echo card-echo-far"
            style={{ x: echoPx2, opacity: echoO2 }}
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

  // narrow screens compress the orbit sideways, so the y-lanes spread out
  // instead — keeps a receding card from stacking on the front one
  const measure = () => {
    const radius = Math.min(480, window.innerWidth * 0.42)
    const spread = radius < 340 ? 1.5 : 1
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
    // static pinned layout, no orbit or echoes
    return (
      <motion.section
        className="overlay stats"
        style={{ opacity, pointerEvents }}
        aria-label="ILMAK in numbers"
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
              <CardBody card={CARDS[1]} />
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
      aria-label="ILMAK in numbers"
    >
      {CARDS.map((card) => (
        <OrbitCard
          key={card.figure}
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
