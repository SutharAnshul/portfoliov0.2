'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Four typefaces to try on the Work page, and nothing else. Development only.
 *
 * Scoped deliberately: it sets the family on the Work page's own wrapper, so
 * the sidebar, the chat and every other route keep Space Mono and EB Garamond
 * while you compare. Only the index's own type changes — labels, titles,
 * categories, descriptions, years.
 *
 * Nothing is bundled. Georgia is already on the machine; the other three are
 * fetched from Google at the moment they are picked, once each. The choice is
 * remembered so a reload does not lose your place in the comparison.
 */

interface Face {
  id: string
  label: string
  /** Google Fonts family spec; absent for faces the system already has. */
  google?: string
  stack: string
}

const FACES: Face[] = [
  { id: 'default', label: 'Current', stack: '' },
  { id: 'inter', label: 'Inter', google: 'Inter:wght@400;500;600;700', stack: "'Inter', system-ui, sans-serif" },
  { id: 'opensans', label: 'Open Sans', google: 'Open+Sans:wght@400;500;600;700', stack: "'Open Sans', system-ui, sans-serif" },
  { id: 'georgia', label: 'Georgia', stack: "Georgia, 'Times New Roman', serif" },
  { id: 'lora', label: 'Lora', google: 'Lora:ital,wght@0,400;0,500;0,600;1,400', stack: "'Lora', Georgia, serif" },
]

const STORE = 'work-font'

const loaded = new Set<string>()
function ensureFont(google?: string) {
  if (!google || loaded.has(google)) return
  loaded.add(google)
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${google}&display=swap`
  document.head.appendChild(link)
}

const CSS = `
.wfs {
  position: fixed;
  right: var(--s4);
  bottom: calc(var(--advance-h, 0px) + var(--s4));
  z-index: 200;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px;
  border: 1px solid var(--card-line-strong);
  border-radius: var(--r);
  background: color-mix(in srgb, var(--background) 94%, var(--foreground));
  backdrop-filter: blur(8px);
  box-shadow: 0 10px 34px rgba(0, 0, 0, 0.45);
  /* Its own labels must not change with the thing it is changing. */
  font-family: var(--family-ui);
  font-size: 11px;
}

.wfs-label {
  padding: 0 6px 0 4px;
  color: color-mix(in srgb, var(--foreground) 45%, transparent);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 9px;
}

.wfs button {
  padding: 5px 9px;
  border: 1px solid transparent;
  border-radius: var(--r);
  background: transparent;
  color: color-mix(in srgb, var(--foreground) 62%, transparent);
  font: inherit;
  cursor: pointer;
  transition: color 160ms ease, border-color 160ms ease, background-color 160ms ease;
}

.wfs button:hover {
  color: var(--foreground);
  border-color: var(--card-line);
}

.wfs button[data-on='true'] {
  color: var(--foreground);
  border-color: var(--card-line-strong);
  background: color-mix(in srgb, var(--foreground) 8%, transparent);
}
`

export function WorkFontSwitch() {
  const [id, setId] = useState('default')
  /**
   * Portalled to <body>.
   *
   * The Work page sits inside <main>, which carries the page-exit transform,
   * and a transformed ancestor becomes the containing block for anything
   * `position: fixed` inside it — the bar was being positioned against the
   * scrolled page rather than the viewport and landing off-screen.
   */
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const apply = (face: Face) => {
    const root = document.querySelector<HTMLElement>('[data-work-root]')
    if (!root) return
    ensureFont(face.google)
    if (face.stack) root.style.setProperty('--work-family', face.stack)
    else root.style.removeProperty('--work-family')
  }

  useEffect(() => {
    let saved = 'default'
    try {
      saved = localStorage.getItem(STORE) ?? 'default'
    } catch {
      // Blocked storage just means the comparison starts from the default.
    }
    const face = FACES.find((f) => f.id === saved)
    if (face) {
      setId(face.id)
      apply(face)
    }
  }, [])

  const pick = (face: Face) => {
    setId(face.id)
    apply(face)
    try {
      localStorage.setItem(STORE, face.id)
    } catch {}
  }

  if (!mounted) return null

  return createPortal(
    <div className="wfs">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <span className="wfs-label">Work type</span>
      {FACES.map((f) => (
        <button key={f.id} data-on={id === f.id} onClick={() => pick(f)} title={f.stack || 'Space Mono'}>
          {f.label}
        </button>
      ))}
    </div>,
    document.body,
  )
}
