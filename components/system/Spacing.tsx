'use client'

import { system } from '@/lib/superhealth'

/**
 * The spacing scale, drawn to length.
 *
 * The file documents this as a ladder of bars, and that is the right drawing:
 * a table of numbers tells you 48 is bigger than 32, but only the bars show
 * that the scale doubles at the top and steps in fours at the bottom.
 *
 * Bars are drawn at true proportion against the largest step, so 4XL is twenty
 * times the length of 2XS on screen because it is twenty times the value.
 */
export function Spacing() {
  // The file holds each step twice — bare (M) and prefixed (Spacing/M) — and
  // the two live in different variable sets, so the name prefix is the reliable
  // signal, not the set. Filtering on set dropped all nine.
  const steps = system.variables
    .filter((v) => v.name.startsWith('Spacing/') && typeof v.value === 'number')
    .map((v) => ({ token: v.name.replace('Spacing/', ''), px: v.value as number }))
    .sort((a, b) => a.px - b.px)

  if (!steps.length) return null
  const max = steps[steps.length - 1].px

  return (
    <div className="spacing">
      {steps.map((s) => (
        <div key={s.token} className="sp-row">
          <span className="sp-token t-meta">{s.token}</span>
          <span className="sp-bar" style={{ width: `${(s.px / max) * 100}%` }} />
          <span className="sp-val t-meta">
            {s.px}
            <span className="sp-unit">px</span>
          </span>
          <span className="sp-rem t-meta">{+(s.px / 16).toFixed(2)}rem</span>
        </div>
      ))}
    </div>
  )
}
