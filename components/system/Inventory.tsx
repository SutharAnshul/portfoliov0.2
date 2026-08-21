'use client'

import { useState } from 'react'
import type { ComponentSet } from '@/lib/superhealth'

/**
 * The component inventory.
 *
 * Every set in the file, with the variant matrix it is built from. Sets whose
 * names begin with a dot are the file's own convention for private building
 * blocks — .IconBase, .Label — and they are kept but marked, because a system's
 * internals are part of how it was built and hiding them flatters it.
 *
 * A row opens to show its properties rather than listing 2,799 variants: the
 * useful fact is the shape of the matrix, not every cell in it.
 */
export function Inventory({ components }: { components: ComponentSet[] }) {
  const [open, setOpen] = useState<string | null>(components[0]?.name ?? null)
  const [showInternal, setShowInternal] = useState(false)

  const rows = components.filter((c) => showInternal || !c.internal)
  const hidden = components.length - rows.length

  return (
    <div>
      <div className="flex items-baseline justify-between" style={{ paddingBottom: 'var(--s3)' }}>
        <span className="t-label">
          {String(rows.length).padStart(2, '0')} sets
        </span>
        {hidden > 0 && (
          <button
            onClick={() => setShowInternal((v) => !v)}
            data-sfx="tick"
            className="t-label link-quiet"
            style={{ marginTop: 0 }}
          >
            {showInternal ? 'Hide' : 'Show'} {hidden} internal
          </button>
        )}
      </div>
      <hr className="rule" />

      <div className="inv">
        {rows.map((c) => {
          const isOpen = open === c.name
          const matrix = c.props.map((p) => p.values.length).reduce((a, b) => a * b, 1)
          return (
            <div key={c.name} className="inv-row" data-open={isOpen}>
              <button
                onClick={() => setOpen(isOpen ? null : c.name)}
                data-sfx="tick"
                className="inv-head"
                aria-expanded={isOpen}
              >
                <span className="inv-name t-title">
                  {c.name}
                  {c.internal && <span className="t-label inv-tag">internal</span>}
                </span>
                <span className="t-meta inv-count">
                  {c.props.length > 0 && (
                    <span className="inv-props">{c.props.map((p) => p.values.length).join(' × ')}</span>
                  )}
                  {String(c.variants).padStart(3, ' ')}
                </span>
              </button>

              {isOpen && (
                <div className="inv-body">
                  {c.props.length === 0 ? (
                    <div className="t-meta">
                      No variant properties — a single component
                      {c.variants > 1 ? `, used ${c.variants} times` : ''}.
                    </div>
                  ) : (
                    <>
                      {c.props.map((p) => (
                        <div key={p.prop} className="inv-prop">
                          <div className="t-label">{p.prop}</div>
                          <div className="inv-vals">
                            {p.values.map((v) => (
                              <span key={v} className="inv-val t-meta">
                                {v}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                      {matrix !== c.variants && (
                        <div className="t-meta" style={{ marginTop: 'var(--s3)' }}>
                          ↳ {matrix} combinations from the matrix, {c.variants} drawn — the set is
                          {matrix > c.variants ? ' partial' : ' extended beyond it'}.
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
