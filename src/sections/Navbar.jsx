import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Floating frosted pill nav — the section label morphs as you travel.
const LABELS = [
  [0.0, 'ORIGIN'],
  [0.24, 'STRUCTURE'],
  [0.46, 'FLOW'],
  [0.68, 'VOYAGE'],
  [0.84, 'COSMOS'],
]

const LINKS = ['Product', 'Solutions', 'Pricing', 'Docs']

export default function Navbar({ progress }) {
  const [label, setLabel] = useState('ORIGIN')

  useEffect(() => {
    const update = (p) => {
      let next = LABELS[0][1]
      for (const [at, name] of LABELS) if (p >= at) next = name
      setLabel((prev) => (prev === next ? prev : next))
    }
    update(progress.get())
    return progress.on('change', update)
  }, [progress])

  return (
    <header className="nav-wrap">
      <nav className="nav glass" aria-label="Main">
        <a className="nav-logo" href="#top" aria-label="ILMAK home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#A78BFA" />
                <stop offset="1" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            <path
              d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7L12 2.5Z"
              stroke="url(#lg)"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M12 7.5v9M8.2 9.6l7.6 4.8M15.8 9.6l-7.6 4.8"
              stroke="url(#lg)"
              strokeWidth="1.1"
              opacity="0.7"
            />
          </svg>
        </a>

        <div className="nav-section" aria-hidden="true">
          <span className="nav-dot" />
          <span className="nav-label-slot">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={label}
                className="nav-label"
                initial={{ y: 12, opacity: 0, filter: 'blur(4px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: -12, opacity: 0, filter: 'blur(4px)' }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                {label}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>

        <ul className="nav-links">
          {LINKS.map((l) => (
            <li key={l}>
              <a href="#top">{l}</a>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <a className="nav-signin" href="#top">
            Sign in
          </a>
          <a className="btn btn-primary nav-cta" href="#top">
            Get started <span className="btn-orb">→</span>
          </a>
        </div>
      </nav>
    </header>
  )
}
