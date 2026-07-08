import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// ILMAK has no backend yet, so this captures interest locally in the UI and
// gives honest feedback instead of pointing every CTA at a dead "#top" link.
// TODO: wire `onSubmit` to a real waitlist endpoint (e.g. Supabase, Formspree)
// once the backend exists — right now the email never leaves the browser.
export default function WaitlistModal({ open, onClose }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitted

  useEffect(() => {
    if (!open) return undefined
    setStatus('idle')
    setEmail('')
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('submitted')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="glass modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="waitlist-title"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Close"
              type="button"
            >
              ✕
            </button>

            {status === 'idle' ? (
              <>
                <p className="eyebrow modal-eyebrow">ILMAK is in beta</p>
                <h3 id="waitlist-title" className="modal-title">
                  Join the waitlist
                </h3>
                <p className="modal-copy">
                  ILMAK hasn't launched yet. Leave your email and we'll notify
                  you the moment your Tawjihi subjects go live — early joiners
                  keep beta pricing for good.
                </p>
                <form className="modal-form" onSubmit={handleSubmit}>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Email address"
                    className="modal-input"
                  />
                  <button type="submit" className="btn btn-primary modal-submit">
                    Notify me <span className="btn-orb">→</span>
                  </button>
                </form>
              </>
            ) : (
              <>
                <p className="eyebrow modal-eyebrow">You're on the list</p>
                <h3 className="modal-title">Thanks — check your inbox</h3>
                <p className="modal-copy">
                  We'll email {email} as soon as ILMAK opens up. In the
                  meantime, feel free to keep exploring.
                </p>
                <button
                  type="button"
                  className="btn btn-ghost modal-submit"
                  onClick={onClose}
                >
                  Close
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
