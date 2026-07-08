import { motion } from 'framer-motion'

// A concrete look at the product — the rest of the page is atmosphere and
// particles; this is the one place a visitor sees what they'd actually use.
// Built as a labelled illustrative mock (not a real screenshot) since the
// product hasn't shipped yet — honest framing beats a fake screenshot.
export default function ProductPreview() {
  return (
    <section className="static-section product-preview" id="preview" aria-label="Product preview">
      <div className="static-inner">
        <p className="eyebrow">See it in action</p>
        <h2 className="headline static-headline">What studying with ILMAK looks like</h2>
        <p className="sub static-sub">
          An early look at the AI Tutor and flashcard flow — built from your
          own textbook, not a generic answer engine.
        </p>

        <div className="preview-grid">
          <motion.div
            className="glass preview-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="preview-label">AI Tutor</p>
            <div className="mock-chat">
              <div className="mock-bubble mock-bubble-user">
                Explain question 4 from chapter 3, page 52
              </div>
              <div className="mock-bubble mock-bubble-ai">
                From your textbook, page 52 covers Newton's second law.
                Question 4 asks you to find acceleration when F = 12N and
                m = 3kg — so a = F/m = 4 m/s².
              </div>
            </div>
          </motion.div>

          <motion.div
            className="glass preview-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="preview-label">Flashcards</p>
            <div className="mock-flashcard">
              <p className="mock-flash-term">Newton's Second Law</p>
              <div className="stat-divider" />
              <p className="mock-flash-def">F = m × a — force equals mass times acceleration.</p>
              <span className="mock-flash-tag">Chapter 3 · Page 52</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
