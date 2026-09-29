'use client'

import { useBlockField } from '@/components/blockField'

/**
 * A link set as a field of cells, on the same clock as the name mark.
 *
 * One row of eighteen where the mark has two of six, and that is the only
 * difference between them. Both take COVER to cover and REVEAL to reveal, so
 * they leave the reading state on the same frame and arrive back on the same
 * frame — a sweep here simply moves three times as far in the same time. See
 * blockField for the shared clock that makes that true across two components.
 *
 * The ripple is the mark's, unchanged: the wave leaves the character under the
 * pointer and travels out in both directions, pink on the wavefront, unwinding
 * from the outside in when the pointer goes. On one row the mark's ring
 * distance collapses to the distance along the line, which is what makes it
 * read as two fronts rather than one.
 *
 * ── What the accessibility tree sees ────────────────────────────────────
 * The label, once, as text. The cells are decoration: they are the same
 * characters over and over in states a screen reader has no use for, and an
 * `aria-hidden` grid beside a plain label is the arrangement the mark already
 * uses.
 */
export function BlockLink({
  label,
  rows,
  className = '',
  ...anchor
}: {
  /** What the link is called, for anything that reads the page aloud. */
  label: string
  /** The characters to set as cells — the label plus whatever trails it. */
  rows: readonly string[]
  className?: string
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { cells, handlers } = useBlockField(rows)

  return (
    <a className={`block-link ${className}`.trim()} {...anchor}>
      <span className="sr-only">{label}</span>
      <span
        /* The crosshair stands aside, for the reason it stands aside on the
           mark: the character under the pointer is the one resolving into a
           letter, and a cell is one character wide, so four arms around it
           cover the very thing they are uncovering. */
        className="sig-grid cursor-blank"
        aria-hidden={true}
        /* Unguarded, and the only clear that cannot be outrun — see NameMark
           for why the per-cell one is not enough on its own. */
        onPointerLeave={handlers?.leaveField}
      >
        {rows.map((word, r) => (
          <span className="sig-row" key={r}>
            {[...word].map((ch, i) => (
              <span
                className="sig-cell"
                data-cell={cells[r][i]}
                key={`${r}-${i}`}
                onPointerEnter={handlers?.enter(r, i)}
                onPointerLeave={handlers?.leave(r, i)}
              >
                {ch}
              </span>
            ))}
          </span>
        ))}
      </span>
    </a>
  )
}
