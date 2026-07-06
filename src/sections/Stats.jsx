import { motion, useTransform } from 'framer-motion'

// Scene 2 — frosted stat cards floating in 3D beside the helix.
export default function Stats({ progress }) {
  // keyframes span 0..1 — see the ScrollTimeline note in Hero.jsx
  const opacity = useTransform(
    progress,
    [0, 0.24, 0.3, 0.4, 0.47, 1],
    [0, 0, 1, 1, 0, 0],
  )
  const pointerEvents = useTransform(opacity, (o) => (o > 0.25 ? 'auto' : 'none'))
  const yLeft = useTransform(progress, [0, 0.24, 0.47, 1], [90, 90, -110, -110])
  const yRight = useTransform(progress, [0, 0.24, 0.47, 1], [140, 140, -70, -70])

  return (
    <motion.section
      className="overlay stats"
      style={{ opacity, pointerEvents }}
      aria-label="ILMAK in numbers"
    >
      <motion.div className="stat-pos stat-left" style={{ y: yLeft }}>
        <article className="glass stat-card stat-tilt-left">
          <p className="stat-eyebrow">
            <span className="nav-dot" /> LEARNING
          </p>
          <p className="stat-figure">10+</p>
          <div className="stat-divider" />
          <h3 className="stat-title">Connected study tools</h3>
          <p className="stat-copy">
            From AI Teacher to Worksheet Solver — flashcards, quizzes,
            summaries and focus tools in one environment.
          </p>
        </article>
      </motion.div>

      <motion.div className="stat-pos stat-right" style={{ y: yRight }}>
        <article className="glass stat-card stat-tilt-right">
          <p className="stat-eyebrow">
            <span className="nav-dot" /> STUDENTS
          </p>
          <p className="stat-figure">12–18</p>
          <div className="stat-divider" />
          <h3 className="stat-title">Built for school students</h3>
          <p className="stat-copy">
            Arabic and English curricula across Jordan and the wider Arab
            region — grounded in your own textbook.
          </p>
        </article>
      </motion.div>
    </motion.section>
  )
}
