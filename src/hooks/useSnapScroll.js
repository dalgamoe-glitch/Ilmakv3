import { useEffect, useRef } from 'react'
import { TRACK_SNAPS } from '../scrollMap.js'

// Sections that sit in normal document flow after the cinematic track —
// each is a snap stop in its own right.
const SECTION_IDS = ['features', 'preview', 'proof', 'pricing', 'faq']

const IDLE_MS = 140
const ALREADY_THERE_PX = 2
// Only assist when the user has already come to rest *near* a beat. Beyond
// this the glide would be a long, grabby yank across a gap the user meant to
// stop in — so we leave them where they are. Expressed as a fraction of the
// viewport so it scales across screen sizes.
const MAX_SNAP_FRACTION = 0.33
// Distance-proportional glide, clamped short: a tiny correction resolves
// almost instantly, a near-max one still settles in well under a second, so
// the assist reads as a quiet settle rather than a scripted scroll.
const MIN_DURATION = 0.28
const MAX_DURATION = 0.6
// Gentle ease-in-out — eases *in* from rest instead of grabbing at t=0, so
// the correction sneaks in rather than lurching.
const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2

// "Glide to nearest on stop": once scrolling has been idle for IDLE_MS (i.e.
// velocity ~0 — approximated by "no scroll events fired"), ease to the
// nearest snap stop *if it's close* instead of leaving the user parked
// mid-fade. Any further wheel/touch input naturally overrides the in-flight
// `lenis.scrollTo` (Lenis merges new input into its animation target), so
// nothing needs to explicitly "cancel" a glide.
export function useSnapScroll({ trackRef, lenisRef, enabled }) {
  const snapsRef = useRef([])
  const idleTimer = useRef(null)

  useEffect(() => {
    // Disabling (e.g. the waitlist modal opening mid-glide) must also halt
    // any in-flight lenis.scrollTo animation — removing these listeners alone
    // leaves the page drifting toward its old snap target behind the modal.
    if (!enabled) {
      lenisRef.current?.stop()
      return undefined
    }
    lenisRef.current?.start()
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
      if (!lenis) return
      // Recompute right before snapping so late layout shifts (font/image
      // reflow, content changes) never leave us aiming at a stale target.
      computeSnaps()
      const snaps = snapsRef.current
      if (!snaps.length) return
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
      // Too far from any beat → the user meant to stop here. Leave them be.
      if (best > window.innerHeight * MAX_SNAP_FRACTION) return
      const duration = Math.min(
        MAX_DURATION,
        MIN_DURATION + (best / window.innerHeight) * 0.5,
      )
      lenis.scrollTo(nearest, { duration, easing: easeInOutSine })
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
