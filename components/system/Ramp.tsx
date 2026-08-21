'use client'

import { useState } from 'react'
import type { Swatch } from '@/lib/superhealth'

/**
 * One colour ramp, sized to its own card.
 *
 * Previously every ramp lived in a single full-width section, which made the
 * colour story one long strip regardless of how many steps a ramp had. A ramp
 * with three steps and a ramp with nine are different objects and should not be
 * given the same room.
 *
 * The chip's foreground is chosen from the swatch's own relative luminance
 * rather than its place in the ramp, so a light token in a dark group still
 * reads. Clicking copies the value — a palette you cannot take anything from is
 * a picture of a palette.
 */
export function Ramp({ colours }: { colours: Swatch[] }) {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex)
      setCopied(hex)
      window.setTimeout(() => setCopied((c) => (c === hex ? null : c)), 1100)
    } catch {
      /* clipboard blocked — the value is on screen anyway */
    }
  }

  return (
    <>
      <div className="ramp">
        {colours.map((c) => {
          const dark = c.luminance < 0.45
          return (
            <button
              key={c.name}
              onClick={() => copy(c.hex)}
              data-sfx="tick"
              className="chip"
              style={{ background: c.hex, color: dark ? '#FAFAFA' : '#111111' }}
              title={`${c.name}${c.note ? ' — ' + c.note : ''}`}
            >
              <span className="chip-token">{c.token}</span>
              <span className="chip-hex">{copied === c.hex ? 'copied' : c.hex}</span>
            </button>
          )
        })}
      </div>

      {colours.some((c) => c.note) && (
        <div className="t-meta ramp-notes">
          {colours
            .filter((c) => c.note)
            .slice(0, 3)
            .map((c) => (
              <div key={c.name}>
                ↳ {c.token} — {c.note}
              </div>
            ))}
        </div>
      )}
    </>
  )
}
