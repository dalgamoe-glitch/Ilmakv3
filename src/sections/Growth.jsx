import { motion, useTransform } from 'framer-motion'
import { GROWTH } from '../scrollMap.js'

// Scene 5 — headline left, supporting copy + CTAs right, above the terrain.
export default function Growth({ progress }) {
  // keyframes span 0..1 — see the ScrollTimeline note in Hero.jsx
  const opacity = useTransform(
    progress,
    [0, GROWTH.start, GROWTH.inEnd, GROWTH.outStart, GROWTH.end, 1],
    [0, 0, 1, 1, 0, 0],
  )
  const pointerEvents = useTransform(opacity, (o) => (o > 0.25 ? 'auto' : 'none'))
  const yLeft = useTransform(
    progress,
    [0, GROWTH.start, GROWTH.end, 1],
    [110, 110, -130, -130],
  )
  const yRight = useTransform(
    progress,
    [0, GROWTH.start, GROWTH.end, 1],
    [70, 70, -170, -170],
  )

  return (
    <motion.section
      className="overlay growth"
      style={{ opacity, pointerEvents }}
      aria-label="Why ILMAK"
    >
      <motion.div className="growth-left text-scrim" style={{ y: yLeft }}>
        <p className="eyebrow left">
          <span className="num">02</span>
          <span className="rule" />
          The pull of understanding
        </p>
        <h2 className="headline growth-headline">
          Everything revolves around
          <br />
          one thing — your understanding
        </h2>
      </motion.div>

      <motion.div className="growth-right text-scrim" style={{ y: yRight }}>
        <p className="sub growth-sub">
          Hundreds of pages. One centre of gravity. We turn the noise of a big
          textbook into a focused study session for your exact lesson.
        </p>
        <div className="btn-row">
          <a className="btn btn-primary" href="#top">
            Start studying free <span className="btn-orb">→</span>
          </a>
          <a className="btn btn-ghost" href="#top">
            See ILMAK in action
          </a>
        </div>
      </motion.div>
    </motion.section>
  )
}
