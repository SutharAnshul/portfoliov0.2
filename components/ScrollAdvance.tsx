'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { neighbours, type Page } from '@/lib/flow'
import { sfx } from '@/lib/audio'

/**
 * Overscroll to turn the page, in both directions.
 *
 * Four corner marks stand at the corners of the content column — vertex on the
 * corner, arms running along the inside edges, so at rest they read as a
 * viewfinder around the page rather than as chrome added to it. Pushing past
 * an edge closes them, in two stages:
 *
 *   1. VERTICAL   the top pair and the bottom pair meet on the centre line,
 *                 which leaves a ⊢ and a ⊣ facing each other across the page.
 *   2. HORIZONTAL those two halves come together, and the four right angles
 *                 lie on one another as the plus they were cut from — every
 *                 arm of it accounted for exactly once.
 *
 * Between the stages is a band of dead travel. It costs a seventh of the push
 * and buys the thing the rough version was missing: the halves stop being a
 * frame you pass through on the way to somewhere and become a position you can
 * hold, so the gesture has a place to pause and a second, deliberate half.
 *
 * Each stage eases out rather than tracking the push linearly, so the marks
 * arrive at the halves and settle instead of sliding at a constant rate.
 *
 * The page itself is not touched while you push — no dimming, no scaling, no
 * cropping. Everything the interaction has to say before it commits is said by
 * where four small right angles are.
 *
 * On commit the page shuts onto the line the plus has made, holds for a beat
 * so the plus is actually seen, and the next page opens out of it while the
 * marks come apart again in the same order, reversed: the plus opens to the
 * halves, the halves back to the corners.
 *
 * Why wheel deltas rather than scroll position: Lenis clamps scrollY at both
 * ends of the document, so once you are against an edge the position stops
 * changing and there is nothing left to measure. The raw wheel event still
 * fires — Lenis calls preventDefault but does not stop propagation.
 */

/** Total wheel distance, in px, to go from four marks to one. */
const PUSH_PX = 760
/** Share of that push which closes the vertical. */
const SPLIT = 0.42
/** Dead travel between the stages — the detent. */
const DEAD = 0.14
/** No single event may contribute more than this share. */
const MAX_EVENT_SHARE = 0.07
/** Charge drained per second once input stops. */
const DRAIN_PER_S = 1.4
/** Input is considered stopped after this long without an event. */
const IDLE_MS = 170

/** The three beats of the turn. */
const OUT_MS = 130
const HOLD_MS = 80
const IN_MS = 300
/** How long after the plus opens before the halves return to the corners. */
const RETRACT_Y_MS = 170

/** Decelerating, so a stage arrives rather than slides. */
const ease = (t: number) => 1 - Math.pow(1 - t, 2.2)

type Dir = 'down' | 'up' | null

export function ScrollAdvance() {
  const pathname = usePathname()
  const router = useRouter()
  const { next, prev } = neighbours(pathname)

  const nextPath = next?.path ?? null
  const prevPath = prev?.path ?? null

  const rootRef = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [dir, setDir] = useState<Dir>(null)

  useEffect(() => setEnabled(true), [])

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
    const arriving = docEl.dataset.turn === 'shut'
    if (!arriving) {
      root.dataset.state = 'idle'
      root.style.setProperty('--kx', '0')
      root.style.setProperty('--ky', '0')
      docEl.style.setProperty('--page-shut', '0')
      delete docEl.dataset.turn
    }
    setDir(null)

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

    /** The visible content column, so the marks frame it rather than the window. */
    const contentRect = () => {
      const nodes = document.querySelectorAll<HTMLElement>('[data-page-content]')
      for (const n of nodes) {
        const r = n.getBoundingClientRect()
        if (r.width > 0) return r
      }
      return null
    }

    let charge = 0
    let activeDir: Dir = null
    let restingDir: Dir = null
    let lastInput = 0
    let armed = true
    let frame = 0
    let box = ''

    const target = (d: Dir): Page | null => (d === 'down' ? next : d === 'up' ? prev : null)

    /** Both axes, eased, with the detent between them. */
    const publish = () => {
      const a = Math.min(1, charge / SPLIT)
      const b = Math.max(0, Math.min(1, (charge - SPLIT - DEAD) / (1 - SPLIT - DEAD)))
      root.style.setProperty('--ky', ease(a).toFixed(4))
      root.style.setProperty('--kx', ease(b).toFixed(4))
    }

    const fire = () => {
      const dest = target(activeDir)
      if (!armed || !dest) return
      armed = false
      root.dataset.state = 'out'
      docEl.dataset.turn = 'out'
      docEl.style.setProperty('--page-shut', '1')
      sfx.advance()

      // Started now, not after the hold. A client navigation takes a couple of
      // hundred milliseconds of its own, and waiting for the page to finish
      // shutting before asking for the next one simply adds that to the turn.
      // The page is already closing, so the swap happens behind a shut door.
      router.push(dest.path)

      window.setTimeout(() => {
        // The plus alone, for long enough to be seen.
        root.dataset.state = 'hold'
        // 'shut' rather than 'hold': the next route's effect reads this to know
        // it has arrived mid-turn and must not simply appear.
        docEl.dataset.turn = 'shut'
      }, OUT_MS)
    }

    /**
     * A wheel that starts inside a panel with its own scrolling belongs to that
     * panel, not to the page behind it.
     */
    const mine = (t: EventTarget | null) =>
      !(t instanceof Element) || !t.closest('[data-lenis-prevent]')

    const addInput = (deltaY: number) => {
      if (!armed || deltaY === 0) return
      if (docEl.dataset.modal) return

      const at = edge()
      const pushing: Dir =
        at === 'down' && deltaY > 0 ? 'down' : at === 'up' && deltaY < 0 ? 'up' : null

      if (!pushing || !target(pushing)) return

      if (activeDir !== pushing) {
        activeDir = pushing
        charge = 0
        setDir(pushing)
      }

      if (reduce) {
        fire()
        return
      }

      charge = Math.min(1, charge + Math.min(Math.abs(deltaY) / PUSH_PX, MAX_EVENT_SHARE))
      lastInput = performance.now()
      root.dataset.state = 'charging'
      publish()
      if (charge >= 1) fire()
    }

    const onWheel = (e: WheelEvent) => {
      if (!mine(e.target)) return
      addInput(e.deltaY)
    }

    let touchY: number | null = null
    const onTouchStart = (e: TouchEvent) => {
      touchY = mine(e.target) ? (e.touches[0]?.clientY ?? null) : null
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
      // Keep the marks on the content column, which moves when either panel
      // is resized and is not the window.
      // Corner to corner of the column, with nothing dodging anything else:
      // the breadcrumb now sits under the frame rather than over it.
      const r = contentRect()
      if (r) {
        const key = `${Math.round(r.left)}:${Math.round(r.width)}`
        if (key !== box) {
          box = key
          root.style.left = `${Math.round(r.left)}px`
          root.style.width = `${Math.round(r.width)}px`
        }
      }

      if (armed) {
        const at = edge()
        const hint = at && target(at) ? at : null
        if (hint !== restingDir) {
          restingDir = hint
          if (hint) setDir(hint)
        }

        if (charge > 0 && now - lastInput > IDLE_MS) {
          charge = Math.max(0, charge - DRAIN_PER_S / 60)
          publish()
        }

        // Only ever writes the three resting states. The turn's own states are
        // left alone, or the retraction is overwritten on the next frame.
        const held = root.dataset.state
        if (held === 'idle' || held === 'resting' || held === 'charging') {
          root.dataset.state =
            charge > 0.01 ? 'charging' : restingDir ? 'resting' : 'idle'
        }
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
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      // Never leave a page shut mid-turn.
      docEl.style.setProperty('--page-shut', '0')
    }
    // Depends on the paths rather than the objects: neighbours() builds new
    // ones every render, which re-ran this effect on every keystroke of state
    // and reset the turn out from under itself.
  }, [enabled, nextPath, prevPath, router, pathname])

  /**
   * Taking the marks apart again, in the order they came together. Runs on
   * arrival: the plus opens to the halves, and only then do the halves go back
   * to the corners.
   */
  useEffect(() => {
    const root = rootRef.current
    if (!root || !enabled) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const docEl = document.documentElement
    if (docEl.dataset.turn !== 'shut') return

    // Open the page out of the seam the plus is sitting on.
    docEl.dataset.turn = 'in'
    docEl.style.setProperty('--page-shut', '0')

    root.dataset.state = 'in'
    root.dataset.back = 'x'
    root.style.setProperty('--kx', '0')

    const y = window.setTimeout(() => {
      root.dataset.back = 'y'
      root.style.setProperty('--ky', '0')
    }, RETRACT_Y_MS)

    const done = window.setTimeout(() => {
      root.removeAttribute('data-back')
      root.dataset.state = 'idle'
      delete docEl.dataset.turn
    }, IN_MS + RETRACT_Y_MS)

    return () => {
      window.clearTimeout(y)
      window.clearTimeout(done)
    }
  }, [pathname, enabled])

  if (!next && !prev) return null

  const shownTarget = dir === 'up' ? prev : next
  const destination = shownTarget ?? next ?? prev
  const label = destination?.label ?? ''
  const href = destination?.path ?? '/'

  return (
    <div ref={rootRef} className="turn" data-state="idle" data-dir={dir ?? 'down'}>
      {/* Only drawn while the two halves are apart. It is what says they are
          aimed at each other rather than merely sitting on the same line. */}
      <span className="turn-rail" aria-hidden="true" />

      <span className="turn-cnr turn-tl" aria-hidden="true" />
      <span className="turn-cnr turn-tr" aria-hidden="true" />
      <span className="turn-cnr turn-bl" aria-hidden="true" />
      <span className="turn-cnr turn-br" aria-hidden="true" />

      <Link href={href} data-sfx="tick" className="turn-label">
        <span className="sr-only">Continue to {label}</span>
        <span aria-hidden="true">{label}</span>
      </Link>
    </div>
  )
}
