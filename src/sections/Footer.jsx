import { useLang } from '../context/LangContext.jsx'

// Real, working in-page navigation instead of a bare tagline. Contact/legal
// links are intentionally omitted until there's a real inbox/policy to point
// to — a footer link that goes nowhere is worse than no link at all.
const FOOTER_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Proof', href: '#proof' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export default function Footer() {
  const { t, toggleLang } = useLang()

  return (
    <footer className="site-footer static-footer" aria-label="Footer">
      <div className="footer-inner">
        <div className="footer-row">
          <p className="footer-brand">
            ILMAK <span className="footer-arabic">علمك</span>
          </p>
          <nav className="footer-nav" aria-label="Footer navigation">
            {FOOTER_LINKS.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          <button type="button" className="footer-lang" onClick={toggleLang}>
            {t.langToggleLabel}
          </button>
        </div>
        <p className="footer-tagline">{t.footerTagline}</p>
        <p className="footer-fine">
          © {new Date().getFullYear()} ILMAK, an AI study ecosystem for
          students across Jordan and the Arab region.
        </p>
      </div>
    </footer>
  )
}
