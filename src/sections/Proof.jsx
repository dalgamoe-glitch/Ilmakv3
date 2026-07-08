import { motion } from 'framer-motion'

// Pre-launch proof: real, verifiable claims only (curriculum scope, how the
// AI is grounded) — no fabricated testimonials or user counts.
const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Arabic',
  'English',
]

export default function Proof() {
  return (
    <section className="static-section proof" id="proof" aria-label="Proof">
      <div className="static-inner">
        <p className="eyebrow">Built for Tawjihi</p>
        <h2 className="headline static-headline">
          Grounded in your exact curriculum, not a generic model
        </h2>
        <p className="sub static-sub">
          ILMAK is being built around the official Jordanian Tawjihi
          textbooks, subject by subject — every answer is traceable back to
          the page you're studying from.
        </p>

        <motion.ul
          className="glass proof-list"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {SUBJECTS.map((s) => (
            <li key={s} className="proof-item">
              {s}
            </li>
          ))}
        </motion.ul>
        <p className="proof-fine">
          Coverage is expanding through beta — join the waitlist to be
          notified as your subjects go live.
        </p>
      </div>
    </section>
  )
}
