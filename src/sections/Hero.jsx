import { motion } from 'framer-motion'
import { useWaitlist } from '../context/WaitlistContext.jsx'
import { useLang } from '../context/LangContext.jsx'

// Static, always-on hero — no longer gated behind scroll. The particle
// canvas sits idle on the torus formation (scene 0) behind it, so the
// cinematic backdrop is intact but the message is visible immediately.
export default function Hero() {
  const { openWaitlist } = useWaitlist()
  const { t } = useLang()

  return (
    <section className="overlay-static hero" aria-label="Intro">
      <motion.div
        className="hero-inner text-scrim"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="headline hero-headline">
          {t.heroHeadline[0]}
          <br />
          {t.heroHeadline[1]}
        </h1>
        <p className="sub hero-sub">{t.heroSub}</p>
        <div className="btn-row hero-btns">
          <button type="button" className="btn btn-primary" onClick={openWaitlist}>
            {t.ctaPrimary} <span className="btn-orb">→</span>
          </button>
          <a className="btn btn-ghost" href="#features">
            {t.ctaSecondary}
          </a>
        </div>
      </motion.div>
    </section>
  )
}
