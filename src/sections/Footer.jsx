import { useLang } from '../context/LangContext.jsx'

// Real, working in-page navigation instead of a bare tagline. Contact/legal
// links are intentionally omitted until there's a real inbox/policy to point
// to — a footer link that goes nowhere is worse than no link at all.
// Hrefs pair positionally with t.navLinks (see LangContext.jsx) so the labels
// stay localized when toggleLang flips the language.
const FOOTER_HREFS = ['#features', '#proof', '#pricing', '#faq']

export default function Footer() {
  const { t, toggleLang } = useLang()
  const footerLinks = t.navLinks.map((label, i) => ({ label, href: FOOTER_HREFS[i] }))

  return (
    <footer className="site-footer static-footer" aria-label="Footer">
      <div className="footer-inner">
        <div className="footer-row">
          <p className="footer-brand">
            ILMAK <span className="footer-arabic">علمك</span>
          </p>
          <nav className="footer-nav" aria-label="Footer navigation">
            {footerLinks.map((l) => (
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
