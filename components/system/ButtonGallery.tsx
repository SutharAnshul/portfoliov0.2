'use client'

import { useState } from 'react'
import { buttons, type ButtonVariant } from '@/lib/superhealth-buttons'

/**
 * The buttons, as drawn.
 *
 * An earlier version of this section let you pick Type and State and then drew
 * an approximation from a flat colour. It was wrong twice over: it made the
 * reader assemble the matrix themselves, and the approximation was not the
 * component — the real Primary button is a two-stop gradient at 310°, which no
 * amount of picking states would have revealed.
 *
 * So this renders every variant from the file's own geometry, and the reveal
 * shows what is driving each one: the fill, the radius, the padding, and the
 * variable bound to the label colour.
 */

const ORDER = ['Hero', 'Primary', 'Secondary']
const STATES = ['Default', 'Hover', 'Active', 'Disabled']

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
          minHeight: v.h,
        }}
      >
        {l?.text || 'Button'}
      </div>

      {reveal && (
        <div className="bg-spec t-meta">
          <span>
            {v.w}×{v.h}
          </span>
          <span>r{v.radius}</span>
          <span>
            pad {v.padY}/{v.padX}
          </span>
          {v.backgroundKind === 'gradient' && <span className="bg-grad">gradient</span>}
          {v.bindings.map((b) => (
            <span key={b.prop} className="bg-bind">
              {b.prop} → {b.token}
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
  const shown = buttons.filter((b) => b.props.Size === size && b.props.Focused !== 'True')
  const focused = buttons.filter((b) => b.props.Size === size && b.props.Focused === 'True')

  const byType = (t: string) =>
    STATES.map((s) => shown.find((b) => b.props.Type === t && b.props.State === s)).filter(
      Boolean,
    ) as ButtonVariant[]

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

      <div className="bg-grid">
        {/* Column headers: the states, running left to right. */}
        <div className="bg-corner t-label">Type ╲ State</div>
        {STATES.map((s) => (
          <div key={s} className="t-label bg-colhead">
            {s}
          </div>
        ))}

        {ORDER.map((t) => {
          const row = byType(t)
          if (!row.length) return null
          return (
            <div key={t} className="bg-row" style={{ display: 'contents' }}>
              <div className="t-title bg-rowhead">{t}</div>
              {STATES.map((s) => {
                const v = row.find((b) => b.props.State === s)
                return (
                  <div key={s}>
                    {v ? <Button v={v} reveal={reveal} /> : <div className="bg-absent t-meta">—</div>}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {focused.length > 0 && (
        <div style={{ marginTop: 'var(--s6)' }}>
          <div className="t-label" style={{ marginBottom: 'var(--s3)' }}>
            Focused — the same buttons carrying the focus ring
          </div>
          <div className="bg-strip">
            {focused.slice(0, 6).map((v) => (
              <Button key={v.name} v={v} reveal={reveal} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
