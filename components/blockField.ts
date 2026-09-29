'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * The engine behind every field of cells that resolves out of solid blocks.
 *
 * It was the inside of NameMark, and it is here because a second field — the
 * link to the CV — has to behave identically to the first and stay in step
 * with it. Two copies of this would drift within a frame or two of each other
 * and then look like two things rather than one idea.
 *
 * ── One clock ───────────────────────────────────────────────────────────
 * Every field on the page reads the same start time, so the sweeps begin
 * together and land together whatever their length. A field of six cells and
 * a field of eighteen both take COVER to cover and REVEAL to reveal; what
 * changes between them is the distance a cell-width represents, not the
 * duration. That is the whole trick, and it is why the boundaries are written
 * as fractions of the phase rather than as a per-cell step.
 *
 * The pause is shared too. A hover takes the clock away from the cycle, and
 * while it is held every field stops where it stands — otherwise hovering one
 * would leave the other running and the two would never agree again. The
 * borrowed time is handed back only when the last hover has finished
 * unwinding, so the cycle picks up on the beat it was interrupted on.
 */

export type Cell = 'on' | 'off' | 'edge'

/** The beats of one cycle, in ms. */
export const HOLD_NAME = 4600
export const COVER = 460
export const HOLD_BLOCKS = 1500
export const REVEAL = 560
export const CYCLE = HOLD_NAME + COVER + HOLD_BLOCKS + REVEAL

/** How far a second row lags the first, in ms. */
export const LAG = 110

/** The pause before the first sweep, measured from first paint. */
export const SETTLE = 2400

/** How soon after mounting it may go, however late hydration was. */
const SETTLE_MIN = 150

/** One ring of the hover ripple. */
const STEP = 30
/** How long a cell holds the accent as the wavefront passes through it. */
const PINK = 90

/* ── The shared clock ─────────────────────────────────────────────────── */

const clock = {
  start: 0,
  ready: false,
  /** When the cycle was taken away from, or null while it is running. */
  pausedAt: null as number | null,
  /** Which fields currently have hold of it. */
  holders: new Set<symbol>(),
}

/**
 * Anchored to first contentful paint, not to navigation.
 *
 * `settle` is about how long the reader has been looking at the thing, and on
 * a slow load navigation start can be most of a second before anything is on
 * screen — anchor to it and the sweep can be over before the first frame.
 * Falls back to navigation where the entry is missing.
 *
 * First caller wins, so every field shares whatever the first one established.
 */
function ensureStart(settle: number) {
  if (clock.ready) return
  const fcp =
    performance.getEntriesByType('paint').find((p) => p.name === 'first-contentful-paint')
      ?.startTime ?? 0
  const wait = Math.max(SETTLE_MIN, settle - (performance.now() - fcp))
  clock.start = performance.now() - (HOLD_NAME - wait)
  clock.ready = true
}

/** Where the cycle stands, frozen at the moment the last hover took it. */
const cycleTime = (now: number) => (clock.pausedAt ?? now) - clock.start

/* ── One row's cells at a moment in the cycle ─────────────────────────── */

/**
 * Both sweeps run left to right, so the only difference between them is which
 * side of the edge keeps its letters.
 *
 * The edge is a fraction of the phase times the row's length, which is what
 * lets rows of different lengths finish together.
 */
export function cellsAt(t: number, n: number): Cell[] {
  const cycle = ((t % CYCLE) + CYCLE) % CYCLE

  if (cycle < HOLD_NAME) return Array(n).fill('on')

  const covering = cycle - HOLD_NAME
  if (covering < COVER) {
    const edge = Math.ceil((covering / COVER) * n)
    return Array.from({ length: n }, (_, i) =>
      i < edge - 1 ? 'off' : i === edge - 1 ? 'edge' : 'on',
    )
  }

  const blocked = covering - COVER
  if (blocked < HOLD_BLOCKS) return Array(n).fill('off')

  const edge = Math.ceil(((blocked - HOLD_BLOCKS) / REVEAL) * n)
  return Array.from({ length: n }, (_, i) => (i < edge - 1 ? 'on' : i === edge - 1 ? 'edge' : 'off'))
}

type Key = `${number}:${number}`
const key = (r: number, i: number) => `${r}:${i}` as Key

/** Rings, not radii. On one row this is just the distance along it. */
function ringsApart(a: Key, b: Key) {
  const [ar, ai] = a.split(':').map(Number)
  const [br, bi] = b.split(':').map(Number)
  return Math.abs(ar - br) + Math.abs(ai - bi)
}

/* ── The hook ─────────────────────────────────────────────────────────── */

export function useBlockField(
  rows: readonly string[],
  { interactive = true, settle = SETTLE }: { interactive?: boolean; settle?: number } = {},
) {
  const n = rows[0].length
  const rowCount = rows.length

  // Server and first paint show the text outright. Anything else would put a
  // block of colour where the words go for one frame on every cold load.
  const [cells, setCells] = useState<Cell[][]>(() => rows.map(() => Array(n).fill('on')))
  // A ref, not state: the rAF loop reads it every frame, and routing it through
  // state would rebuild the loop on every pointer move between cells.
  const hover = useRef<Key | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    ensureStart(settle)
    const me = Symbol('field')
    const REACH = n - 1 + (rowCount - 1)
    const field = (t: number) => rows.map((_, r) => cellsAt(t - r * LAG, n))

    let frame = 0
    let last = ''

    /** The cell being held, when it was taken, and the field as it was then. */
    let held: Key | null = null
    let heldAt = 0
    let from: Cell[][] = rows.map(() => Array(n).fill('off'))
    /** The unwind: what it radiates from, when it began, and where it lands. */
    let unwind: { origin: Key; at: number; to: Cell[][] } | null = null

    /** What is on screen this frame, so a ripple can start from it. */
    let shown: Cell[][] = rows.map(() => Array(n).fill('on'))

    const tick = (now: number) => {
      const want = hover.current

      if (want && want !== held) {
        // Entering, or crossing to a neighbour. Either way the ripple restarts
        // from the new cell over the field exactly as it looks right now — so
        // crossing from one cell to the next covers the one just left after a
        // single ring rather than blinking it out.
        if (held === null) {
          clock.holders.add(me)
          if (clock.pausedAt === null) clock.pausedAt = now
        }
        from = shown.map((row) => row.map((c): Cell => (c === 'on' ? 'on' : 'off')))
        held = want
        heldAt = now
        unwind = null
      }

      if (!want && held !== null) {
        unwind = { origin: held, at: now, to: field(cycleTime(now)) }
        held = null
      }

      let next: Cell[][]

      if (held) {
        const age = now - heldAt
        const origin = held
        next = rows.map((_, r) =>
          Array.from({ length: n }, (_, i): Cell => {
            const k = key(r, i)
            if (k === origin) return 'on'
            const due = ringsApart(k, origin) * STEP
            if (age < due) return from[r][i]
            // The accent marks the wavefront and nothing else: a cell carries
            // it for three ring-steps as the ring passes through, then settles
            // to white. Colouring every covered cell would say the field is
            // pink; colouring the front says something is moving through it.
            return age < due + PINK ? 'edge' : 'off'
          }),
        )
      } else if (unwind) {
        const age = now - unwind.at
        // Long enough for the last ring to finish holding the accent, not just
        // to have been reached.
        if (age >= REACH * STEP + PINK + STEP) {
          clock.holders.delete(me)
          // Only when the last field lets go is the borrowed time handed back,
          // so the cycle picks up on its own beat rather than against a field
          // still in motion.
          if (clock.holders.size === 0 && clock.pausedAt !== null) {
            clock.start += now - clock.pausedAt
            clock.pausedAt = null
          }
          unwind = null
          next = field(cycleTime(now))
        } else {
          const { origin, to } = unwind
          next = rows.map((_, r) =>
            Array.from({ length: n }, (_, i): Cell => {
              const k = key(r, i)
              // Outside in: the far ends come back first, and the cell that was
              // under the pointer is the last thing to let go.
              const due = (REACH - ringsApart(k, origin)) * STEP
              if (age < due) return k === origin ? 'on' : 'off'
              // The cell the pointer was on is already showing its letter, so
              // there is no wavefront for it to carry — it just hands back.
              if (k === origin) return to[r][i]
              return age < due + PINK ? 'edge' : to[r][i]
            }),
          )
        }
      } else {
        next = field(cycleTime(now))
      }

      shown = next

      // The cells only change a handful of times a second; re-rendering on
      // every frame regardless would put React to work 60 times a second to
      // produce the same nodes.
      const sig = next.map((row) => row.join('')).join('|')
      if (sig !== last) {
        last = sig
        setCells(next)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      // Leaving mid-hover must not strand the clock: hand the time back on the
      // way out, or every other field stays frozen for good.
      clock.holders.delete(me)
      if (clock.holders.size === 0 && clock.pausedAt !== null) {
        clock.start += performance.now() - clock.pausedAt
        clock.pausedAt = null
      }
    }
  }, [rows, n, rowCount, settle])

  const handlers = interactive
    ? {
        enter: (r: number, i: number) => () => {
          hover.current = key(r, i)
        },
        leave: (r: number, i: number) => () => {
          // Guarded: moving between two cells fires the leave of the old one
          // after the enter of the new one, and an unguarded clear would blank
          // the cell the pointer is now on.
          if (hover.current === key(r, i)) hover.current = null
        },
        leaveField: () => {
          hover.current = null
        },
      }
    : null

  return { cells, handlers }
}
