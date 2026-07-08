import { motion } from 'framer-motion'
import { useWaitlist } from '../context/WaitlistContext.jsx'

// Honest pre-launch pricing: no invented dollar figures for a product that
// hasn't priced itself yet — instead, a clear beta framing plus an incentive
// (locked-in founding pricing) that's true regardless of what the final
// number ends up being.
const TIERS = [
  {
    name: 'Beta',
    price: 'Free',
    period: 'during beta',
    blurb: 'Full access to the AI Tutor, flashcards, and quizzes while we build.',
    cta: 'Join the waitlist',
    highlight: false,
  },
  {
    name: 'Founding Member',
    price: 'Locked-in',
    period: 'launch pricing',
    blurb: 'Join before launch and keep your early rate for as long as you study with us.',
    cta: 'Reserve my spot',
    highlight: true,
  },
]

export default function Pricing() {
  const { openWaitlist } = useWaitlist()

  return (
    <section className="static-section pricing" id="pricing" aria-label="Pricing">
      <div className="static-inner">
        <p className="eyebrow">Early access</p>
        <h2 className="headline static-headline">Simple pricing, locked in early</h2>
        <p className="sub static-sub">
          ILMAK is in beta — final pricing hasn't been set. Join now and your
          rate stays where it starts.
        </p>

        <div className="pricing-grid">
          {TIERS.map((tier, i) => (
            <motion.article
              key={tier.name}
              className={`glass pricing-card${tier.highlight ? ' pricing-card-highlight' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="pricing-name">{tier.name}</p>
              <p className="pricing-price">
                {tier.price} <span className="pricing-period">{tier.period}</span>
              </p>
              <p className="pricing-blurb">{tier.blurb}</p>
              <button type="button" className="btn btn-primary pricing-btn" onClick={openWaitlist}>
                {tier.cta} <span className="btn-orb">→</span>
              </button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
