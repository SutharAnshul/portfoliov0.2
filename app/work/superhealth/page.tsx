import Link from 'next/link'
import { Settle } from '@/components/Settle'
import { system } from '@/lib/superhealth'
import { Ramp } from '@/components/system/Ramp'
import { Spacing } from '@/components/system/Spacing'
import { Sheets } from '@/components/system/Sheets'
import { ButtonGallery } from '@/components/system/ButtonGallery'
import { Inventory } from '@/components/system/Inventory'

/**
 * The Superhealth design system, laid out as a board rather than a report.
 *
 * The first version stacked full-width sections, which gave every part of the
 * system the same width and turned the page into a list you scroll. A ramp with
 * three steps and a ramp with nine are not the same object and should not be
 * given the same room — so this is a twelve-column board where each card takes
 * the span its contents actually need.
 *
 * Everything shown is read out of the Figma file: the ramps, the type at its
 * real sizes, the recorded shadows, and the button variants with their gradient
 * angles and the variables bound to their labels.
 */

export const metadata = {
  title: 'Superhealth Design System — Anshul Suthar',
  description:
    'A design system for a healthcare product: 18 colour styles, 30 type styles and 49 component sets, read out of the Figma file.',
}

const pad = (n: number) => String(n).padStart(2, '0')

/** A card on the board. `span` is in twelfths at desktop. */
function Card({
  label,
  note,
  scroll = false,
  children,
}: {
  label: string
  note?: string
  scroll?: boolean
  children: React.ReactNode
}) {
  return (
    <section className="bcard">
      <header className="bcard-head">
        <span className="t-label">{label}</span>
        {note && <span className="t-label bcard-note">{note}</span>}
      </header>
      <div
        className={scroll ? 'bcard-body bcard-scroll' : 'bcard-body'}
        data-lenis-prevent={scroll || undefined}
      >
        {children}
      </div>
    </section>
  )
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="bstat">
      <div className="bstat-n t-num">{value}</div>
      <div className="t-label">{label}</div>
    </div>
  )
}

export default function SuperhealthSystemPage() {
  const { counts, colours, type, effects, components, foreignLibraries } = system

  const buttons = components.find((c) => c.name === 'Buttons')

  // One card per ramp, so a ramp's size on the board reflects its real size.
  const ramps = new Map<string, typeof colours>()
  for (const c of colours) {
    const key = [c.scheme, c.group].filter(Boolean).join(' / ') || 'Ungrouped'
    if (!ramps.has(key)) ramps.set(key, [])
    ramps.get(key)!.push(c)
  }
  const rampList = [...ramps.entries()].sort((a, b) => b[1].length - a[1].length)

  const typeRoles = new Map<string, typeof type>()
  for (const t of type) {
    const key = t.role ?? 'Other'
    if (!typeRoles.has(key)) typeRoles.set(key, [])
    typeRoles.get(key)!.push(t)
  }
  for (const list of typeRoles.values()) list.sort((a, b) => (b.size ?? 0) - (a.size ?? 0))
  const roleList = [...typeRoles.entries()].sort((a, b) => b[1].length - a[1].length)

  const families = [...new Set(type.map((t) => t.family).filter(Boolean))] as string[]

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="record-bar t-meta">
        <span className="record-no">Design system</span>
        <div className="record-nav">
          <Link href="/work" data-sfx="tick" className="record-btn t-meta">
            ← Work
          </Link>
        </div>
      </div>

      <div style={{ padding: 'var(--s7) var(--s6) var(--s8)' }}>
        {/* ── Masthead ─────────────────────────────────────────────────── */}
        <Settle boot mass="medium">
          <div className="sys-head">
            <div>
              <h1 className="case-title">Superhealth</h1>
              <p className="case-deck" style={{ marginTop: 'var(--s3)', maxWidth: '38ch' }}>
                A design system for a healthcare product — read out of the Figma file it lives in.
              </p>
            </div>
            <div className="sys-facts">
              {[
                ['Client', 'SuperHealth'],
                ['Year', '2026'],
                ['Role', 'Product Designer'],
                ['Source', `Figma · ${counts.nodes.toLocaleString()} nodes`],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="t-label">{k}</div>
                  <div className="t-body" style={{ marginTop: 2 }}>
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Settle>

        {/* ── The board ────────────────────────────────────────────────── */}
        <div className="bento">
          {/* Buttons lead, and take the width the matrix needs. */}
          <Settle boot mass="light" delay={80} className="bcell" style={{ ['--span' as string]: 8 }}>
            <Card label="Buttons" note={`${buttons?.variants ?? 0} variants`}>
              <p className="t-meta bcard-lede">
                Rendered from the file&apos;s geometry — gradient and angle, radius, auto-layout
                padding, label type. Reveal what drives them for the measurements and the variable
                behind each label colour.
              </p>
              <ButtonGallery />
            </Card>
          </Settle>

          <Settle boot mass="light" delay={140} className="bcell" style={{ ['--span' as string]: 4 }}>
            <Card label="At a glance">
              <div className="bstats">
                <Stat value={counts.componentFamilies} label="Component sets" />
                <Stat value={counts.componentVariants.toLocaleString()} label="Variants" />
                <Stat value={counts.colours} label="Colour" />
                <Stat value={counts.type} label="Type" />
                <Stat value={counts.variables} label="Variables" />
                <Stat value={counts.effects} label="Elevation" />
              </div>
              <p className="t-meta bcard-lede" style={{ marginTop: 'var(--s4)' }}>
                {counts.componentFamilies} sets carrying{' '}
                {counts.componentVariants.toLocaleString()} variants, and{' '}
                {counts.instances.toLocaleString()} instances placed from them. Most of that weight
                is the icon set — what a system looks like once it stops being a style guide and
                starts being inventory.
              </p>
            </Card>
          </Settle>

          {/* Each ramp gets the room its own length asks for. */}
          {rampList.map(([name, ramp], i) => {
            const span = ramp.length >= 5 ? 6 : ramp.length >= 3 ? 4 : 3
            return (
              <Settle
                key={name}
                mass="light"
                delay={40 + i * 20}
                className="bcell"
                style={{ ['--span' as string]: span }}
              >
                <Card label={name} note={pad(ramp.length)}>
                  <Ramp colours={ramp} />
                </Card>
              </Settle>
            )
          })}

          {/* Type: one card per role. Tall ones scroll inside the card rather
              than stretching the board out of shape. */}
          {roleList.map(([role, styles], i) => {
            const many = styles.length > 8
            return (
              <Settle
                key={role}
                mass="light"
                delay={40 + i * 20}
                className="bcell"
                style={{ ['--span' as string]: many ? 6 : 4 }}
              >
                <Card
                  label={role}
                  note={`${pad(styles.length)} · ${styles[0]?.family ?? ''}`}
                  scroll={many}
                >
                  <div className="specs">
                    {styles.map((t) => (
                      <div key={t.name} className="spec-row">
                        <div
                          className="spec-line"
                          style={{
                            fontFamily: /serif/i.test(t.family ?? '')
                              ? 'var(--font-display), Georgia, serif'
                              : /mono/i.test(t.family ?? '')
                                ? 'var(--font-ui), monospace'
                                : 'system-ui, sans-serif',
                            fontSize: `${Math.min(t.size ?? 16, 38)}px`,
                            fontWeight: /bold|heavy|semi/i.test(t.style ?? '') ? 700 : 400,
                            fontStyle: /italic/i.test(t.style ?? '') ? 'italic' : 'normal',
                            lineHeight:
                              t.lineHeight?.units === 'PERCENT' ? t.lineHeight.value / 100 : 1.15,
                          }}
                        >
                          {t.token}
                        </div>
                        <div className="spec-num t-meta">
                          {t.size}
                          <span className="spec-unit">px</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </Settle>
            )
          })}

          <Settle mass="light" delay={50} className="bcell" style={{ ['--span' as string]: 4 }}>
            <Card label="Spacing" note="09 steps">
              <Spacing />
            </Card>
          </Settle>

          <Settle mass="light" delay={60} className="bcell" style={{ ['--span' as string]: 4 }}>
            <Card label="Elevation" note={pad(effects.length)}>
              <div className="elevs">
                {effects.map((e) => {
                  const css = e.layers
                    .map(
                      (l) =>
                        `${l.type === 'INNER_SHADOW' ? 'inset ' : ''}${l.x}px ${l.y}px ${l.radius}px ${l.spread}px ${l.color ?? '#000'}`,
                    )
                    .join(', ')
                  return (
                    <div key={e.name} className="elev-cell">
                      <div className="elev-swatch" style={{ boxShadow: css }} />
                      <div className="t-meta elev-name">{e.name}</div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </Settle>

          <Settle mass="light" delay={60} className="bcell" style={{ ['--span' as string]: 12 }}>
            <Card label="Source sheets" note="11 pages">
              <p className="t-meta bcard-lede">
                The system&apos;s own documentation, as drawn. Everything else here is rebuilt from
                the file&apos;s geometry — these are the pages themselves, and for the fields whose
                visuals sit too deep to reconstruct they are the only true record.
              </p>
              <Sheets />
            </Card>
          </Settle>

          <Settle mass="light" delay={60} className="bcell" style={{ ['--span' as string]: 8 }}>
            <Card label="Component inventory" note={`${pad(counts.componentFamilies)} sets`} scroll>
              <Inventory components={components} />
            </Card>
          </Settle>
        </div>

        <Settle mass="light">
          <div style={{ marginTop: 'var(--s7)' }}>
            <hr className="rule" />
            <div className="flex items-baseline justify-between" style={{ paddingTop: 'var(--s3)' }}>
              <span className="t-label">End of document</span>
              <Link href="/work" data-sfx="tick" className="t-label">
                Back to work →
              </Link>
            </div>
            <p className="t-meta" style={{ marginTop: 'var(--s4)', maxWidth: '72ch', lineHeight: 1.7 }}>
              Read from the Figma export on 29 June 2026. Type is set in {families.join(', ')} — the
              families are not licensed here, so specimens fall back by classification and the
              metrics, not the letterforms, are exact.
              {foreignLibraries.length > 0 && (
                <>
                  {' '}
                  Styles belonging to {foreignLibraries.join(' and ')} are referenced by the file but
                  are other projects&apos; libraries, and are excluded.
                </>
              )}
            </p>
          </div>
        </Settle>
      </div>
    </div>
  )
}
