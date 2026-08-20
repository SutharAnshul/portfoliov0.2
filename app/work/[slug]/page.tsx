import { getCaseStudyBySlug, caseStudies } from '@/lib/case-studies'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Settle } from '@/components/Settle'
import { CornerMarks } from '@/components/CornerMarks'

/**
 * A case study as a catalogue record.
 *
 * The page is two things stacked, and deliberately not interleaved. First the
 * record: a numbered bar that stays put while you read, the name, one line
 * saying what it was, the facts ruled off in a spec block, and a short piece of
 * prose. Then the screens, one after another with nothing written over them.
 *
 * Every field reads from the study's own record, and anything absent is simply
 * not drawn — so a study with no team or no client loses that column rather
 * than showing an empty one.
 */

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }))
}

const pad = (n: number) => String(n).padStart(2, '0')

/** One column of the spec block. Values may be a list. */
function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="t-label">{label}</div>
      <div className="t-body spec-value">{children}</div>
    </div>
  )
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params
  const caseStudy = getCaseStudyBySlug(slug)
  if (!caseStudy) notFound()

  const index = caseStudies.findIndex((cs) => cs.slug === slug)
  const prev = index > 0 ? caseStudies[index - 1] : null
  const next = index < caseStudies.length - 1 ? caseStudies[index + 1] : null

  // The screens, in the order the study defines them. The cover is not
  // prepended: it is already the first of them.
  const screens = caseStudy.sections
    .filter((s) => s.type === 'image' && s.image)
    .map((s) => ({ src: s.image!, alt: s.imageAlt ?? caseStudy.title }))

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* The bar stays with you the whole way down the record. */}
      <div className="record-bar t-meta">
        <span className="record-no">
          № {pad(index + 1)} / {pad(caseStudies.length)}
        </span>

        <div className="record-nav">
          <Link
            href={prev ? `/work/${prev.slug}` : '#'}
            aria-disabled={!prev}
            tabIndex={prev ? undefined : -1}
            data-sfx="tick"
            className="record-btn t-meta"
          >
            ← Prev
          </Link>
          <Link
            href={next ? `/work/${next.slug}` : '#'}
            aria-disabled={!next}
            tabIndex={next ? undefined : -1}
            data-sfx="tick"
            className="record-btn t-meta"
          >
            Next →
          </Link>
          <Link href="/work" data-sfx="tick" className="record-close" aria-label="Close, back to work">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </Link>
        </div>
      </div>

      <div style={{ padding: 'var(--s7) var(--s6) var(--s8)' }}>
        {/* ── The record ────────────────────────────────────────────── */}
        <Settle boot mass="medium">
          <h1 className="case-title">{caseStudy.title}</h1>
        </Settle>

        <Settle boot mass="light" delay={110}>
          <p className="case-deck" style={{ marginTop: 'var(--s4)', maxWidth: '46ch' }}>
            {caseStudy.deck ?? caseStudy.description}
          </p>
        </Settle>

        <Settle boot mass="light" delay={170}>
          <div style={{ marginTop: 'var(--s4)' }}>
            <span className="pill">{caseStudy.status ?? caseStudy.category}</span>
          </div>
        </Settle>

        <Settle boot mass="light" delay={220}>
          <div className="spec" style={{ marginTop: 'var(--s6)' }}>
            <Spec label="Client">
              {caseStudy.client ?? '—'}
              {caseStudy.clientNote && (
                <div className="t-meta" style={{ marginTop: 2 }}>
                  {caseStudy.clientNote}
                </div>
              )}
            </Spec>
            <Spec label="Year">{caseStudy.year}</Spec>
            <Spec label="Role">
              {(caseStudy.role ?? [caseStudy.category]).map((r) => (
                <div key={r}>{r}</div>
              ))}
            </Spec>
            <Spec label="Team">
              {(caseStudy.team ?? []).map((m) => (
                <div key={m}>{m}</div>
              ))}
              {!caseStudy.team?.length && '—'}
            </Spec>
            <Spec label="Surfaces">{(caseStudy.surfaces ?? []).join(', ') || '—'}</Spec>
          </div>
        </Settle>

        <Settle mass="light" delay={60}>
          <div className="case-prose" style={{ marginTop: 'var(--s7)' }}>
            {(caseStudy.opening ?? [caseStudy.description]).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </Settle>

        {/* ── The screens ───────────────────────────────────────────── */}
        <div style={{ marginTop: 'var(--s8)' }}>
          <div
            className="flex items-baseline justify-between"
            style={{ paddingBottom: 'var(--s3)' }}
          >
            <span className="t-label">Screens</span>
            <span className="t-label">{pad(screens.length)} frames</span>
          </div>
          <hr className="rule" />

          {/* --s8, not --s5. The corner marks stand 6px proud of each plate,
              so a 24px gap left only 12px of real air between neighbouring
              frames and they read as one strip rather than as separate sheets. */}
          {/* .stack spaces its children with margins driven by --gap, not the
              CSS gap property, so setting gap here would do nothing.
              --s6 matches the page's own horizontal padding exactly, so the
              air above and below a frame is the same as the air beside it and
              the sequence sits on one square rhythm. */}
          <div
            className="stack"
            style={{ marginTop: 'var(--s6)', ['--gap' as string]: 'var(--s6)' } as React.CSSProperties}
          >
            {screens.map((shot, i) => (
              <Settle key={shot.src} mass="medium" delay={40}>
                <figure className="shot relative">
                  <CornerMarks />
                  <div className="plate">
                    <img src={shot.src} alt={shot.alt} loading="lazy" />
                    <span className="plate-no t-meta">
                      {pad(index + 1)}-{pad(i + 1)}
                    </span>
                  </div>
                </figure>
              </Settle>
            ))}
          </div>
        </div>

        {/* Where the record ends, and what follows it. */}
        <Settle mass="light">
          <div style={{ marginTop: 'var(--s8)' }}>
            <hr className="rule" />
            <div className="flex items-baseline justify-between" style={{ paddingTop: 'var(--s3)' }}>
              <span className="t-label">End of record</span>
              {next ? (
                <Link href={`/work/${next.slug}`} data-sfx="tick" className="t-label">
                  Next — {next.title} →
                </Link>
              ) : (
                <Link href="/work" data-sfx="tick" className="t-label">
                  Back to work →
                </Link>
              )}
            </div>
          </div>
        </Settle>
      </div>
    </div>
  )
}
