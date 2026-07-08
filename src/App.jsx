import { useEffect, useRef } from 'react'
import ParticleScene from './three/ParticleScene.jsx'
import { useScrollProgress } from './hooks/useScrollProgress.js'
import { useSnapScroll } from './hooks/useSnapScroll.js'
import { WaitlistProvider, useWaitlist } from './context/WaitlistContext.jsx'
import { LangProvider, useLang } from './context/LangContext.jsx'
import WaitlistModal from './components/WaitlistModal.jsx'
import SkipIntro from './components/SkipIntro.jsx'
import Hero from './sections/Hero.jsx'
import FeatureSummary from './sections/FeatureSummary.jsx'
import Stats from './sections/Stats.jsx'
import Growth from './sections/Growth.jsx'
import Ecosystem from './sections/Ecosystem.jsx'
import ProductPreview from './sections/ProductPreview.jsx'
import Proof from './sections/Proof.jsx'
import Pricing from './sections/Pricing.jsx'
import FAQ from './sections/FAQ.jsx'
import Footer from './sections/Footer.jsx'
import './styles/sections.css'

function AppShell() {
  const trackRef = useRef(null)
  const { progress, lenisRef } = useScrollProgress(trackRef)
  const { open, closeWaitlist } = useWaitlist()
  const { t } = useLang()

  useSnapScroll({ trackRef, lenisRef, enabled: !open })

  useEffect(() => {
    document.documentElement.dir = t.dir
  }, [t.dir])

  return (
    <div id="top">
      <div className="nebula" aria-hidden="true" />
      <ParticleScene progress={progress} />

      {/* Static, always-visible: message lands in the first two screens
          without requiring any scroll into the cinematic track below. */}
      <Hero lenisRef={lenisRef} />
      <FeatureSummary />

      {/* Cinematic track — scroll progress is scoped to this element via
          trackRef, so it plays out identically regardless of the static
          content before/after it (see useScrollProgress.js). Stats/Growth/
          Ecosystem are `position: fixed` overlays, so they don't need to be
          visually nested inside the spacer to be driven by its scroll range. */}
      <div className="scroll-track" ref={trackRef} aria-hidden="true" />
      <Stats progress={progress} />
      <Growth progress={progress} />
      <Ecosystem progress={progress} />
      <SkipIntro progress={progress} lenisRef={lenisRef} />

      {/* Static, always-visible: the substance a buyer needs. */}
      <ProductPreview />
      <Proof />
      <Pricing />
      <FAQ />
      <Footer />

      <WaitlistModal open={open} onClose={closeWaitlist} />
    </div>
  )
}

export default function App() {
  return (
    <LangProvider>
      <WaitlistProvider>
        <AppShell />
      </WaitlistProvider>
    </LangProvider>
  )
}
