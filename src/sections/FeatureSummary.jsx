import { motion } from 'framer-motion'
import { FEATURES } from '../data/features.js'
import { useLang } from '../context/LangContext.jsx'

// Always-legible recap of the six features — visible on the second screen,
// well before the cinematic orbit sequence (Stats.jsx) plays them out later
// as reinforcement. A visitor who never scrolls that far still gets the
// full picture here.
export default function FeatureSummary() {
  const { t } = useLang()

  return (
    <section className="static-section features-summary" id="features" aria-label="What you get">
      <div className="static-inner">
        <p className="eyebrow">{t.featuresEyebrow}</p>
        <h2 className="headline static-headline">{t.featuresHeadline}</h2>
        <p className="sub static-sub">{t.featuresSub}</p>

        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <motion.article
              className="glass feature-card"
              key={f.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="stat-head">
                <h3 className="stat-name">{f.name}</h3>
                <span className="stat-stat">{f.stat}</span>
              </div>
              <div className="stat-divider" />
              <p className="stat-copy">{f.copy}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
