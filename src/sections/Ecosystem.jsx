import { motion, useTransform } from 'framer-motion'
import { ECO } from '../scrollMap.js'

// Scene 7 — galaxy scene: headline above, copy + CTAs below the core.
export default function Ecosystem({ progress }) {
  // keyframes span 0..1 — see the ScrollTimeline note in Hero.jsx
  const opacity = useTransform(
    progress,
    [0, ECO.start, ECO.inEnd, 1],
    [0, 0, 1, 1],
  )
  const pointerEvents = useTransform(opacity, (o) => (o > 0.25 ? 'auto' : 'none'))
  const yTop = useTransform(progress, [0, ECO.start, 1], [90, 90, 0])
  const yBottom = useTransform(progress, [0, ECO.start + 0.02, 1], [70, 70, 0])

  return (
    <motion.section
      className="overlay ecosystem"
      style={{ opacity, pointerEvents }}
      aria-label="The ILMAK ecosystem"
    >
      <motion.div className="eco-top text-scrim" style={{ y: yTop }}>
        <h2 className="headline eco-headline">
          A universe of study tools,
          <br />
          already in motion
        </h2>
      </motion.div>

      <motion.div className="eco-bottom text-scrim" style={{ y: yBottom }}>
        <p className="sub eco-sub">
          A complete study ecosystem built around your own textbook: AI
          Tutor, flashcards, quizzes, keynotes and a worksheet solver, all
          orbiting you.
        </p>
        <div className="btn-row eco-btns">
          <a className="btn btn-primary" href="#top">
            Explore the ecosystem <span className="btn-orb">→</span>
          </a>
        </div>
      </motion.div>
    </motion.section>
  )
}
