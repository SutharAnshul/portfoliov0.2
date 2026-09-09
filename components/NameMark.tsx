'use client'

import { createElement, useEffect, useRef, useState } from 'react'

/**
 * The name, as a field of cells that periodically resolve out of solid blocks.
 *
 * Two words of six characters happens to be the whole idea: ANSHUL over
 * SUTHAR is a rectangle, so the blocked state is a clean 6×2 field rather
 * than a ragged one, and every cell is exactly one monospace character wide
 * whether it is holding a letter or a block.
 *
 * The band sweeps left to right in both directions — once to uncover the
 * name, once to cover it again — with the leading cell carrying colour. That
 * one pink cell is what makes it read as a wipe with a direction rather than
 * as characters randomly flickering.
 *
 * The two rows are offset by a beat. Sweeping them in lockstep drew a hard
 * vertical edge down the middle of the mark, which looked like a loading bar;
 * a row and a half of lag turns the same motion into something falling into
 * place.
 *
 * It rests on blocks, and resolves. Two things keep that from costing anyone
 * the name: it resolves once on arrival before the cycle starts, and the real
 * text is in the accessibility tree the whole time — the cells are decoration
 * and are hidden from it.
 *
 * ── Reading it by hand ──────────────────────────────────────────────────
 *
 * Each box is its own hit area. Putting the pointer on one stops the cycle
 * where it stands and turns that box, and only that box, into its letter — so
 * the name can be read by moving across it rather than by waiting for it.
 *
 * Arriving while the name is showing does not snap the field shut. The cover
 * radiates out from the box under the pointer, one ring of cells every 30ms,
 * so the pointer reads as the thing that closed them rather than as a switch
 * thrown somewhere off screen. Leaving unwinds the same ripple from the
 * outside in, back to whatever the cycle was holding.
 *
 * The wavefront is pink, and only the wavefront: a box holds the accent for
 * 90ms as the ring passes through it and then settles to white. Colouring
 * every covered box instead would say the field is pink; colouring three
 * rings of it says something is moving outward through the field, which is
 * the thing worth seeing. It is the same accent the periodic sweep leads
 * with, so both motions are read by the same mark.
 *
 * The clock is paused for all of it, and the borrowed time is handed back only
 * once the unwind finishes — so the sweep resumes on the beat it was
 * interrupted on, and never against a field still in motion underneath it.
 */

const ROWS = ['ANSHUL', 'SUTHAR'] as const
const N = ROWS[0].length

/** The beats of one cycle, in ms. */
const HOLD_NAME = 4600
const COVER = 460
const HOLD_BLOCKS = 1500
const REVEAL = 560
const CYCLE = HOLD_NAME + COVER + HOLD_BLOCKS + REVEAL

/** How far the second row lags the first, in ms. */
const LAG = 110

/** The pause after arrival before the mark starts cycling. */
const SETTLE = 2400

/** One ring of the hover ripple. */
const STEP = 30
/** How long a box holds the accent as the wavefront passes through it. */
const PINK = 90
/** The ripple's longest reach, corner to corner. */
const REACH = N - 1 + (ROWS.length - 1)

type Cell = 'on' | 'off' | 'edge'
type Key = `${number}:${number}`

const key = (r: number, i: number) => `${r}:${i}` as Key

/** Rings, not radii. Two rows deep means Manhattan is as round as this gets. */
function ringsApart(a: Key, b: Key) {
  const [ar, ai] = a.split(':').map(Number)
  const [br, bi] = b.split(':').map(Number)
  return Math.abs(ar - br) + Math.abs(ai - bi)
}

/**
 * One row's cells at a moment in the cycle.
 *
 * Both sweeps run left to right, so the only difference between them is which
 * side of the edge keeps its letters.
 */
function cellsAt(t: number): Cell[] {
  const cycle = ((t % CYCLE) + CYCLE) % CYCLE

  if (cycle < HOLD_NAME) return Array(N).fill('on')

  const covering = cycle - HOLD_NAME
  if (covering < COVER) {
    const edge = Math.ceil((covering / COVER) * N)
    return Array.from({ length: N }, (_, i) =>
      i < edge - 1 ? 'off' : i === edge - 1 ? 'edge' : 'on',
    )
  }

  const blocked = covering - COVER
  if (blocked < HOLD_BLOCKS) return Array(N).fill('off')

  const edge = Math.ceil(((blocked - HOLD_BLOCKS) / REVEAL) * N)
  return Array.from({ length: N }, (_, i) => (i < edge - 1 ? 'on' : i === edge - 1 ? 'edge' : 'off'))
}

const field = (t: number) => ROWS.map((_, r) => cellsAt(t - r * LAG))

export function NameMark({
  as = 'h1',
  interactive = true,
  className = '',
}: {
  /**
   * The element to render. The rail wants the page's `h1`; the phone masthead
   * puts the mark inside a button, and a heading is not phrasing content — it
   * cannot legally go there, and browsers will move it out of the button if it
   * does.
   */
  as?: 'h1' | 'span'
  /**
   * Whether each box is its own hit area.
   *
   * Off for touch. Reading the name by moving across it is a pointer idea —
   * there is nothing to move across with a finger, `pointerenter` fires on tap
   * and then never leaves, so the first box touched would freeze the cycle and
   * stay frozen. Worse inside the masthead button, where twelve child hit areas
   * sit on top of the one thing the user is actually trying to press.
   */
  interactive?: boolean
  className?: string
} = {}) {
  // Server and first paint show the name outright. Anything else would put a
  // block of colour where the name goes for one frame on every cold load.
  const [rows, setRows] = useState<Cell[][]>(() => ROWS.map(() => Array(N).fill('on')))
  // A ref, not state: the rAF loop reads it every frame, and routing it through
  // state would rebuild the loop on every pointer move between boxes.
  const hover = useRef<Key | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Counted from a point far enough in the past that the first thing it does
    // is finish holding the name, not start mid-wipe.
    let start = performance.now() - (HOLD_NAME - SETTLE)
    let pausedAt: number | null = null
    let frame = 0
    let last = ''

    /** The box being held, when it was taken, and the field as it was then. */
    let held: Key | null = null
    let heldAt = 0
    let from: Cell[][] = ROWS.map(() => Array(N).fill('off'))
    /** The unwind: what it radiates from, when it began, and where it lands. */
    let unwind: { origin: Key; at: number; to: Cell[][] } | null = null

    /** What is on screen this frame, so a ripple can start from it. */
    let shown: Cell[][] = ROWS.map(() => Array(N).fill('on'))

    const tick = (now: number) => {
      const want = hover.current

      if (want && want !== held) {
        // Entering, or crossing to a neighbour. Either way the ripple restarts
        // from the new box over the field exactly as it looks right now — so
        // crossing from one box to the next covers the one just left after a
        // single ring rather than blinking it out.
        if (held === null) pausedAt = now
        from = shown.map((row) => row.map((c): Cell => (c === 'on' ? 'on' : 'off')))
        held = want
        heldAt = now
        unwind = null
      }

      if (!want && held !== null) {
        unwind = { origin: held, at: now, to: field((pausedAt ?? now) - start) }
        held = null
      }

      let next: Cell[][]

      if (held) {
        const age = now - heldAt
        const origin = held
        next = ROWS.map((_, r) =>
          Array.from({ length: N }, (_, i): Cell => {
            const k = key(r, i)
            if (k === origin) return 'on'
            const due = ringsApart(k, origin) * STEP
            if (age < due) return from[r][i]
            // The accent marks the wavefront and nothing else: a box carries
            // it for three ring-steps as the ring passes through, then settles
            // to white. Colouring every covered box would say the field is
            // pink; colouring the front says something is moving through it.
            return age < due + PINK ? 'edge' : 'off'
          }),
        )
      } else if (unwind) {
        const age = now - unwind.at
        // Long enough for the last ring to finish holding the accent, not just
        // to have been reached.
        if (age >= REACH * STEP + PINK + STEP) {
          // Only now is the borrowed time handed back, so the cycle picks up
          // on its own beat rather than against a field still in motion.
          if (pausedAt !== null) {
            start += now - pausedAt
            pausedAt = null
          }
          unwind = null
          next = field(now - start)
        } else {
          const { origin, to } = unwind
          next = ROWS.map((_, r) =>
            Array.from({ length: N }, (_, i): Cell => {
              const k = key(r, i)
              // Outside in: the far corners come back first, and the box that
              // was under the pointer is the last thing to let go.
              const due = (REACH - ringsApart(k, origin)) * STEP
              if (age < due) return k === origin ? 'on' : 'off'
              // The box the pointer was on is already showing its letter, so
              // there is no wavefront for it to carry — it just hands back.
              if (k === origin) return to[r][i]
              return age < due + PINK ? 'edge' : to[r][i]
            }),
          )
        }
      } else {
        if (pausedAt !== null) {
          start += now - pausedAt
          pausedAt = null
        }
        next = field(now - start)
      }

      shown = next

      // The cells only change a handful of times a second; re-rendering on
      // every frame regardless would put React to work 60 times a second to
      // produce the same twelve nodes.
      const sig = next.map((row) => row.join('')).join('|')
      if (sig !== last) {
        last = sig
        setRows(next)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return createElement(
    as,
    { className: `sig ${className}`.trim() },
    <span className="sr-only">Anshul Suthar</span>,
    <span className="sig-grid" aria-hidden="true">
      {ROWS.map((word, r) => (
        <span className="sig-row" key={word}>
          {[...word].map((ch, i) => (
            <span
              className="sig-cell"
              data-cell={rows[r][i]}
              key={`${word}-${i}`}
              onPointerEnter={
                interactive
                  ? () => {
                      hover.current = key(r, i)
                    }
                  : undefined
              }
              onPointerLeave={
                interactive
                  ? () => {
                      // Guarded: moving between two boxes fires the leave of
                      // the old one after the enter of the new one, and an
                      // unguarded clear would blank the box the pointer is now
                      // on.
                      if (hover.current === key(r, i)) hover.current = null
                    }
                  : undefined
              }
            >
              {ch}
            </span>
          ))}
        </span>
      ))}
    </span>,
  )
}
