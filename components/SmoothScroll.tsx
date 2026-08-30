'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Damped window scrolling — weighted, but not sluggish.
 *
 * Tuning knobs: DURATION is how long the glide takes to settle, WHEEL is
 * distance per notch. These were 1.35s and 0.85, which put roughly a third of
 * a second of visible drift between the wheel stopping and the page stopping —
 * enough that the page felt like it was catching up rather than responding.
 *
 * 0.85s with a full-strength wheel keeps the damping legible while letting the
 * page arrive close to when the hand does. The easing matters as much as the
 * number: expo-out spends most of its time in a long tail, so the last 10% of
 * the distance took a disproportionate share of the old duration.
 */
const DURATION = 0.85
const WHEEL = 1

export function SmoothScroll() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduceMotion.matches) return

    const lenis = new Lenis({
      duration: DURATION,
      // quint-out rather than expo-out. Both pick up fast, but expo's tail is
      // so long that the page keeps creeping after the gesture has clearly
      // ended; quint settles decisively while still reading as damped.
      easing: (t: number) => 1 - Math.pow(1 - t, 5),
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
