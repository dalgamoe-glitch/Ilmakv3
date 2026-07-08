import { useState } from 'react'
import { motion } from 'framer-motion'

const QUESTIONS = [
  {
    q: 'What subjects and grades does ILMAK cover?',
    a: 'ILMAK is built around the Jordanian Tawjihi curriculum, starting with Mathematics, Physics, Chemistry, Biology, Arabic and English. Coverage is expanding through beta.',
  },
  {
    q: 'Does it work in Arabic?',
    a: "Yes — the AI Tutor answers in Arabic or English, whichever you ask in, and the interface is available in both languages.",
  },
  {
    q: 'How much will it cost?',
    a: "ILMAK is free during beta. Anyone who joins before launch keeps their early rate locked in once pricing goes live.",
  },
  {
    q: 'What do I need to use it?',
    a: 'Any phone, tablet, or computer with a browser — just upload a photo or PDF of your textbook page to get started.',
  },
  {
    q: 'When does it launch?',
    a: "We're onboarding subjects gradually through beta. Join the waitlist and we'll email you the moment your subjects are ready.",
  },
]

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className="glass faq-item">
      <button
        type="button"
        className="faq-question"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        {item.q}
        <span className="faq-icon" aria-hidden="true">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      {isOpen && (
        <motion.p
          className="faq-answer"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {item.a}
        </motion.p>
      )}
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="static-section faq" id="faq" aria-label="Frequently asked questions">
      <div className="static-inner">
        <p className="eyebrow">Questions</p>
        <h2 className="headline static-headline">Frequently asked questions</h2>

        <div className="faq-list">
          {QUESTIONS.map((item, i) => (
            <FAQItem
              key={item.q}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
