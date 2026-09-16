import { getCaseStudyBySlug, caseStudies } from '@/lib/case-studies'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Settle } from '@/components/Settle'
import { CornerMarks } from '@/components/CornerMarks'
import { Presenter } from '@/components/Presenter'
import { PixelIcon } from '@/components/PixelIcon'
import { LivePrototype } from '@/components/LivePrototype'
import type { CaseStudySection } from '@/lib/types'

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

/** A still, or a running prototype. From the reader's side, the next screen. */
type Frame =
  | { key: string; src: string; alt: string }
  | { key: string; embed: string; alt: string; w: number; h: number }

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

  /**
   * The screens, in the order the study defines them. The cover is not
   * prepended: it is already the first of them.
   *
   * A frame is either a still or a running prototype. Both sit in the same
   * plate with the same corner marks and the same frame number, because from
   * the reader's side they are the same thing — the next screen.
   */
  const framesOf = (sections: CaseStudySection[]): Frame[] =>
    sections
      .filter((s) => (s.type === 'image' && s.image) || (s.type === 'embed' && s.embed))
      .map((s) =>
        s.type === 'embed'
          ? {
              key: s.embed!,
              embed: s.embed!,
              alt: s.imageAlt ?? `${caseStudy.title}, live prototype`,
              w: s.embedWidth ?? 390,
              h: s.embedHeight ?? 844,
            }
          : { key: s.image!, src: s.image!, alt: s.imageAlt ?? caseStudy.title },
      )

  const screens = framesOf(caseStudy.sections)

  /** The second sequence, under its own heading. Most records have none. */
  const more = framesOf(caseStudy.more ?? [])

  /**
   * Only the stills can be presented; a running prototype is not a slide. Both
   * sequences feed one deck, so pressing any frame on the page opens the same
   * presentation and the extras are simply the end of it.
   */
  const stills = [...screens, ...more].filter(
    (s): s is { key: string; src: string; alt: string } => 'src' in s,
  )
  const slides = stills.map((s) => ({ src: s.src, alt: s.alt }))

  /**
   * Which slide a given frame is. Not the same as its position in the record
   * once a live prototype sits among the stills, so it is counted rather than
   * assumed.
   */
  const slideOf = new Map(stills.map((s, n) => [s.key, n]))

  const hasLive = screens.some((s) => 'embed' in s)
  const allLive = screens.length > 0 && screens.every((s) => 'embed' in s)

  /**
   * One frame in its plate. `at` is its number in the record, counted across
   * both sequences so the numbering runs on rather than starting again under
   * the second heading.
   */
  function Plate({ shot, at, marks = true }: { shot: Frame; at: number; marks?: boolean }) {
    return (
      <figure
        className="shot relative"
        data-slide={'src' in shot ? slideOf.get(shot.key) : undefined}
      >
        {marks && <CornerMarks />}
        <div className="plate">
          {'embed' in shot ? (
            <LivePrototype src={shot.embed} title={shot.alt} w={shot.w} h={shot.h} />
          ) : (
            <img src={shot.src} alt={shot.alt} loading="lazy" decoding="async" />
          )}
          <span className="plate-no t-meta">
            {pad(index + 1)}-{pad(at)}
          </span>
        </div>
      </figure>
    )
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* The record's navigation. A row at the head of the page on a
          desktop; on a phone the same markup is lifted out of the flow and
          floated at the foot — see globals.css. Document order suits both:
          fixed positioning does not care where it sits, and at the head is
          where a desktop reader expects to find the way out. */}
      <nav className="dock t-meta" aria-label="Record">
        {/* The counter with an arrow either side of it: the three read as one
            control — where you are, and the two ways out of it — rather than
            as a label and a pair of buttons that happen to share a row. */}
        <Link
          href={prev ? `/work/${prev.slug}` : '#'}
          aria-disabled={!prev}
          tabIndex={prev ? undefined : -1}
          data-sfx="tick"
          className="dock-btn"
          aria-label="Previous case study"
        >
          <PixelIcon name="prev" size={26} />
        </Link>

        <span className="dock-no">
          {pad(index + 1)} / {pad(caseStudies.length)}
        </span>

        <Link
          href={next ? `/work/${next.slug}` : '#'}
          aria-disabled={!next}
          tabIndex={next ? undefined : -1}
          data-sfx="tick"
          className="dock-btn"
          aria-label="Next case study"
        >
          <PixelIcon name="next" size={26} />
        </Link>
      </nav>

      <div className="case-page" style={{ padding: 'var(--s7) var(--s6) var(--s8)' }}>
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

        {/* ── The body ──────────────────────────────────────────────
            Prose, then the frames, for every record without exception. */}
        <Settle mass="light" delay={60}>
          <div className="case-prose" style={{ marginTop: 'var(--s7)' }}>
            {(caseStudy.opening ?? [caseStudy.description]).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </Settle>

        {/* ── The screens ───────────────────────────────────────── */}
        <div style={{ marginTop: 'var(--s8)' }}>
          {/* A record made only of a running prototype has no "screens" to
              count, so it says what it actually is. */}
          <Presenter
            title={caseStudy.title}
            label={allLive ? 'Prototype' : hasLive ? 'Prototype & system' : 'Screens'}
            count={allLive ? 'Interactive' : `${pad(screens.length)} frames`}
            slides={slides}
          >

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
              <Plate key={shot.key} shot={shot} at={i + 1} />
            ))}
          </div>

          {/* ── And the rest of it ─────────────────────────────────
              A heading, ruled off the way the screens above are, and then the
              frames run straight on: the numbering carries over and pressing
              one opens the same deck, because these are the same project seen
              further in rather than an appendix to it. */}
          {more.length > 0 && (
            <>
              <div
                className="flex items-baseline justify-between"
                style={{ marginTop: 'var(--s8)', paddingBottom: 'var(--s3)' }}
              >
                <span className="t-label">More from the project</span>
                <span className="t-label">{pad(more.length)} frames</span>
              </div>
              <hr className="rule" />

              {/* Two columns, packed by height — see .mason. The record's own
                  screens stay one to a row: they are a sequence and are read in
                  order, where these are a board to look through. */}
              <div className="mason">
                {/* No corner marks on the board. They bracket one thing being
                    looked at; against a wall of frames two abreast, seven sets
                    of them are just ticks in the gaps. */}
                {more.map((shot, i) => (
                  <Plate key={shot.key} shot={shot} at={screens.length + i + 1} marks={false} />
                ))}
              </div>
            </>
          )}
          </Presenter>


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
