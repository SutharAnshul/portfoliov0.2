'use client'

import { useState } from 'react'

/**
 * The system's own documentation sheets.
 *
 * Everything else on this page is reconstructed from the file's geometry, which
 * is the honest way to show tokens doing work — but a reconstruction is still a
 * reading. These are the pages as they were drawn, and for the components whose
 * visuals sit too deep to rebuild faithfully (the input fields, the phone and
 * OTP fields) they are the only true record.
 *
 * Thumbnails open full size in place rather than in a new tab, because the
 * whole point of a sheet is comparing it against what sits beside it.
 */

const SHEETS = [
  { file: 'sheet-button', label: 'Button' },
  { file: 'sheet-text-input', label: 'Text Input' },
  { file: 'sheet-select-field', label: 'Select Field' },
  { file: 'sheet-otp-input-field', label: 'OTP Input' },
  { file: 'sheet-phone-number-field', label: 'Phone Number' },
  { file: 'sheet-spacing-system', label: 'Spacing System' },
  { file: 'sheet-typography', label: 'Typography' },
  { file: 'sheet-colours', label: 'Colours' },
  { file: 'sheet-shadow', label: 'Shadow' },
  { file: 'sheet-logotype-and-mark', label: 'Logotype & Mark' },
  { file: 'sheet-website-components', label: 'Website Components' },
]

export function Sheets() {
  const [open, setOpen] = useState<string | null>(null)
  const current = SHEETS.find((s) => s.file === open)

  return (
    <>
      <div className="sheets" data-lenis-prevent>
        {SHEETS.map((s) => (
          <button
            key={s.file}
            onClick={() => setOpen(s.file)}
            data-sfx="tick"
            className="sheet"
            aria-label={`Open the ${s.label} sheet`}
          >
            <span className="sheet-thumb">
              <img src={`/images/superhealth/${s.file}.png`} alt={`${s.label} documentation sheet`} loading="lazy" />
            </span>
            <span className="t-meta sheet-label">{s.label}</span>
          </button>
        ))}
      </div>

      {current && (
        <div className="sheet-view" role="dialog" aria-label={`${current.label} sheet`}>
          <div className="sheet-bar">
            <span className="t-label">{current.label}</span>
            <button onClick={() => setOpen(null)} data-sfx="tick" className="lab-opt t-meta">
              Close
            </button>
          </div>
          <div className="sheet-full" data-lenis-prevent>
            <img src={`/images/superhealth/${current.file}.png`} alt={`${current.label} documentation sheet`} />
          </div>
        </div>
      )}
    </>
  )
}
