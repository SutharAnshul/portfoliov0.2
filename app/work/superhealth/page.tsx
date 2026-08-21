import Link from 'next/link'
import { Settle } from '@/components/Settle'
import { system } from '@/lib/superhealth'
import { Swatches } from '@/components/system/Swatches'
import { ButtonGallery } from '@/components/system/ButtonGallery'
import { Inventory } from '@/components/system/Inventory'

/**
 * The Superhealth design system, as a document you can operate.
 *
 * Everything on this page is read out of the Figma file — the ramps, the type
 * scale at its real sizes, the shadow values, the token sets, and the variant
 * matrix behind every component set. Where the file records design intent, such
 * as the contrast ratios written into the colour descriptions, that is shown
 * rather than summarised away.
 *
 * Set in this site's own language rather than the product's: mono for data,
 * italic serif for headings, corner marks for specimens. The one place the
 * product's own colour appears is inside the specimens, where it is the
 * subject.
 */

export const metadata = {
  title: 'Superhealth Design System — Anshul Suthar',
  description:
    'A design system for a healthcare product: 18 colour styles, 30 type styles, 58 variables and 49 component sets.',
}

const pad = (n: number) => String(n).padStart(2, '0')

function Section({
  n,
  title,
  note,
  children,
}: {
  n: string
  title: string
  note?: string
  children: React.ReactNode
}) {
  return (
    <section style={{ marginTop: 'var(--s8)' }}>
      <div className="flex items-baseline justify-between" style={{ paddingBottom: 'var(--s3)' }}>
        <span className="t-label">
          {n} · {title}
        </span>
        {note && <span className="t-label">{note}</span>}
      </div>
      <hr className="rule" />
      <div style={{ marginTop: 'var(--s5)' }}>{children}</div>
    </section>
  )
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="stat">
      <div className="stat-n t-num">{value}</div>
      <div className="t-label">{label}</div>
    </div>
  )
}

export default function SuperhealthSystemPage() {
  const { counts, colours, type, effects, components, foreignLibraries } = system

  const buttons = components.find((c) => c.name === 'Buttons')

  // Type styles read best grouped by the role encoded in their name.
  const typeRoles = new Map<string, typeof type>()
  for (const t of type) {
    const key = t.role ?? 'Other'
    if (!typeRoles.has(key)) typeRoles.set(key, [])
    typeRoles.get(key)!.push(t)
  }
  for (const list of typeRoles.values()) list.sort((a, b) => (b.size ?? 0) - (a.size ?? 0))

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
        <Settle boot mass="medium">
          <h1 className="case-title">Superhealth</h1>
        </Settle>

        <Settle boot mass="light" delay={110}>
          <p className="case-deck" style={{ marginTop: 'var(--s4)', maxWidth: '48ch' }}>
            A design system for a healthcare product — read here directly out of the Figma file it
            lives in.
          </p>
        </Settle>

        <Settle boot mass="light" delay={170}>
          <div style={{ marginTop: 'var(--s4)' }}>
            <span className="pill">Design system · 2026</span>
          </div>
        </Settle>

        <Settle boot mass="light" delay={220}>
          <div className="spec" style={{ marginTop: 'var(--s6)' }}>
            <div>
              <div className="t-label">Client</div>
              <div className="t-body spec-value">SuperHealth</div>
            </div>
            <div>
              <div className="t-label">Year</div>
              <div className="t-body spec-value">2026</div>
            </div>
            <div>
              <div className="t-label">Role</div>
              <div className="t-body spec-value">Product Designer</div>
            </div>
            <div>
              <div className="t-label">Surfaces</div>
              <div className="t-body spec-value">Web, Mobile</div>
            </div>
            <div>
              <div className="t-label">Source</div>
              <div className="t-body spec-value">
                Figma
                <div className="t-meta" style={{ marginTop: 2 }}>
                  {counts.nodes.toLocaleString()} nodes
                </div>
              </div>
            </div>
          </div>
        </Settle>

        {/* ── 01 Buttons ──────────────────────────────────────────────── */}
        <Settle mass="light" delay={40}>
          <Section n="01" title="Buttons, as drawn" note={`${buttons?.variants ?? 0} variants`}>
            <p className="case-prose" style={{ marginBottom: 'var(--s5)' }}>
              Every variant below is rendered from the file&apos;s own geometry — the gradient and
              its angle, the radius, the auto-layout padding and the label&apos;s type. Reveal what
              drives them to see the measurements and the variable bound to each label colour.
            </p>
            <ButtonGallery />
          </Section>
        </Settle>

        {/* ── 02 At a glance ──────────────────────────────────────────── */}
        <Settle mass="light" delay={40}>
          <Section n="02" title="At a glance">
            <div className="stats">
              <Stat value={counts.colours} label="Colour styles" />
              <Stat value={counts.type} label="Type styles" />
              <Stat value={counts.effects} label="Elevation" />
              <Stat value={counts.variables} label="Variables" />
              <Stat value={counts.componentFamilies} label="Component sets" />
              <Stat value={counts.componentVariants.toLocaleString()} label="Variants" />
            </div>
            <p className="case-prose" style={{ marginTop: 'var(--s5)' }}>
              The ratio is the interesting part: {counts.componentFamilies} sets carrying{' '}
              {counts.componentVariants.toLocaleString()} variants, and {counts.instances.toLocaleString()}{' '}
              instances placed from them. Most of that weight sits in one component — the icon set —
              which is what a system looks like once it stops being a style guide and starts being
              inventory.
            </p>
          </Section>
        </Settle>

        {/* ── 03 Colour ───────────────────────────────────────────────── */}
        <Settle mass="light" delay={40}>
          <Section n="03" title="Colour" note={`${pad(colours.length)} styles`}>
            <Swatches colours={colours} />
          </Section>
        </Settle>

        {/* ── 04 Type ─────────────────────────────────────────────────── */}
        <Settle mass="light" delay={40}>
          <Section n="04" title="Type" note={families.join(' · ')}>
            <div className="stack" style={{ ['--gap' as string]: 'var(--s6)' } as React.CSSProperties}>
              {[...typeRoles.entries()].map(([role, styles]) => (
                <div key={role}>
                  <div
                    className="flex items-baseline justify-between"
                    style={{ paddingBottom: 'var(--s3)' }}
                  >
                    <span className="t-label">{role}</span>
                    <span className="t-label">{pad(styles.length)}</span>
                  </div>
                  <div className="specimens">
                    {styles.map((t) => (
                      <div key={t.name} className="specimen">
                        {/* Rendered at the real size the token specifies. The
                            families are not licensed here, so the fallback is
                            chosen to match the token's own classification. */}
                        <div
                          className="specimen-line"
                          style={{
                            fontFamily: /serif/i.test(t.family ?? '')
                              ? 'var(--font-display), Georgia, serif'
                              : /mono/i.test(t.family ?? '')
                                ? 'var(--font-ui), monospace'
                                : 'system-ui, sans-serif',
                            fontSize: `${Math.min(t.size ?? 16, 56)}px`,
                            fontWeight: /bold|heavy|semi/i.test(t.style ?? '') ? 700 : 400,
                            fontStyle: /italic/i.test(t.style ?? '') ? 'italic' : 'normal',
                            lineHeight:
                              t.lineHeight?.units === 'PERCENT'
                                ? t.lineHeight.value / 100
                                : t.lineHeight?.value
                                  ? `${t.lineHeight.value}px`
                                  : 1.2,
                            letterSpacing:
                              t.letterSpacing?.units === 'PERCENT'
                                ? `${t.letterSpacing.value / 100}em`
                                : `${t.letterSpacing?.value ?? 0}px`,
                          }}
                        >
                          {t.token}
                        </div>
                        <div className="specimen-meta t-meta">
                          <span>{t.family}</span>
                          <span>{t.style}</span>
                          <span>{t.size}px</span>
                          {t.lineHeight && (
                            <span>
                              {t.lineHeight.value}
                              {t.lineHeight.units === 'PERCENT' ? '%' : 'px'} leading
                            </span>
                          )}
                          {t.letterSpacing && t.letterSpacing.value !== 0 && (
                            <span>
                              {t.letterSpacing.value}
                              {t.letterSpacing.units === 'PERCENT' ? '%' : 'px'} tracking
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </Settle>

        {/* ── 05 Elevation ────────────────────────────────────────────── */}
        <Settle mass="light" delay={40}>
          <Section n="05" title="Elevation" note={`${pad(effects.length)} styles`}>
            <div className="elevations">
              {effects.map((e) => {
                const css = e.layers
                  .map(
                    (l) =>
                      `${l.type === 'INNER_SHADOW' ? 'inset ' : ''}${l.x}px ${l.y}px ${l.radius}px ${l.spread}px ${l.color ?? '#000'}`,
                  )
                  .join(', ')
                return (
                  <div key={e.name} className="elev">
                    <div className="elev-tile" style={{ boxShadow: css }} />
                    <div className="t-title" style={{ marginTop: 'var(--s3)' }}>
                      {e.name}
                    </div>
                    <div className="t-meta" style={{ marginTop: 2, wordBreak: 'break-word' }}>
                      {css}
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>
        </Settle>

        {/* ── 06 Inventory ────────────────────────────────────────────── */}
        <Settle mass="light" delay={40}>
          <Section n="06" title="Component inventory">
            <Inventory components={components} />
          </Section>
        </Settle>

        <Settle mass="light">
          <div style={{ marginTop: 'var(--s8)' }}>
            <hr className="rule" />
            <div className="flex items-baseline justify-between" style={{ paddingTop: 'var(--s3)' }}>
              <span className="t-label">End of document</span>
              <Link href="/work" data-sfx="tick" className="t-label">
                Back to work →
              </Link>
            </div>
            {foreignLibraries.length > 0 && (
              <p className="t-meta" style={{ marginTop: 'var(--s4)', maxWidth: '70ch', lineHeight: 1.7 }}>
                Read from the Figma export on 29 June 2026. Styles belonging to{' '}
                {foreignLibraries.join(' and ')} were referenced by the file but are other projects&apos;
                libraries, and are excluded.
              </p>
            )}
          </div>
        </Settle>
      </div>
    </div>
  )
}
