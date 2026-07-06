import { motion, useTransform } from 'framer-motion'

// Scene 1 — headline centered inside the particle ring.
export default function Hero({ progress }) {
  // NOTE: keyframes must span the full 0..1 range — framer may hand these off
  // to a native ScrollTimeline, which appends an implicit keyframe at offset 1
  // using the element's base value if the range ends early (hero would fade
  // back in across the rest of the page).
  const opacity = useTransform(
    progress,
    [0, 0.02, 0.09, 0.15, 1],
    [1, 1, 1, 0, 0],
  )
  const y = useTransform(progress, [0, 0.15, 1], [0, -120, -120])
  const scale = useTransform(progress, [0, 0.15, 1], [1, 0.92, 0.92])
  const pointerEvents = useTransform(opacity, (o) => (o > 0.25 ? 'auto' : 'none'))

  return (
    <motion.section
      className="overlay hero"
      style={{ opacity, y, scale, pointerEvents }}
      aria-label="Intro"
    >
      <div className="hero-inner text-scrim">
        <p className="eyebrow">
          <span className="num">01</span>
          <span className="rule" />
          Welcome to a new way to study
        </p>
        <h1 className="headline hero-headline">
          Technology that redefines
          <br />
          the nature of studying
        </h1>
        <p className="sub hero-sub">
          ILMAK builds your study ecosystem at the intersection of your
          textbook, AI, and understanding — upload your book, understand your
          lessons, study with confidence.
        </p>
        <div className="btn-row hero-btns">
          <a className="btn btn-primary" href="#top">
            Get started <span className="btn-orb">→</span>
          </a>
          <a className="btn btn-ghost" href="#top">
            See how it works
          </a>
        </div>
      </div>
    </motion.section>
  )
}
