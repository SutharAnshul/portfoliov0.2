'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Damped window scrolling — weighted, but not sluggish.
 *
 * DURATION is how long the glide takes to settle, WHEEL is distance per notch.
 * This has come down twice: 1.35s, then 0.85s, now 0.55s. What makes the lag
 * feel long is not the number on its own but how much of it lands in the tail,
 * and both earlier easings were tail-heavy — expo-out worst, quint-out still
 * spending a third of its run inside the last tenth of the distance.
 *
 * Cubic-out at 0.55s reaches 90% of the move in about 0.27s and is done at
 * 0.55s, against quint-out at 0.85s taking 0.31s and 0.85s for the same two
 * marks. The hand is answered roughly when it stops moving, and what remains
 * reads as weight rather than as the page catching up.
 */
const DURATION = 0.55
const WHEEL = 1

export function SmoothScroll() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduceMotion.matches) return

    const lenis = new Lenis({
      duration: DURATION,
      // cubic-out. Still eased, still decelerating — just without the long
      // crawl at the end that quint and expo both carry.
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      wheelMultiplier: WHEEL,
      // Leave touch alone: iOS/Android momentum is already good, and mobile
      // scrolls its own container in LayoutShell rather than the window.
      syncTouch: false,
    })

    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])

  return null
}
