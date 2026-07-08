import { useLang } from '../context/LangContext.jsx'

// A titled beat over the animated particle field, on the second screen. The
// six features are played out later by the cinematic orbit sequence
// (Stats.jsx); here we just set them up with the headline so a visitor who
// never scrolls that far still gets the positioning.
export default function FeatureSummary() {
  const { t } = useLang()

  return (
    <section className="static-section features-summary" id="features" aria-label="What you get">
      <div className="static-inner">
        <p className="eyebrow">{t.featuresEyebrow}</p>
        <h2 className="headline static-headline">{t.featuresHeadline}</h2>
        <p className="sub static-sub">{t.featuresSub}</p>
      </div>
    </section>
  )
}
