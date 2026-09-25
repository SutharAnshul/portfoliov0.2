import { getCaseStudyBySlug, caseStudies } from '@/lib/case-studies'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Settle } from '@/components/Settle'
import { CornerMarks } from '@/components/CornerMarks'
import { PixelIcon } from '@/components/PixelIcon'
import { LivePrototype } from '@/components/LivePrototype'
import { CaseIndex } from '@/components/CaseIndex'
import { Lightbox } from '@/components/Lightbox'
import { frameSize } from '@/lib/frame-size'
import type { CaseStudySection } from '@/lib/types'

/**
 * A case study as a catalogue record.
 *
 * Two columns for the whole of it: the frames and everything written about
 * them in the right two thirds, and the left third given to the index that
 * tracks where you are — see CaseIndex. Nothing runs edge to edge and nothing
 * is centred; the page has a left margin the width of a column, and the work
 * sits against the right of it.
 *
 * There is no presentation mode any more. Every frame is already as large as
 * the page can make it, and a record that is read by scrolling does not need a
 * second way to be read by scrolling.
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

/** A still, or a running prototype. From the reader's side, the next screen. */
type Frame =
  | { key: string; src: string; alt: string }
  | { key: string; embed: string; alt: string; w: number; h: number }

function framesOf(sections: CaseStudySection[], title: string): Frame[] {
  return sections
    .filter((s) => (s.type === 'image' && s.image) || (s.type === 'embed' && s.embed))
    .map((s) =>
      s.type === 'embed'
        ? {
            key: s.embed!,
            embed: s.embed!,
            alt: s.imageAlt ?? `${title}, live prototype`,
            w: s.embedWidth ?? 390,
            h: s.embedHeight ?? 844,
          }
        : { key: s.image!, src: s.image!, alt: s.imageAlt ?? title },
    )
}

/**
 * What a frame is called in the index.
 *
 * Taken from the description the frame already carries rather than written a
 * second time: these read "Project — chapter — the detail", so the chapter is
 * the middle of them, and a record whose frames are described properly gets an
 * index for nothing.
 */
function labelOf(alt: string, title: string) {
  const parts = alt
    .split('—')
    .map((p) => p.trim())
    .filter(Boolean)
  const withoutName = parts.length > 1 && parts[0].startsWith(title) ? parts.slice(1) : parts
  const label = withoutName[0] ?? alt
  return label.length > 34 ? label.slice(0, 33).trimEnd() + '…' : label
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params
  const caseStudy = getCaseStudyBySlug(slug)
  if (!caseStudy) notFound()

  const index = caseStudies.findIndex((cs) => cs.slug === slug)
  const prev = index > 0 ? caseStudies[index - 1] : null
  const next = index < caseStudies.length - 1 ? caseStudies[index + 1] : null

  const screens = framesOf(caseStudy.sections, caseStudy.title)
  /** The second sequence, under its own heading. Most records have none. */
  const more = framesOf(caseStudy.more ?? [], caseStudy.title)
  /* One line per frame in the sequence, and one for the board at the foot:
     the board is two columns packed by height, so seven lines claiming an
     order its frames do not pass the head in would be worse than one. */
  const labels = [
    ...screens.map((f) => labelOf(f.alt, caseStudy.title)),
    ...(more.length ? ['More from the project'] : []),
  ]

  /**
   * One frame in its plate. `at` is its number across both sequences; `mark`
   * is the line it answers to in the index, which only the sequence has.
   *
   * The picture carries its own pixel size, so its box is the right height
   * before it arrives. Without that the page reflows as each one loads, and
   * anything measuring frame positions against the window — the index — is
   * reading a layout that has not settled.
   */
  const Plate = ({
    shot,
    at,
    mark,
    marks = true,
  }: {
    shot: Frame
    at: number
    mark?: number
    marks?: boolean
  }) => {
    const size = 'src' in shot ? frameSize(shot.src) : null
    return (
    <figure className="shot relative" data-frame={mark}>
      {marks && <CornerMarks />}
      <div className="frame-plate">
        {'embed' in shot ? (
          <LivePrototype src={shot.embed} title={shot.alt} w={shot.w} h={shot.h} />
        ) : (
          <img
            src={shot.src}
            alt={shot.alt}
            width={size?.w}
            height={size?.h}
            loading="lazy"
            decoding="async"
          />
        )}
        <span className="plate-no t-meta">
          {pad(index + 1)}-{pad(at)}
        </span>
      </div>
    </figure>
    )
  }

  return (
    <article className="case">
      <Lightbox within=".case-frames" />
      <CaseIndex labels={labels} />

      <header className="case-head">
        <nav className="case-nav t-meta" aria-label="Record">
          <Link
            href={prev ? `/work/${prev.slug}` : '#'}
            aria-disabled={!prev}
            tabIndex={prev ? undefined : -1}
            className="case-nav-btn"
            aria-label="Previous case study"
          >
            <PixelIcon name="prev" size={26} />
          </Link>
          <span className="case-nav-no">
            {pad(index + 1)} / {pad(caseStudies.length)}
          </span>
          <Link
            href={next ? `/work/${next.slug}` : '#'}
            aria-disabled={!next}
            tabIndex={next ? undefined : -1}
            className="case-nav-btn"
            aria-label="Next case study"
          >
            <PixelIcon name="next" size={26} />
          </Link>
        </nav>

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
      </header>

      <div className="case-frames">
        <div className="stack" style={{ ['--gap' as string]: 'var(--s6)' } as React.CSSProperties}>
          {screens.map((shot, i) => (
            <Plate key={shot.key} shot={shot} at={i + 1} mark={i} />
          ))}
        </div>

        {/* A heading, ruled off the way the record is, and then the frames run
            straight on: the numbering carries over, because these are the same
            project seen further in rather than an appendix to it. */}
        {more.length > 0 && (
          <>
            <div className="work-head" style={{ marginTop: 'var(--s8)' }}>
              <span className="t-label">More from the project</span>
              <span className="t-label">{pad(more.length)} frames</span>
            </div>
            <hr className="rule" />

            {/* Two abreast and packed by height: a board to look through,
                rather than the sequence above, which is read in order. One
                mark for the whole of it — see the index. */}
            <div className="mason" data-frame={screens.length}>
              {more.map((shot, i) => (
                <Plate key={shot.key} shot={shot} at={screens.length + i + 1} marks={false} />
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="case-foot">
        <hr className="rule" />
        <div className="work-head" style={{ paddingTop: 'var(--s3)', paddingBottom: 0 }}>
          <span className="t-label">End of record</span>
          {next ? (
            <Link href={`/work/${next.slug}`} className="t-label">
              Next — {next.title} →
            </Link>
          ) : (
            <Link href="/#work" className="t-label">
              Back to work →
            </Link>
          )}
        </div>
      </footer>
    </article>
  )
}
