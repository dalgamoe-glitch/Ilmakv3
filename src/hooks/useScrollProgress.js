import { useEffect, useRef } from 'react'
import { useScroll } from 'framer-motion'
import Lenis from 'lenis'

// Smooth (Lenis) scrolling + a 0..1 MotionValue scoped to the cinematic
// track element (trackRef), not the whole document. Scoping it this way
// means static content can be added before/after the track (hero, pricing,
// FAQ, etc.) without shifting the meaning of any progress fraction used
// throughout scrollMap.js.
//
// Also exposes the Lenis instance (via a ref, since it's created async in an
// effect) so other hooks — namely useSnapScroll — can drive `lenis.scrollTo`
// instead of fighting it with a second smooth-scroll implementation.
export function useScrollProgress(trackRef) {
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  })
  const lenisRef = useRef(null)

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reducedMotion) return undefined

    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenisRef.current = lenis
    let raf = 0
    const tick = (time) => {
      lenis.raf(time)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return { progress: scrollYProgress, lenisRef }
}
