'use client'

import { useState } from 'react'
import { buttons, type ButtonVariant } from '@/lib/superhealth-buttons'

/**
 * The buttons, laid out the way the file lays them out.
 *
 * Two earlier attempts got this wrong. The first let you pick Type and State
 * and drew an approximation from a flat colour — which made the reader assemble
 * the matrix themselves, and drew the wrong thing anyway: the real Primary
 * button is a two-stop gradient at 310°. The second rendered the real geometry
 * but split the focused variants into a separate strip, so the ring read as an
 * afterthought rather than as a column of the matrix.
 *
 * The documentation sheet puts focus inline — Default, Hover, Active, then the
 * same three focused, then Disabled — because focus is a state the button can
 * be in, not a different button. That is what this follows.
 */

const TYPES = ['Hero', 'Primary', 'Secondary']

/** The seven columns of the sheet, in its order. */
const COLUMNS: { label: string; sub?: string; state: string; focused: boolean }[] = [
  { label: 'Default', state: 'Default', focused: false },
  { label: 'Hover', state: 'Hover', focused: false },
  { label: 'Active', state: 'Active', focused: false },
  { label: 'Default', sub: 'Focused', state: 'Default', focused: true },
  { label: 'Hover', sub: 'Focused', state: 'Hover', focused: true },
  { label: 'Active', sub: 'Focused', state: 'Active', focused: true },
  { label: 'Disabled', state: 'Disabled', focused: false },
]

function Button({ v, reveal }: { v: ButtonVariant; reveal: boolean }) {
  const l = v.label
  return (
    <div className="bg-cell">
      <div
        className="bg-btn"
        style={{
          background: v.background,
          border: v.border ?? '1px solid transparent',
          borderRadius: v.radius,
          padding: `${v.padY ?? 12}px ${v.padX ?? 16}px`,
          gap: v.gap ?? 8,
          boxShadow: v.shadow ?? 'none',
          color: l?.color,
          fontSize: l?.size ?? 14,
          lineHeight: l?.lineHeight ?? 1.2,
          letterSpacing: l?.letterSpacing ? `${l.letterSpacing}em` : undefined,
        }}
      >
        {l?.text || 'Button'}
      </div>

      {reveal && (
        <div className="bg-spec t-meta">
          <span>r{v.radius}</span>
          <span>
            {v.padY}/{v.padX}
          </span>
          {v.backgroundKind === 'gradient' && <span className="bg-grad">gradient</span>}
          {v.bindings.map((b) => (
            <span key={b.prop} className="bg-bind">
              {b.token.split('/').pop()}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function ButtonGallery() {
  const [reveal, setReveal] = useState(false)
  const [size, setSize] = useState('Large')

  const sizes = [...new Set(buttons.map((b) => b.props.Size).filter(Boolean))]

  const find = (type: string, state: string, focused: boolean) =>
    buttons.find(
      (b) =>
        b.props.Size === size &&
        b.props.Type === type &&
        b.props.State === state &&
        (b.props.Focused === 'True') === focused,
    )

  return (
    <div>
      <div className="bg-bar">
        <div className="lab-row">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              data-sfx="tick"
              data-on={size === s}
              className="lab-opt t-meta"
            >
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={() => setReveal((v) => !v)}
          data-sfx="tick"
          data-on={reveal}
          className="lab-opt t-meta"
        >
          {reveal ? 'Hide' : 'Reveal'} what drives them
        </button>
      </div>

      <div className="bg-scroll" data-lenis-prevent>
        <div className="bg-grid">
          <div className="bg-corner" />
          {COLUMNS.map((c) => (
            <div key={c.label + (c.sub ?? '')} className="t-label bg-colhead">
              {c.label}
              {c.sub && <span className="bg-colsub">{c.sub}</span>}
            </div>
          ))}

          {TYPES.map((t) => (
            <div key={t} style={{ display: 'contents' }}>
              <div className="t-title bg-rowhead">{t}</div>
              {COLUMNS.map((c) => {
                const v = find(t, c.state, c.focused)
                return (
                  <div key={c.label + (c.sub ?? '')}>
                    {v ? <Button v={v} reveal={reveal} /> : <div className="bg-absent t-meta">—</div>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
