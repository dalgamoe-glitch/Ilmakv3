import { motion, useTransform } from 'framer-motion'

// Compact footer that settles in at the very end of the voyage.
export default function Footer({ progress }) {
  // keyframes span 0..1 — see the ScrollTimeline note in Hero.jsx
  const opacity = useTransform(progress, [0, 0.965, 0.995, 1], [0, 0, 1, 1])
  const pointerEvents = useTransform(opacity, (o) => (o > 0.25 ? 'auto' : 'none'))

  return (
    <motion.footer
      className="site-footer"
      style={{ opacity, pointerEvents }}
      aria-label="Footer"
    >
      <div className="footer-inner">
        <p className="footer-brand">
          ILMAK <span className="footer-arabic">علمك</span>
        </p>
        <p className="footer-tagline">
          Upload your book. Understand your lessons. Study with confidence.
        </p>
        <p className="footer-fine">
          © {new Date().getFullYear()} ILMAK — an AI study ecosystem for
          students across Jordan and the Arab region.
        </p>
      </div>
    </motion.footer>
  )
}
