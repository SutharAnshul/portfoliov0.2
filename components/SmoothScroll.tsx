'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Damped, weighted window scrolling.
 *
 * Tuning knobs — raise DURATION for heavier/slower glide, lower WHEEL for less
 * distance per notch. LERP is intentionally unused; DURATION + EASING gives a
 * more consistent "weight" across trackpads and mouse wheels.
 */
const DURATION = 1.35
const WHEEL = 0.85

export function SmoothScroll() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduceMotion.matches) return

    const lenis = new Lenis({
      duration: DURATION,
      // expo-out: fast pickup, long soft settle — reads as mass
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
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
