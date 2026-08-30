'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { MASS, clamp, installMaterial, springStep } from '@/lib/physics'
import { neighbours, type Page } from '@/lib/flow'
import { sfx } from '@/lib/audio'

/**
 * Overscroll-to-advance, in both directions.
 *
 * Past the bottom of a page, further downward input charges a gauge toward the
 * next page. Past the top, upward input charges toward the previous one. Stop
 * pushing and the charge drains back.
 *
 * The transition has three beats, and the middle one is what gives it weight:
 *
 *   1. CHARGE   scrubbed by the scroll. The outgoing page recedes in
 *               proportion, and reverses if the user lets go.
 *   2. RELEASE  on reaching full charge the page is *not* swapped straight
 *               away. Tension is released over RELEASE_MS: the exit keeps
 *               accelerating past 1 while the gauge commits. Without this the
 *               buildup has no payoff — the content just blinks out.
 *   3. ARRIVE   navigation happens at the end of the release, and the incoming
 *               page settles in from the direction of travel.
 *
 * Why wheel deltas rather than scroll position: Lenis clamps scrollY at both
 * ends of the document, so once you are against an edge the position stops
 * changing and there is nothing left to measure. The raw wheel event still
 * fires — Lenis calls preventDefault but does not stop propagation.
 */

/** Total wheel distance, in px, required past an edge. */
const THRESHOLD_PX = 1240
/** No single event may contribute more than this share of the gauge. */
const MAX_EVENT_SHARE = 0.06
/** Time against the edge before input starts counting. */
const DWELL_MS = 140
/** Gauge units drained per second once input stops. */
const DRAIN_PER_S = 1.35
/** Input is considered stopped after this long without an event. */
const IDLE_MS = 180
/** The release beat: how long the page keeps flying before the route swaps. */
const RELEASE_MS = 280
/** How far past full the exit is driven during the release. */
const RELEASE_OVERSHOOT = 0.5

type Dir = 'down' | 'up' | null

export function ScrollAdvance() {
  const pathname = usePathname()
  const router = useRouter()
  const { next, prev } = neighbours(pathname)

  const rootRef = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [dir, setDir] = useState<Dir>(null)

  useEffect(() => {
    installMaterial()
    setEnabled(true)
  }, [])

  useEffect(() => {
    if (next) router.prefetch(next.path)
    if (prev) router.prefetch(prev.path)
  }, [next, prev, router])

  useEffect(() => {
    if (!enabled || (!next && !prev)) return
    const root = rootRef.current
    if (!root) return

    const docEl = document.documentElement

    // Written imperatively, so React's diff never resets these between routes.
    root.dataset.state = 'idle'
    root.dataset.active = 'false'
    docEl.style.setProperty('--page-exit', '0')
    setDir(null)

    // Cleared once the incoming page has had time to read it for its arrival
    // direction. Left set, it would also affect later scroll reveals.
    const navDirTimer = window.setTimeout(() => {
      delete docEl.dataset.navDir
    }, 1600)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const scroller = () => {
      const el = document.querySelector<HTMLElement>('[data-scroll-root]')
      if (el && el.clientHeight > 0 && el.scrollHeight > el.clientHeight + 4) return el
      return null
    }

    const edge = (): Dir => {
      const el = scroller()
      if (el) {
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 3) return 'down'
        if (el.scrollTop <= 3) return 'up'
        return null
      }
      if (window.innerHeight + window.scrollY >= docEl.scrollHeight - 3) return 'down'
      if (window.scrollY <= 3) return 'up'
      return null
    }

    /** The visible content column, so the panel can span it. */
    const contentRect = () => {
      const nodes = document.querySelectorAll<HTMLElement>('[data-page-content]')
      for (const n of nodes) {
        const r = n.getBoundingClientRect()
        if (r.width > 0) return r
      }
      return null
    }

    let charge = 0
    let shown = 0
    let shownVel = 0
    let activeDir: Dir = null
    /**
     * Which direction the resting hint is currently advertising.
     *
     * The panel used to be invisible until you were already overscrolling,
     * which meant the only way to discover the next page was to push past the
     * bottom by accident. Reaching the edge now shows the strip quietly — the
     * destination named, the gauge empty — so the gesture is offered before it
     * has to be guessed. Tracked in a local rather than read back from React
     * state so the label is only re-rendered when it actually changes.
     */
    let restingDir: Dir = null
    let edgeSince = 0
    let lastInput = 0
    let armed = true
    let releaseAt = 0
    let navigated = false
    let frame = 0
    let last = performance.now()

    const target = (d: Dir): Page | null => (d === 'down' ? next : d === 'up' ? prev : null)

    const fire = () => {
      if (!armed || !target(activeDir)) return
      armed = false
      releaseAt = performance.now()
      root.dataset.state = 'firing'
      sfx.advance()
      // Read by Settle on the incoming page to choose its arrival direction.
      docEl.dataset.navDir = activeDir === 'up' ? 'up' : 'down'
    }

    const addInput = (deltaY: number) => {
      if (!armed || deltaY === 0) return

      const at = edge()
      const pushing: Dir =
        at === 'down' && deltaY > 0 ? 'down' : at === 'up' && deltaY < 0 ? 'up' : null

      if (!pushing || !target(pushing)) {
        edgeSince = 0
        return
      }

      const now = performance.now()
      if (activeDir !== pushing) {
        activeDir = pushing
        charge = 0
        edgeSince = now
        setDir(pushing)
        docEl.style.setProperty('--page-exit-dir', pushing === 'down' ? '-1' : '1')
        return
      }
      if (!edgeSince) {
        edgeSince = now
        return
      }
      if (now - edgeSince < DWELL_MS) return

      lastInput = now
      charge = clamp(charge + Math.min(Math.abs(deltaY) / THRESHOLD_PX, MAX_EVENT_SHARE), 0, 1)
      if (charge >= 1) fire()
    }

    const onWheel = (e: WheelEvent) => addInput(e.deltaY)

    let touchY: number | null = null
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null
    }
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY
      if (y == null || touchY == null) return
      addInput(touchY - y)
      touchY = y
    }
    const onTouchEnd = () => {
      touchY = null
    }

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      let exit: number

      if (releaseAt) {
        // Release beat: accelerate away, then swap the route at the end.
        const t = clamp((now - releaseAt) / RELEASE_MS, 0, 1)
        exit = 1 + t * t * RELEASE_OVERSHOOT
        shown = 1
        if (t >= 1 && !navigated) {
          navigated = true
          const dest = target(activeDir)
          if (dest) router.push(dest.path)
        }
      } else {
        if (!edge()) edgeSince = 0
        if (now - lastInput > IDLE_MS && charge > 0) {
          charge = clamp(charge - DRAIN_PER_S * dt, 0, 1)
        }
        if (charge >= 1 && armed) fire()

        if (reduce) shown = charge
        else [shown, shownVel] = springStep(shown, shownVel, charge, MASS.light)
        exit = clamp(shown, 0, 1)
      }

      const p = clamp(shown, 0, 1)
      root.style.setProperty('--sa', p.toFixed(4))
      root.dataset.active = p > 0.004 || releaseAt ? 'true' : 'false'
      docEl.style.setProperty('--page-exit', exit.toFixed(4))

      // Sitting at an edge that has somewhere to go, and not yet charging.
      const at = releaseAt || p > 0.004 ? null : edge()
      const rest = at && target(at) ? at : null
      root.dataset.resting = rest ? 'true' : 'false'
      if (rest !== restingDir) {
        restingDir = rest
        if (rest) setDir(rest)
      }

      // Span the content column, so the panel is chrome for the content rather
      // than an overlay floating across it.
      const r = contentRect()
      if (r) {
        root.style.left = `${Math.round(r.left)}px`
        root.style.width = `${Math.round(r.width)}px`
      }

      // Docking upward, sit *below* the breadcrumb rather than over it — the
      // breadcrumb is the top of the hierarchy and always stays visible.
      // Measured rather than hardcoded, since its height varies with the route.
      if (activeDir === 'up') {
        const crumb = document.querySelector<HTMLElement>('[data-breadcrumb]')
        const cr = crumb?.getBoundingClientRect()
        root.style.top = `${Math.round(cr && cr.height > 0 ? cr.bottom : 0)}px`
      } else {
        root.style.top = ''
      }

      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(navDirTimer)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      // Never leave the outgoing page stranded mid-transition.
      docEl.style.setProperty('--page-exit', '0')
    }
  }, [enabled, next, prev, router, pathname])

  if (!next && !prev) return null

  const shownTarget = dir === 'up' ? prev : next
  const destination = shownTarget ?? next ?? prev
  const label = destination?.label ?? ''
  const href = destination?.path ?? '/'

  return (
    <div
      ref={rootRef}
      className="scroll-advance"
      data-active="false"
      data-resting="false"
      data-state="idle"
      data-dir={dir ?? 'down'}
    >
      <Link href={href} className="scroll-advance-hit">
        <span className="sr-only">Continue to {label}</span>

        <span className="scroll-advance-action" aria-hidden="true">
          {dir === 'up' ? 'Back' : 'Continue'}
        </span>

        {/* Linear gauge: an explicit start mark, an explicit finish mark, and a
            head travelling between them. Mirrored when charging upward so the
            fill always runs toward the destination. */}
        <span className="scroll-advance-bar" aria-hidden="true">
          <span className="scroll-advance-cap scroll-advance-cap-start" />
          <span className="scroll-advance-track" />
          <span className="scroll-advance-fill" />
          <span className="scroll-advance-head">
            <span className="scroll-advance-head-h" />
            <span className="scroll-advance-head-v" />
          </span>
          <span className="scroll-advance-cap scroll-advance-cap-end" />
        </span>

        <span className="scroll-advance-target" aria-hidden="true">
          {label}
        </span>
      </Link>
    </div>
  )
}
