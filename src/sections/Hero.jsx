import { motion, useTransform } from 'framer-motion'
import { HERO } from '../scrollMap.js'

// Scene 0 — headline centered inside the particle ring; fades while the
// ring splits into the two strands.
export default function Hero({ progress }) {
  // NOTE: keyframes must span the full 0..1 range — framer may hand these off
  // to a native ScrollTimeline, which appends an implicit keyframe at offset 1
  // using the element's base value if the range ends early (hero would fade
  // back in across the rest of the page).
  const opacity = useTransform(
    progress,
    [0, HERO.holdEnd, HERO.fadeStart, HERO.fadeEnd, 1],
    [1, 1, 1, 0, 0],
  )
  const y = useTransform(progress, [0, HERO.fadeEnd, 1], [0, -120, -120])
  const scale = useTransform(progress, [0, HERO.fadeEnd, 1], [1, 0.92, 0.92])
  const pointerEvents = useTransform(opacity, (o) => (o > 0.25 ? 'auto' : 'none'))

  return (
    <motion.section
      className="overlay hero"
      style={{ opacity, y, scale, pointerEvents }}
      aria-label="Intro"
    >
      <div className="hero-inner text-scrim">
        <p className="eyebrow">A new way to study</p>
        <h1 className="headline hero-headline">
          Technology that redefines
          <br />
          the nature of studying
        </h1>
        <p className="sub hero-sub">
          Upload the exact textbook you study in Jordan and it becomes your
          personal AI teacher for every exam.
        </p>
        <div className="btn-row hero-btns">
          <a className="btn btn-primary" href="#top">
            Start studying free <span className="btn-orb">→</span>
          </a>
          <a className="btn btn-ghost" href="#top">
            See how it works
          </a>
        </div>
      </div>
    </motion.section>
  )
}
