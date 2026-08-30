'use client'

import { useEffect, useState } from 'react'

/**
 * A live control surface for the site's type scale. Development only.
 *
 * Every size the site sets is a custom property on :root (see the type scale
 * block in globals.css). This writes to those properties directly, so the
 * whole site re-renders at the new size as the slider moves — no rebuild, no
 * reload, and nothing to undo afterwards because nothing in the source has
 * changed until you decide to keep it.
 *
 * The four clamped sizes are tuned at their *maximum*: the token sits in the
 * third slot of the clamp, so the responsive floor underneath is untouched
 * and what you are moving is the size the type grows to on a wide screen.
 *
 * "Copy CSS" gives back only what you actually changed, ready to paste over
 * the defaults. Choices survive a reload via localStorage, so a long session
 * of nudging is not lost to a stray refresh.
 */

type Unit = 'px' | 'rem'

interface Token {
  /** Custom property name, without the leading dashes. */
  key: string
  label: string
  /** Where it shows up, so a slider with no visible effect is explicable. */
  where: string
  unit: Unit
  min: number
  max: number
  step: number
  clamped?: boolean
}

const TOKENS: Token[] = [
  { key: 'fs-lede', label: 'Lede', where: 'About opening statement', unit: 'px', min: 14, max: 48, step: 0.5, clamped: true },
  { key: 'fs-body', label: 'Body', where: 'Paragraphs, list entries', unit: 'px', min: 10, max: 20, step: 0.5 },
  { key: 'fs-meta', label: 'Meta', where: 'Dates, captions, counts', unit: 'px', min: 8, max: 16, step: 0.5 },
  { key: 'fs-label', label: 'Label', where: 'Small uppercase headers', unit: 'px', min: 7, max: 14, step: 0.5 },
  { key: 'fs-title', label: 'Title', where: 'Nav and card titles', unit: 'px', min: 9, max: 18, step: 0.5 },
  { key: 'fs-value', label: 'Value', where: 'Email, location', unit: 'px', min: 10, max: 20, step: 0.5 },
  { key: 'fs-cv', label: 'CV link', where: 'Sidebar, italic serif', unit: 'px', min: 11, max: 24, step: 0.5 },
  { key: 'fs-studyno', label: 'Study no.', where: 'Sidebar index plates', unit: 'px', min: 10, max: 22, step: 0.5 },
  { key: 'fs-prose', label: 'Case prose', where: 'Case study body', unit: 'px', min: 11, max: 22, step: 0.5 },
  { key: 'fs-name', label: 'Name', where: 'Sidebar identity, serif', unit: 'rem', min: 0.9, max: 2.6, step: 0.02 },
  { key: 'fs-head', label: 'Heading', where: 'Section headings, serif', unit: 'rem', min: 0.9, max: 3, step: 0.02 },
  { key: 'fs-num', label: 'Numeral', where: 'Large figures', unit: 'rem', min: 1, max: 4, step: 0.05 },
  { key: 'fs-display', label: 'Display', where: 'Largest serif', unit: 'rem', min: 1.4, max: 4.5, step: 0.05, clamped: true },
  { key: 'fs-case-title', label: 'Case title', where: 'Case study name', unit: 'rem', min: 2, max: 8, step: 0.05, clamped: true },
  { key: 'fs-case-deck', label: 'Case deck', where: 'Case study one-liner', unit: 'rem', min: 0.9, max: 2.6, step: 0.02, clamped: true },
]

const STORE = 'type-tuner'

const parse = (raw: string) => Number.parseFloat(raw.trim())

export function TypeTuner() {
  const [values, setValues] = useState<Record<string, number> | null>(null)
  const [defaults, setDefaults] = useState<Record<string, number>>({})
  const [open, setOpen] = useState(true)
  const [copied, setCopied] = useState(false)

  /** Read the stylesheet's own values once, so the panel starts truthful. */
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement)
    const base: Record<string, number> = {}
    for (const t of TOKENS) base[t.key] = parse(cs.getPropertyValue(`--${t.key}`))
    setDefaults(base)

    let saved: Record<string, number> = {}
    try {
      saved = JSON.parse(localStorage.getItem(STORE) ?? '{}')
    } catch {
      // A corrupt entry is not worth failing over; start from the defaults.
    }
    const next = { ...base, ...saved }
    setValues(next)
    for (const t of TOKENS) {
      if (saved[t.key] != null) {
        document.documentElement.style.setProperty(`--${t.key}`, `${saved[t.key]}${t.unit}`)
      }
    }
  }, [])

  const set = (t: Token, v: number) => {
    document.documentElement.style.setProperty(`--${t.key}`, `${v}${t.unit}`)
    setValues((prev) => {
      const next = { ...(prev ?? {}), [t.key]: v }
      try {
        // Store only what differs, so resetting a slider truly forgets it.
        const changed = Object.fromEntries(
          Object.entries(next).filter(([k, val]) => val !== defaults[k]),
        )
        localStorage.setItem(STORE, JSON.stringify(changed))
      } catch {
        // Private mode, quota, blocked storage — tuning still works, it just
        // will not survive a reload.
      }
      return next
    })
    setCopied(false)
  }

  const reset = () => {
    for (const t of TOKENS) document.documentElement.style.removeProperty(`--${t.key}`)
    try {
      localStorage.removeItem(STORE)
    } catch {}
    setValues({ ...defaults })
    setCopied(false)
  }

  const changed = values
    ? TOKENS.filter((t) => values[t.key] != null && values[t.key] !== defaults[t.key])
    : []

  const copy = () => {
    const css = changed.map((t) => `  --${t.key}: ${values![t.key]}${t.unit};`).join('\n')
    navigator.clipboard?.writeText(css || '/* nothing changed yet */')
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  if (!values) return null

  return (
    <div className="tuner" data-open={open}>
      <button className="tuner-tab t-label" onClick={() => setOpen((v) => !v)}>
        Type {open ? '▾' : '▴'}
        {changed.length > 0 && <span className="tuner-count">{changed.length}</span>}
      </button>

      {open && (
        <div className="tuner-body">
          {TOKENS.map((t) => {
            const v = values[t.key]
            const dirty = v !== defaults[t.key]
            return (
              <label key={t.key} className="tuner-row" data-dirty={dirty} title={t.where}>
                <span className="tuner-name t-meta">{t.label}</span>
                <input
                  type="range"
                  min={t.min}
                  max={t.max}
                  step={t.step}
                  value={v}
                  onChange={(e) => set(t, Number(e.target.value))}
                />
                <input
                  type="number"
                  className="tuner-num t-meta"
                  min={t.min}
                  max={t.max}
                  step={t.step}
                  value={v}
                  onChange={(e) => {
                    const n = Number(e.target.value)
                    if (Number.isFinite(n)) set(t, n)
                  }}
                />
                <span className="tuner-unit t-meta">
                  {t.unit}
                  {t.clamped && <em title="tunes the clamp maximum">*</em>}
                </span>
              </label>
            )
          })}

          <div className="tuner-foot">
            <button className="tuner-btn t-label" onClick={copy}>
              {copied ? 'Copied' : `Copy CSS (${changed.length})`}
            </button>
            <button className="tuner-btn t-label" onClick={reset}>
              Reset
            </button>
          </div>
          <p className="tuner-note t-meta">
            * tunes the clamp maximum. Paste into the type scale block in
            globals.css to keep.
          </p>
        </div>
      )}
    </div>
  )
}
