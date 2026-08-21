'use client'

import { createElement, useEffect, useRef, useState } from 'react'
import { installMaterial, type MassName } from '@/lib/physics'

/**
 * Content that settles rather than animates in.
 *
 * An element starts displaced and slightly out of focus, then comes to rest
 * under the site's spring — the same curve the cursor field uses, baked into a
 * CSS `linear()` easing (published once on the root as the --ease- and --dur-
 * custom properties) so a transition and a JS rAF spring are the same motion.
 *
 * Restraint, deliberately: short travel, no scale, no glow, no colour shift.
 * The only channels are a small vertical offset and an optical focus pull.
 *
 * Three states, and the transition rules differ between them — this is the
 * part that is easy to get wrong:
 *
 *   idle    server render. No inline transform at all, so the pre-hydration
 *           CSS in globals.css (under html.boot) decides whether it is hidden.
 *   held    displaced, with transition explicitly OFF so it snaps there in one
 *           frame. Transitioning *into* held would animate the element out and
 *           leave nothing to animate back in.
 *   settled at rest, with the spring transition ON. This is the visible move.
 *
 * Fails open. The hiding rule is scoped to html.boot, and that class is only
 * added by the inline script in layout.tsx — so with JS off, or reduced motion
 * on, content renders plainly visible and stays that way.
 */

interface Props {
  children: React.ReactNode
  /** heavy is slow and travels further; light snaps into place */
  mass?: MassName
  /** ms of stagger before this element is released */
  delay?: number
  /** Settle on mount (page boot) rather than on scroll into view */
  boot?: boolean
  className?: string
  /** Merged after the settle transform, for layout the caller owns. */
  style?: React.CSSProperties
  as?: 'div' | 'section' | 'li' | 'article' | 'span'
}

const TRAVEL: Record<MassName, number> = { heavy: 14, medium: 10, light: 6 }

/**
 * Arriving from a page transition is not the same event as a scroll reveal.
 * The outgoing page flies a long way, so the incoming one has to answer with a
 * comparable move or the transition lands flat.
 */
const NAV_TRAVEL = 5.5
const NAV_BLUR = 1.8
const BLUR: Record<MassName, number> = { heavy: 5, medium: 4, light: 3 }

export function Settle({
  children,
  mass = 'medium',
  delay = 0,
  boot = false,
  className = '',
  style: outerStyle,
  as = 'div',
}: Props) {
  const ref = useRef<HTMLElement | null>(null)
  const [state, setState] = useState<'idle' | 'held' | 'settled'>('idle')
  /**
   * +1 arrives from below, -1 from above. ScrollAdvance stamps data-nav-dir on
   * the root before navigating, so a page reached by scrolling *up* enters
   * from the top — the content keeps travelling the way the scroll was going
   * instead of reversing direction mid-transition.
   */
  const [sign, setSign] = useState(1)
  /** True when this mount is the result of a page transition, not a cold load. */
  const [arrival, setArrival] = useState(false)

  useEffect(() => {
    installMaterial()
    const navDir = document.documentElement.dataset.navDir
    setSign(navDir === 'up' ? -1 : 1)
    setArrival(!!navDir && boot)
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setState('settled')
      return
    }

    setState('held')

    let released = false
    let raf1 = 0
    let raf2 = 0
    let timer = 0

    /**
     * Two frames: one for 'held' to paint at its displaced position, one so the
     * transition has a start value to move from. A single frame lets the
     * browser coalesce both states, and nothing animates.
     *
     * The timer is a backstop, not a nicety: rAF is suspended in background
     * tabs and throttled under load, and without it content would sit at
     * opacity 0 indefinitely. Whichever path fires first wins.
     */
    const settle = () => {
      if (released) return
      released = true
      setState('settled')
    }

    const release = () => {
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(settle)
      })
      timer = window.setTimeout(settle, 120)
    }

    const cancel = () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      window.clearTimeout(timer)
    }

    if (boot || typeof IntersectionObserver === 'undefined') {
      release()
      return cancel
    }

    const observer = new IntersectionObserver(
      (list) => {
        for (const entry of list) {
          if (entry.isIntersecting) {
            observer.disconnect()
            release()
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancel()
    }
  }, [boot])

  const ease = `var(--ease-${mass})`
  const dur = `var(--dur-${mass})`

  // Travel and blur are published as custom properties so the pre-hydration
  // CSS can use the same per-mass values the inline styles do.
  const vars = {
    '--st-travel': `${TRAVEL[mass]}px`,
    '--st-blur': `${BLUR[mass]}px`,
  } as React.CSSProperties

  let style: React.CSSProperties = { ...vars, ...outerStyle }

  if (state === 'held') {
    style = {
      ...vars,
      ...outerStyle,
      transform: `translate3d(0, ${TRAVEL[mass] * sign * (arrival ? NAV_TRAVEL : 1)}px, 0)`,
      filter: `blur(${BLUR[mass] * (arrival ? NAV_BLUR : 1)}px)`,
      opacity: 0,
      transition: 'none',
      willChange: 'transform, filter, opacity',
    }
  } else if (state === 'settled') {
    style = {
      ...vars,
      ...outerStyle,
      transform: 'none',
      filter: 'blur(0px)',
      opacity: 1,
      transition: `transform ${dur} ${ease} ${delay}ms, filter ${dur} ${ease} ${delay}ms, opacity 280ms linear ${delay}ms`,
    }
  }

  return createElement(
    as,
    { ref, className, 'data-settle': state, style },
    children,
  )
}
