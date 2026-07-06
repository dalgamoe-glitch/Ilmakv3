import { useEffect } from 'react'
import { useScroll } from 'framer-motion'
import Lenis from 'lenis'

// Smooth (Lenis) scrolling + a 0..1 MotionValue of page progress.
export function useScrollProgress() {
  const { scrollYProgress } = useScroll()

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
    let raf = 0
    const tick = (time) => {
      lenis.raf(time)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

  return scrollYProgress
}
