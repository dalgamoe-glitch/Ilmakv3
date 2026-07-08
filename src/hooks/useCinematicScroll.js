import { useCallback, useEffect, useRef, useState } from 'react'
import { GROWTH, ECO, TRACK_SNAPS } from '../scrollMap.js'

// Cinematic "demo mode": on trigger, the page glides itself from the hero all
// the way to the footer with film-like pacing — eased moves, varied speeds,
// and brief holds on each key beat — so the whole story plays hands-free for a
// screen recording.
//
// Trigger (see the note in App.jsx / the plan): the hardware volume-up button
// is NOT reliably readable from a web page (no API on mobile; the OS usually
// eats the media key on desktop), so we try the real `AudioVolumeUp` key
// best-effort AND wire reliable, recording-invisible fallbacks — the `+`/`=`
// key on desktop and a hidden corner tap zone on phones (rendered by App).
//
// Scroll is driven by our own rAF tween over `window.scrollTo`, with Lenis
// explicitly paused for the duration (and resumed after). One code path covers
// both the normal (Lenis present) and reduced-motion (no Lenis) cases, and it
// never fights the smooth scroller or depends on Lenis scrollTo edge-cases.

const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2

// Cancelling a take should take intent, not an accidental trackpad twitch —
// a stray micro-scroll must never abort a recording. Escape always cancels;
// a wheel only cancels once the user has scrolled a firm, deliberate amount.
const WHEEL_CANCEL_PX = 140

// A representative "cards orbiting the DNA helix" beat: TRACK_SNAPS is sorted
// ascending and the helix front-moments sit in its middle, so the median snap
// lands on the helix with a card front-and-center.
function helixBeatFraction() {
  return TRACK_SNAPS[Math.floor(TRACK_SNAPS.length / 2)]
}

export function useCinematicScroll({ trackRef, lenisRef }) {
  const [playing, setPlaying] = useState(false)
  const playingRef = useRef(false)
  const cancelRef = useRef(false)
  const timerRef = useRef(null)
  const rafRef = useRef(null)
  const wheelAccumRef = useRef(0)

  const clearHandles = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  const stop = useCallback(() => {
    cancelRef.current = true
    clearHandles()
    if (playingRef.current) {
      playingRef.current = false
      setPlaying(false)
    }
    // hand scrolling back to Lenis
    lenisRef.current?.start()
  }, [lenisRef])

  // Ordered top→bottom waypoints, computed fresh on each play so the run is
  // robust to layout (fonts/images/content shifts). Each leg: target Y, glide
  // duration (s), and a hold (ms) once it arrives.
  const buildLegs = useCallback(() => {
    const maxY = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      0,
    )
    const track = trackRef.current
    let at = () => 0
    if (track) {
      const trackTop = window.scrollY + track.getBoundingClientRect().top
      const scrollable = Math.max(track.offsetHeight - window.innerHeight, 0)
      at = (f) => trackTop + f * scrollable
    }
    const sectionTop = (id) => {
      const el = document.getElementById(id)
      return el ? window.scrollY + el.getBoundingClientRect().top : null
    }

    const raw = [
      { y: 0, dur: 0, hold: 1100 }, // open on the hero, let it breathe
      { y: at(helixBeatFraction()), dur: 2.6, hold: 1300 }, // pan into the DNA helix, hold on the card
      { y: at(GROWTH.inEnd), dur: 1.9, hold: 950 }, // growth
      { y: at(ECO.inEnd), dur: 2.1, hold: 950 }, // ecosystem / galaxy
      { y: sectionTop('preview'), dur: 1.6, hold: 800 },
      { y: sectionTop('proof'), dur: 1.4, hold: 650 },
      { y: sectionTop('pricing'), dur: 1.5, hold: 800 },
      { y: sectionTop('faq'), dur: 1.4, hold: 650 },
      { y: maxY, dur: 1.7, hold: 1600 }, // settle at the footer
    ]

    const legs = []
    for (const leg of raw) {
      if (leg.y == null) continue
      const y = Math.max(0, Math.min(maxY, Math.round(leg.y)))
      // fold a negligible move into the previous hold instead of stuttering
      if (legs.length && Math.abs(y - legs[legs.length - 1].y) < 4) continue
      legs.push({ ...leg, y })
    }
    return legs
  }, [trackRef])

  const play = useCallback(() => {
    stop() // clear any prior run
    cancelRef.current = false
    playingRef.current = true
    wheelAccumRef.current = 0
    setPlaying(true)

    // take manual control of scrolling for the duration
    lenisRef.current?.stop()
    window.scrollTo(0, 0)

    const legs = buildLegs()
    let i = 0

    const finish = () => {
      playingRef.current = false
      setPlaying(false)
      lenisRef.current?.start()
    }

    const startLeg = () => {
      if (cancelRef.current) return
      if (i >= legs.length) {
        finish()
        return
      }
      const leg = legs[i]
      i += 1
      const startY = window.scrollY
      const delta = leg.y - startY
      const durMs = Math.max(leg.dur * 1000, 0)

      const holdThenNext = () => {
        timerRef.current = setTimeout(startLeg, leg.hold)
      }

      if (durMs === 0 || Math.abs(delta) < 1) {
        window.scrollTo(0, leg.y)
        holdThenNext()
        return
      }

      const t0 = performance.now()
      const frame = (now) => {
        if (cancelRef.current) return
        const t = Math.min((now - t0) / durMs, 1)
        window.scrollTo(0, Math.round(startY + delta * easeInOutSine(t)))
        if (t < 1) rafRef.current = requestAnimationFrame(frame)
        else holdThenNext()
      }
      rafRef.current = requestAnimationFrame(frame)
    }

    // brief beat before the first move so the hero is on screen a moment
    timerRef.current = setTimeout(startLeg, 250)
  }, [buildLegs, lenisRef, stop])

  useEffect(() => {
    const isTyping = (el) =>
      !!el &&
      (el.tagName === 'INPUT' ||
        el.tagName === 'TEXTAREA' ||
        el.isContentEditable)

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (playingRef.current) stop()
        return
      }
      const volumeUp = e.key === 'AudioVolumeUp' // real media key, best effort
      const plus = e.key === '+' || e.key === '=' || e.code === 'NumpadAdd'
      if ((volumeUp || plus) && !isTyping(document.activeElement)) {
        e.preventDefault()
        play()
      }
    }

    // A firm, deliberate wheel scroll cancels; tiny twitches accumulate but
    // stay under the threshold so a clean take survives an accidental nudge.
    const onWheel = (e) => {
      if (!playingRef.current) return
      wheelAccumRef.current += Math.abs(e.deltaY)
      if (wheelAccumRef.current > WHEEL_CANCEL_PX) stop()
    }
    // A touch swipe is inherently deliberate.
    const onTouchMove = () => {
      if (playingRef.current) stop()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [play, stop])

  // stop cleanly if the component unmounts mid-run
  useEffect(() => stop, [stop])

  return { playing, play }
}
