import { motion, useTransform } from 'framer-motion'
import { useLang } from '../context/LangContext.jsx'

// Manual escape hatch out of the cinematic scroll, for anyone who wants the
// information over the experience — complements prefers-reduced-motion
// (which only helps users who've set that OS-level).
export default function SkipIntro({ progress, lenisRef }) {
  const { t } = useLang()
  const opacity = useTransform(progress, [0, 0.03, 0.9, 0.97], [0, 1, 1, 0])
  const pointerEvents = useTransform(opacity, (o) => (o > 0.25 ? 'auto' : 'none'))

  // Lenis intercepts native anchor-scroll while active, so drive it directly
  // instead of relying on the browser's default `href="#preview"` jump.
  const handleClick = (e) => {
    const lenis = lenisRef?.current
    if (!lenis) return
    e.preventDefault()
    lenis.scrollTo('#preview')
  }

  return (
    <motion.a
      href="#preview"
      className="skip-intro glass"
      style={{ opacity, pointerEvents }}
      onClick={handleClick}
    >
      {t.skipIntro}
    </motion.a>
  )
}
