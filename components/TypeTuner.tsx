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

type Unit = 'px' | 'rem' | 'em' | ''

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
  group: 'Size' | 'Leading' | 'Tracking' | 'Weight'
}

/**
 * Families offered as alternatives, fetched from Google only when picked.
 *
 * Nothing here is bundled: the default entry resolves to the next/font
 * variable the site already ships, and choosing any other appends a
 * stylesheet link at that moment. So the experiment costs a request in
 * development and nothing at all in production.
 *
 * `stack` is what gets written into the family token, fallbacks included, so
 * the page stays readable in the moment before the webfont lands.
 */
interface Family {
  label: string
  /** Google Fonts family name; empty for the site's own default. */
  google?: string
  stack: string
}

const MONO: Family[] = [
  { label: 'Space Mono ·', stack: 'var(--font-ui), ui-monospace, SFMono-Regular, Menlo, monospace' },
  { label: 'IBM Plex Mono', google: 'IBM+Plex+Mono:wght@400;500;600;700', stack: "'IBM Plex Mono', ui-monospace, monospace" },
  { label: 'JetBrains Mono', google: 'JetBrains+Mono:wght@400;500;700', stack: "'JetBrains Mono', ui-monospace, monospace" },
  { label: 'Roboto Mono', google: 'Roboto+Mono:wght@400;500;700', stack: "'Roboto Mono', ui-monospace, monospace" },
  { label: 'DM Mono', google: 'DM+Mono:wght@400;500', stack: "'DM Mono', ui-monospace, monospace" },
  { label: 'Fira Code', google: 'Fira+Code:wght@400;500;700', stack: "'Fira Code', ui-monospace, monospace" },
  { label: 'Courier Prime', google: 'Courier+Prime:wght@400;700', stack: "'Courier Prime', ui-monospace, monospace" },
  { label: 'Inter (sans)', google: 'Inter:wght@400;500;600;700', stack: "'Inter', system-ui, sans-serif" },
  { label: 'Geist (sans)', google: 'Geist:wght@400;500;600;700', stack: "'Geist', system-ui, sans-serif" },
]

const SERIF: Family[] = [
  { label: 'EB Garamond ·', stack: 'var(--font-display), Georgia, serif' },
  { label: 'Instrument Serif', google: 'Instrument+Serif:ital@0;1', stack: "'Instrument Serif', Georgia, serif" },
  { label: 'Playfair Display', google: 'Playfair+Display:ital,wght@0,400;0,600;1,400', stack: "'Playfair Display', Georgia, serif" },
  { label: 'Cormorant', google: 'Cormorant+Garamond:ital,wght@0,400;0,600;1,400', stack: "'Cormorant Garamond', Georgia, serif" },
  { label: 'Libre Baskerville', google: 'Libre+Baskerville:ital,wght@0,400;0,700;1,400', stack: "'Libre Baskerville', Georgia, serif" },
  { label: 'Lora', google: 'Lora:ital,wght@0,400;0,600;1,400', stack: "'Lora', Georgia, serif" },
  { label: 'Spectral', google: 'Spectral:ital,wght@0,400;0,600;1,400', stack: "'Spectral', Georgia, serif" },
  { label: 'DM Serif Display', google: 'DM+Serif+Display:ital@0;1', stack: "'DM Serif Display', Georgia, serif" },
  { label: 'Newsreader', google: 'Newsreader:ital,wght@0,400;0,600;1,400', stack: "'Newsreader', Georgia, serif" },
]

const TOKENS: Token[] = [
  { key: 'fs-lede', label: 'Lede', where: 'About opening statement', unit: 'px', min: 14, max: 48, step: 0.5, clamped: true, group: 'Size' },
  { key: 'fs-body', label: 'Body', where: 'Paragraphs, list entries', unit: 'px', min: 10, max: 20, step: 0.5, group: 'Size' },
  { key: 'fs-meta', label: 'Meta', where: 'Dates, captions, counts', unit: 'px', min: 8, max: 16, step: 0.5, group: 'Size' },
  { key: 'fs-label', label: 'Label', where: 'Small uppercase headers', unit: 'px', min: 7, max: 14, step: 0.5, group: 'Size' },
  { key: 'fs-title', label: 'Title', where: 'Nav and card titles', unit: 'px', min: 9, max: 18, step: 0.5, group: 'Size' },
  { key: 'fs-value', label: 'Value', where: 'Email, location', unit: 'px', min: 10, max: 20, step: 0.5, group: 'Size' },
  { key: 'fs-cv', label: 'CV link', where: 'Sidebar, italic serif', unit: 'px', min: 11, max: 24, step: 0.5, group: 'Size' },
  { key: 'fs-studyno', label: 'Study no.', where: 'Sidebar index plates', unit: 'px', min: 10, max: 22, step: 0.5, group: 'Size' },
  { key: 'fs-prose', label: 'Case prose', where: 'Case study body', unit: 'px', min: 11, max: 22, step: 0.5, group: 'Size' },
  { key: 'fs-name', label: 'Name', where: 'Sidebar identity, serif', unit: 'rem', min: 0.9, max: 2.6, step: 0.02, group: 'Size' },
  { key: 'fs-head', label: 'Heading', where: 'Section headings, serif', unit: 'rem', min: 0.9, max: 3, step: 0.02, group: 'Size' },
  { key: 'fs-num', label: 'Numeral', where: 'Large figures', unit: 'rem', min: 1, max: 4, step: 0.05, group: 'Size' },
  { key: 'fs-display', label: 'Display', where: 'Largest serif', unit: 'rem', min: 1.4, max: 4.5, step: 0.05, clamped: true, group: 'Size' },
  { key: 'fs-case-title', label: 'Case title', where: 'Case study name', unit: 'rem', min: 2, max: 8, step: 0.05, clamped: true, group: 'Size' },
  { key: 'fs-case-deck', label: 'Case deck', where: 'Case study one-liner', unit: 'rem', min: 0.9, max: 2.6, step: 0.02, clamped: true, group: 'Size' },

  // Unitless, so leading follows whatever size the row above is set to.
  { key: 'lh-lede', label: 'Lede', where: 'About opening statement', unit: '', min: 1, max: 2.2, step: 0.01, group: 'Leading' },
  { key: 'lh-record', label: 'Record', where: 'About experience list', unit: '', min: 1.1, max: 2.4, step: 0.01, group: 'Leading' },
  { key: 'lh-body', label: 'Body', where: 'Paragraphs, list entries', unit: '', min: 1.1, max: 2.4, step: 0.01, group: 'Leading' },
  { key: 'lh-meta', label: 'Meta', where: 'Dates, captions', unit: '', min: 1, max: 2.2, step: 0.01, group: 'Leading' },
  { key: 'lh-prose', label: 'Case prose', where: 'Case study body', unit: '', min: 1.2, max: 2.4, step: 0.01, group: 'Leading' },
  { key: 'lh-head', label: 'Heading', where: 'Section headings', unit: '', min: 0.85, max: 1.8, step: 0.01, group: 'Leading' },
  { key: 'lh-name', label: 'Name', where: 'Sidebar identity', unit: '', min: 0.85, max: 1.8, step: 0.01, group: 'Leading' },
  { key: 'lh-display', label: 'Display', where: 'Largest serif', unit: '', min: 0.8, max: 1.6, step: 0.01, group: 'Leading' },
  { key: 'lh-case-title', label: 'Case title', where: 'Case study name', unit: '', min: 0.8, max: 1.6, step: 0.01, group: 'Leading' },

  // em rather than px, so tracking scales with the type instead of fighting it.
  { key: 'ls-label', label: 'Label', where: 'Small uppercase headers', unit: 'em', min: 0, max: 0.4, step: 0.005, group: 'Tracking' },
  { key: 'ls-title', label: 'Title', where: 'Nav and card titles', unit: 'em', min: 0, max: 0.3, step: 0.005, group: 'Tracking' },
  { key: 'ls-head', label: 'Heading', where: 'Section headings', unit: 'em', min: -0.06, max: 0.06, step: 0.001, group: 'Tracking' },
  { key: 'ls-name', label: 'Name', where: 'Sidebar identity', unit: 'em', min: -0.06, max: 0.06, step: 0.001, group: 'Tracking' },
  { key: 'ls-display', label: 'Display', where: 'Largest serif', unit: 'em', min: -0.06, max: 0.06, step: 0.001, group: 'Tracking' },
  { key: 'ls-case-title', label: 'Case title', where: 'Case study name', unit: 'em', min: -0.06, max: 0.06, step: 0.001, group: 'Tracking' },

  // JetBrains Mono ships 100–800; the steps below are the ones it actually has.
  { key: 'fw-body', label: 'Body', where: 'Paragraphs, list entries', unit: '', min: 300, max: 700, step: 100, group: 'Weight' },
  { key: 'fw-label', label: 'Label', where: 'Small uppercase headers', unit: '', min: 300, max: 800, step: 100, group: 'Weight' },
  { key: 'fw-title', label: 'Title', where: 'Nav and card titles', unit: '', min: 300, max: 800, step: 100, group: 'Weight' },
]

const GROUPS = ['Size', 'Leading', 'Tracking', 'Weight'] as const

const CSS = `
/* ─── Type tuner ──────────────────────────────────────────────────────────
   Development only — mounted behind a NODE_ENV check, so none of this reaches
   a build. Deliberately plain: it is an instrument for looking at the site,
   and it should not be interesting enough to look at itself. */

.tuner {
  position: fixed;
  right: var(--s4);
  bottom: var(--s4);
  z-index: 200;
  width: 310px;
  max-height: calc(100vh - var(--s6) * 2);
  display: flex;
  flex-direction: column;
  border: 1px solid var(--card-line-strong);
  border-radius: var(--r);
  background: color-mix(in srgb, var(--background) 94%, var(--foreground));
  backdrop-filter: blur(8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
  /* Its own type must not move when the sliders do, or reading the panel
     becomes part of the experiment. */
  font-size: 11px;
}

.tuner-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px var(--s3);
  background: none;
  border: 0;
  border-bottom: 1px solid var(--card-line);
  color: var(--foreground);
  cursor: pointer;
  text-align: left;
}

.tuner[data-open='false'] .tuner-tab {
  border-bottom: 0;
}

.tuner-count {
  margin-left: auto;
  padding: 1px 6px;
  border-radius: 99px;
  background: color-mix(in srgb, var(--foreground) 18%, transparent);
  font-variant-numeric: tabular-nums;
}

.tuner-body {
  overflow-y: auto;
  padding: var(--s3);
}

.tuner-row {
  display: grid;
  grid-template-columns: 74px 1fr 46px 22px;
  align-items: center;
  gap: 7px;
  padding: 3px 0;
}

.tuner-row[data-dirty='true'] .tuner-name {
  color: var(--foreground);
}

.tuner-name {
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tuner-row input[type='range'] {
  width: 100%;
  accent-color: color-mix(in srgb, var(--foreground) 70%, transparent);
}

.tuner-num {
  width: 100%;
  padding: 2px 4px;
  border: 1px solid var(--card-line);
  border-radius: var(--r-sm, 2px);
  background: transparent;
  color: var(--foreground);
  font-family: inherit;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.tuner-unit em {
  font-style: normal;
  color: color-mix(in srgb, var(--foreground) 70%, transparent);
}

.tuner-foot {
  display: flex;
  gap: 6px;
  margin-top: var(--s3);
  padding-top: var(--s3);
  border-top: 1px solid var(--card-line);
}

.tuner-btn {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid var(--card-line);
  border-radius: var(--r);
  background: transparent;
  color: var(--foreground);
  cursor: pointer;
  transition: border-color 180ms ease, background-color 180ms ease;
}

.tuner-btn:hover {
  border-color: var(--card-line-strong);
  background: color-mix(in srgb, var(--foreground) 7%, transparent);
}

.tuner-note {
  margin-top: 8px;
  font-size: 10px;
  line-height: 1.45;
}

.tuner-group {
  margin: 10px 0 4px;
  padding-top: 8px;
  border-top: 1px solid var(--card-line);
  font-size: 9px;
}

.tuner-body > .tuner-group:first-child,
.tuner-body > div:first-of-type > .tuner-group {
  margin-top: 0;
  padding-top: 0;
  border-top: 0;
}

.tuner-font {
  display: grid;
  grid-template-columns: 74px 1fr;
  align-items: center;
  gap: 7px;
  padding: 3px 0;
}

.tuner-font[data-dirty='true'] .tuner-name {
  color: var(--foreground);
}

.tuner-font select {
  width: 100%;
  padding: 3px 4px;
  border: 1px solid var(--card-line);
  border-radius: var(--r-sm, 2px);
  background: var(--background);
  color: var(--foreground);
  font-family: inherit;
  font-size: 11px;
}

/* On a phone it sits above the nav rail rather than on top of it — a tool
   that blocks the thing you are testing is not a tool. --rail-h is measured
   and published by MobileChrome. */
@media (max-width: 899px) {
  .tuner {
    right: var(--s3);
    left: var(--s3);
    bottom: calc(var(--rail-h, 64px) + var(--s3));
    width: auto;
    max-height: 70vh;
  }
}
`

const STORE = 'type-tuner'
const FONT_STORE = 'type-tuner-fonts'

const parse = (raw: string) => Number.parseFloat(raw.trim())

/**
 * Pull a family from Google, once.
 *
 * Keyed by the family string so flipping back and forth between two choices
 * does not stack up duplicate <link>s, and left in place afterwards — a font
 * already fetched should not be fetched again when you return to it.
 */
const loaded = new Set<string>()
function ensureFont(google?: string) {
  if (!google || loaded.has(google)) return
  loaded.add(google)
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${google}&display=swap`
  link.dataset.tuner = 'font'
  document.head.appendChild(link)
}

export function TypeTuner() {
  const [values, setValues] = useState<Record<string, number> | null>(null)
  const [defaults, setDefaults] = useState<Record<string, number>>({})
  /**
   * Open on a desktop, shut on a phone. At 310px wide the panel covers most
   * of a 375px viewport, which makes it impossible to check the thing it is
   * supposed to be measuring.
   */
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  /** Index into MONO / SERIF; 0 is the site's own. */
  const [fonts, setFonts] = useState({ ui: 0, display: 0 })

  /** Read the stylesheet's own values once, so the panel starts truthful. */
  useEffect(() => {
    setOpen(window.matchMedia('(min-width: 900px)').matches)
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

    try {
      const f = JSON.parse(localStorage.getItem(FONT_STORE) ?? 'null')
      if (f && (f.ui || f.display)) {
        setFonts(f)
        if (f.ui) applyFamily('ui', MONO[f.ui])
        if (f.display) applyFamily('display', SERIF[f.display])
      }
    } catch {
      // Same as above: a bad entry just means starting from the site's own.
    }
  }, [])

  const applyFamily = (slot: 'ui' | 'display', family: Family) => {
    ensureFont(family.google)
    document.documentElement.style.setProperty(`--family-${slot}`, family.stack)
  }

  const pickFont = (slot: 'ui' | 'display', index: number) => {
    const family = (slot === 'ui' ? MONO : SERIF)[index]
    applyFamily(slot, family)
    const next = { ...fonts, [slot]: index }
    setFonts(next)
    try {
      localStorage.setItem(FONT_STORE, JSON.stringify(next))
    } catch {}
    setCopied(false)
  }

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
    for (const slot of ['ui', 'display'] as const) {
      document.documentElement.style.removeProperty(`--family-${slot}`)
    }
    try {
      localStorage.removeItem(STORE)
      localStorage.removeItem(FONT_STORE)
    } catch {}
    setValues({ ...defaults })
    setFonts({ ui: 0, display: 0 })
    setCopied(false)
  }

  const changed = values
    ? TOKENS.filter((t) => values[t.key] != null && values[t.key] !== defaults[t.key])
    : []

  const copy = () => {
    const lines = changed.map((t) => `  --${t.key}: ${values![t.key]}${t.unit};`)

    // Families come back as a note, not as CSS: swapping one properly means
    // changing the next/font import in layout.tsx, and pasting a Google stack
    // into globals.css would quietly give up self-hosting and preloading.
    const notes: string[] = []
    if (fonts.ui) notes.push(`/* body/UI: ${MONO[fonts.ui].label} — change the next/font import in app/layout.tsx */`)
    if (fonts.display) notes.push(`/* display: ${SERIF[fonts.display].label} — same */`)

    const out = [...notes, ...lines].join('\n')
    navigator.clipboard?.writeText(out || '/* nothing changed yet */')
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  if (!values) return null

  return (
    <div className="tuner" data-open={open}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <button className="tuner-tab t-label" onClick={() => setOpen((v) => !v)}>
        Type {open ? '▾' : '▴'}
        {changed.length > 0 && <span className="tuner-count">{changed.length}</span>}
      </button>

      {open && (
        <div className="tuner-body">
          <div className="tuner-group t-label">Family</div>
          <label className="tuner-font" data-dirty={fonts.ui > 0}>
            <span className="tuner-name t-meta">Body / UI</span>
            <select value={fonts.ui} onChange={(e) => pickFont('ui', Number(e.target.value))}>
              {MONO.map((f, i) => (
                <option key={f.label} value={i}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="tuner-font" data-dirty={fonts.display > 0}>
            <span className="tuner-name t-meta">Display</span>
            <select
              value={fonts.display}
              onChange={(e) => pickFont('display', Number(e.target.value))}
            >
              {SERIF.map((f, i) => (
                <option key={f.label} value={i}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>

          {GROUPS.map((g) => (
            <div key={g}>
              <div className="tuner-group t-label">{g}</div>
              {TOKENS.filter((t) => t.group === g).map((t) => {
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
                      {t.unit || '—'}
                      {t.clamped && <em title="tunes the clamp maximum">*</em>}
                    </span>
                  </label>
                )
              })}
            </div>
          ))}

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
