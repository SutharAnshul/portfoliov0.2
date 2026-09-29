'use client'

import { createElement } from 'react'
import { SETTLE, useBlockField } from '@/components/blockField'

/**
 * The name, as a field of cells that periodically resolve out of solid blocks.
 *
 * Two words of six characters happens to be the whole idea: Anshul over
 * Suthar is a rectangle, so the blocked state is a clean 6×2 field rather
 * than a ragged one, and every cell is exactly one monospace character wide
 * whether it is holding a letter or a block.
 *
 * Set in capitals. The grid does not care either way — the face is monospace,
 * so an uppercase advance is the same 1ch as a lowercase one, and the mark is
 * exactly as wide as it was; with no lowercase there is no descender to fall
 * out of a cell either. What changes is the reading: capitals make it a
 * logotype rather than a signature, which is what it is doing at the head of
 * the page.
 *
 * Only the blocks are set this way. The name itself is written properly for
 * anything that reads the page aloud — see the label under the grid.
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
 * The cover radiates out from the box under the pointer, one ring of cells
 * every 30ms, and leaving unwinds the same ripple from the outside in. The
 * wavefront is pink and only the wavefront.
 *
 * ── Not the only field on the page ──────────────────────────────────────
 *
 * The timing, the sweeps and the ripple all live in blockField, because the
 * link to the CV is the same thing in one row of eighteen cells and has to
 * stay in step with this. See there for how two fields of different lengths
 * start and finish together.
 */

/* A module constant, so the field's effect has a stable identity to depend on
   rather than a new array on every render. */
const ROWS = ['ANSHUL', 'SUTHAR'] as const

export function NameMark({
  as = 'h1',
  interactive = true,
  settle = SETTLE,
  className = '',
}: {
  /**
   * Milliseconds from first paint before the first sweep, not from mount.
   *
   * From first paint, because what matters is how long the reader has been
   * looking at it — and hydration lands well after the mark is on screen.
   * Counting from mount would make the wait longest exactly when the reader
   * has already been waiting.
   *
   * Only the first field on the page sets this; the rest inherit it, which is
   * what keeps them in phase.
   */
  settle?: number
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
  const { cells, handlers } = useBlockField(ROWS, { interactive, settle })

  return createElement(
    as,
    { className: `sig ${className}`.trim() },
    <span className="sr-only">Anshul Suthar</span>,
    <span
      /* The crosshair gets out of the way here: the cell under the pointer is
         resolving into its letter, and the mark would be standing on it. */
      className={`sig-grid${interactive ? ' cursor-blank' : ''}`}
      aria-hidden={true}
      /* The unconditional clear.

         Each cell clears itself on leave, but that clear is guarded — it has
         to be, because moving between two cells fires the old one's leave
         after the new one's enter, and an unguarded clear would blank the cell
         the pointer just arrived on. The guard is what made leaving the mark
         altogether unreliable: flick the pointer off the grid fast enough, or
         out of the window, and the last cell's leave never arrives, so nothing
         ever clears it and one box sits resolved for good.

         The grid's own leave fires whenever the pointer exits the whole mark,
         whichever cell it was over, and it has no neighbour to be confused by
         — so it needs no guard and cannot be outrun. */
      onPointerLeave={handlers?.leaveField}
    >
      {ROWS.map((word, r) => (
        <span className="sig-row" key={word}>
          {[...word].map((ch, i) => (
            <span
              className="sig-cell"
              data-cell={cells[r][i]}
              key={`${word}-${i}`}
              onPointerEnter={handlers?.enter(r, i)}
              onPointerLeave={handlers?.leave(r, i)}
            >
              {ch}
            </span>
          ))}
        </span>
      ))}
    </span>,
  )
}
