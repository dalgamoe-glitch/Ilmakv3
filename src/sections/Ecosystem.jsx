import { motion, useTransform } from 'framer-motion'

// Scene 5 — galaxy scene: headline above, copy + CTAs below the core.
export default function Ecosystem({ progress }) {
  // keyframes span 0..1 — see the ScrollTimeline note in Hero.jsx
  const opacity = useTransform(
    progress,
    [0, 0.86, 0.92, 1],
    [0, 0, 1, 1],
  )
  const pointerEvents = useTransform(opacity, (o) => (o > 0.25 ? 'auto' : 'none'))
  const yTop = useTransform(progress, [0, 0.86, 1], [90, 90, 0])
  const yBottom = useTransform(progress, [0, 0.88, 1], [70, 70, 0])

  return (
    <motion.section
      className="overlay ecosystem"
      style={{ opacity, pointerEvents }}
      aria-label="The ILMAK ecosystem"
    >
      <motion.div className="eco-top" style={{ y: yTop }}>
        <p className="eyebrow">
          <span className="num">03</span>
          <span className="rule" />
          Your study universe
        </p>
        <h2 className="headline eco-headline">
          A universe of study tools —
          <br />
          already in motion
        </h2>
      </motion.div>

      <motion.div className="eco-bottom" style={{ y: yBottom }}>
        <p className="sub eco-sub">
          ILMAK is not a single chatbot. It&rsquo;s a living study ecosystem
          with your textbook at its core — AI Teacher, flashcards, quizzes,
          summaries, and a worksheet solver orbiting around you.
        </p>
        <div className="btn-row eco-btns">
          <a className="btn btn-primary" href="#top">
            Explore the ecosystem <span className="btn-orb">→</span>
          </a>
          <a className="btn btn-ghost" href="#top">
            View all tools
          </a>
        </div>
      </motion.div>
    </motion.section>
  )
}
