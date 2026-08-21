'use client'

import { useState } from 'react'
import type { Swatch } from '@/lib/superhealth'

/**
 * The colour ramps.
 *
 * Each chip carries the value it would be pasted as, and clicking copies it —
 * a palette you cannot take anything away from is a picture of a palette.
 *
 * The foreground of each chip is chosen from the swatch's own relative
 * luminance rather than from its position in a ramp, so a light token in a
 * dark group still reads. That threshold (0.45) is where black text overtakes
 * white for contrast on a mid-tone.
 */
export function Swatches({ colours }: { colours: Swatch[] }) {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex)
      setCopied(hex)
      window.setTimeout(() => setCopied((c) => (c === hex ? null : c)), 1200)
    } catch {
      /* clipboard blocked — the value is on screen anyway */
    }
  }

  // Group by the ramp the token belongs to, keeping file order within a ramp.
  const groups = new Map<string, Swatch[]>()
  for (const c of colours) {
    const key = [c.scheme, c.group].filter(Boolean).join(' / ') || 'Ungrouped'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(c)
  }

  return (
    <div className="stack" style={{ ['--gap' as string]: 'var(--s6)' }}>
      {[...groups.entries()].map(([name, ramp]) => (
        <div key={name}>
          <div className="flex items-baseline justify-between" style={{ paddingBottom: 'var(--s3)' }}>
            <span className="t-label">{name}</span>
            <span className="t-label">{String(ramp.length).padStart(2, '0')}</span>
          </div>
          <div className="sw-ramp">
            {ramp.map((c) => {
              const dark = c.luminance < 0.45
              return (
                <button
                  key={c.name}
                  onClick={() => copy(c.hex)}
                  data-sfx="tick"
                  className="sw"
                  style={{ background: c.hex, color: dark ? '#FAFAFA' : '#111111' }}
                  title={`${c.name}${c.note ? ' — ' + c.note : ''}`}
                >
                  <span className="sw-token">{c.token}</span>
                  <span className="sw-hex">{copied === c.hex ? 'copied' : c.hex}</span>
                </button>
              )
            })}
          </div>
          {/* The file documents contrast on some tokens; surface it rather than
              hiding real design intent inside a tooltip. */}
          {ramp.some((c) => c.note) && (
            <div className="t-meta" style={{ marginTop: 'var(--s3)', lineHeight: 1.7 }}>
              {ramp
                .filter((c) => c.note)
                .map((c) => (
                  <div key={c.name}>
                    ↳ {c.token} — {c.note}
                  </div>
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
