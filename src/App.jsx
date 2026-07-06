import ParticleScene from './three/ParticleScene.jsx'
import { useScrollProgress } from './hooks/useScrollProgress.js'
import Navbar from './sections/Navbar.jsx'
import Hero from './sections/Hero.jsx'
import Stats from './sections/Stats.jsx'
import Growth from './sections/Growth.jsx'
import Ecosystem from './sections/Ecosystem.jsx'
import Footer from './sections/Footer.jsx'
import './styles/sections.css'

export default function App() {
  const progress = useScrollProgress()

  return (
    <div id="top">
      {/* 700vh scroll track drives the whole voyage */}
      <div className="scroll-track" aria-hidden="true" />

      <div className="nebula" aria-hidden="true" />
      <ParticleScene progress={progress} />

      <Navbar progress={progress} />
      <Hero progress={progress} />
      <Stats progress={progress} />
      <Growth progress={progress} />
      <Ecosystem progress={progress} />
      <Footer progress={progress} />
    </div>
  )
}
