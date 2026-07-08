import { useEffect, useRef } from 'react'
import { TRACK_SNAPS } from '../scrollMap.js'

// Sections that sit in normal document flow after the cinematic track —
// each is a snap stop in its own right.
const SECTION_IDS = ['features', 'preview', 'proof', 'pricing', 'faq']

const IDLE_MS = 140
const SNAP_DURATION = 0.85
const ALREADY_THERE_PX = 2

// "Glide to nearest on stop": once scrolling has been idle for IDLE_MS (i.e.
// velocity ~0 — approximated by "no scroll events fired"), ease to the
// nearest snap stop instead of leaving the user parked mid-fade. Any further
// wheel/touch input naturally overrides the in-flight `lenis.scrollTo` (Lenis
// merges new input into its animation target), so nothing needs to
// explicitly "cancel" a glide.
export function useSnapScroll({ trackRef, lenisRef, enabled }) {
  const snapsRef = useRef([])
  const idleTimer = useRef(null)

  useEffect(() => {
    if (!enabled) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    const computeSnaps = () => {
      const ys = [0]
      const track = trackRef.current
      if (track) {
        const trackTop = window.scrollY + track.getBoundingClientRect().top
        const trackHeight = track.offsetHeight
        const scrollable = Math.max(trackHeight - window.innerHeight, 0)
        for (const f of TRACK_SNAPS) ys.push(trackTop + f * scrollable)
      }
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id)
        if (el) ys.push(window.scrollY + el.getBoundingClientRect().top)
      }
      ys.push(document.documentElement.scrollHeight - window.innerHeight)
      snapsRef.current = ys.sort((a, b) => a - b)
    }
    computeSnaps()
    window.addEventListener('resize', computeSnaps)

    const snapToNearest = () => {
      const lenis = lenisRef.current
      const snaps = snapsRef.current
      if (!lenis || !snaps.length) return
      const y = window.scrollY
      let nearest = snaps[0]
      let best = Infinity
      for (const s of snaps) {
        const d = Math.abs(s - y)
        if (d < best) {
          best = d
          nearest = s
        }
      }
      if (best < ALREADY_THERE_PX) return
      lenis.scrollTo(nearest, {
        duration: SNAP_DURATION,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      })
    }

    const onScroll = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(snapToNearest, IDLE_MS)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('resize', computeSnaps)
      window.removeEventListener('scroll', onScroll)
      if (idleTimer.current) clearTimeout(idleTimer.current)
    }
  }, [enabled, trackRef, lenisRef])
}
