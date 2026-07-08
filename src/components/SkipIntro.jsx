import { motion, useTransform } from 'framer-motion'

// Manual escape hatch out of the cinematic scroll, for anyone who wants the
// information over the experience — complements prefers-reduced-motion
// (which only helps users who've set that OS-level).
export default function SkipIntro({ progress }) {
  const opacity = useTransform(progress, [0, 0.03, 0.9, 0.97], [0, 1, 1, 0])
  const pointerEvents = useTransform(opacity, (o) => (o > 0.25 ? 'auto' : 'none'))

  return (
    <motion.a
      href="#preview"
      className="skip-intro glass"
      style={{ opacity, pointerEvents }}
    >
      Skip to details ↓
    </motion.a>
  )
}
