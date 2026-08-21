'use client'

import { useState } from 'react'
import type { ComponentSet, Swatch } from '@/lib/superhealth'

/**
 * The button component set, made operable.
 *
 * A design system document that only lists "Type: Hero, Primary, Secondary"
 * makes the reader assemble the matrix in their head. This drives a real
 * button from the same four properties the Figma set is built on, so the
 * combination can be selected and seen.
 *
 * Colours come from the file's own ramps, matched by token name. Where a ramp
 * has no entry for a state the button falls back rather than inventing one —
 * an invented value would be the one thing in this document that is not true.
 */
export function ButtonLab({ set, colours }: { set: ComponentSet; colours: Swatch[] }) {
  // Alphabetical order would open on Hero/Active/False, which is a corner of
  // the matrix rather than the button anyone pictures. Prefer the resting one.
  const PREFERRED = ['Default', 'Primary', 'Large', 'False']
  const [choice, setChoice] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      set.props.map((p) => [p.prop, PREFERRED.find((v) => p.values.includes(v)) ?? p.values[0]]),
    ),
  )

  const find = (needle: RegExp) => colours.find((c) => needle.test(c.name))?.hex ?? null

  const brand = find(/orange.*(500|600)/i) ?? find(/orange/i) ?? '#E8590C'
  const ink = find(/grey.*900|gray-900/i) ?? '#111111'
  const paper = find(/grey.*50|gray-50/i) ?? '#FFFFFF'
  const muted = find(/grey.*300|gray-300/i) ?? '#BBBBBB'
  const focusRing = '#AFD6FF' // the file's "Focused glow/Primary" effect colour

  const type = choice.Type ?? 'Primary'
  const state = choice.State ?? 'Default'
  const size = choice.Size ?? 'Large'
  const focused = choice.Focused === 'True'

  const disabled = state === 'Disabled'
  const secondary = type === 'Secondary'

  // Hover and Active are rendered as a darkening of the resting fill, which is
  // what the set does; the exact deltas are not recorded as tokens.
  const shade = state === 'Hover' ? 0.88 : state === 'Active' ? 0.78 : 1
  const darken = (hex: string, k: number) => {
    const n = parseInt(hex.slice(1), 16)
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * k))
    return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('')
  }

  const fill = secondary ? 'transparent' : darken(type === 'Hero' ? ink : brand, shade)
  const label = secondary ? (disabled ? muted : brand) : paper
  const border = secondary ? (disabled ? muted : brand) : 'transparent'

  return (
    <div className="lab">
      <div className="lab-stage">
        <button
          type="button"
          className="lab-btn"
          aria-disabled={disabled}
          style={{
            background: disabled && !secondary ? muted : fill,
            color: label,
            border: `1px solid ${disabled && !secondary ? muted : border}`,
            padding: size === 'Small' ? '8px 14px' : '13px 22px',
            fontSize: size === 'Small' ? 13 : 15,
            opacity: disabled ? 0.75 : 1,
            boxShadow: focused ? `0 0 0 3px ${focusRing}` : 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {type === 'Hero' ? 'Book an appointment' : secondary ? 'Learn more' : 'Continue'}
        </button>
      </div>

      <div className="lab-controls">
        {set.props.map((p) => (
          <div key={p.prop}>
            <div className="t-label" style={{ marginBottom: 'var(--s2)' }}>
              {p.prop}
            </div>
            <div className="lab-row">
              {p.values.map((v) => (
                <button
                  key={v}
                  onClick={() => setChoice((c) => ({ ...c, [p.prop]: v }))}
                  data-sfx="tick"
                  data-on={choice[p.prop] === v}
                  className="lab-opt t-meta"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="t-meta" style={{ paddingTop: 'var(--s2)' }}>
          {set.variants} variants in the set ·{' '}
          {set.props.map((p) => p.values.length).reduce((a, b) => a * b, 1)} from this matrix
        </div>
      </div>
    </div>
  )
}
