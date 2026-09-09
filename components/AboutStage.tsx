'use client'

import { useCallback, useState } from 'react'
import { CrtScreen } from '@/components/CrtScreen'
import { CornerMarks } from '@/components/CornerMarks'

/**
 * The About page: a portrait, a record, and a statement, floating in the dark.
 *
 * This began as a wall of five numbered channels and has been cut back to
 * three pieces with no numbers on them. What went with the numbering was the
 * whole apparatus around it — the CH 0X labels, the TUNING mark, the status
 * line reading ALL CHANNELS LIVE, the bottom bar of tracking readouts. All of
 * it existed to support a conceit the page no longer makes, and a label that
 * names a thing the reader cannot see is just a word taking up space.
 *
 * What is left has to hold itself together on type and distance alone, since
 * nothing here is framed or filled:
 *
 *   the name        the largest thing on the page by a clear margin. With no
 *                   heading above the other two pieces, it is the only thing
 *                   that can act as the title.
 *
 *   the record      set in the monospace, because it is a column of dates
 *                   against a column of names and it is read by scanning down
 *                   rather than across. Tabular figures so the years line up.
 *
 *   the statement   set in the reading face at a size meant for reading, not
 *                   scanning. It is the only running prose on the page and the
 *                   one thing a visitor actually reads sentence by sentence.
 *
 * Pointing at a piece still dims the other two. It is the last of the wall's
 * behaviour worth keeping: with no boxes, it is the only thing that says where
 * one piece ends and the next begins.
 */

type Tuned = string | null

/** rest · tuned (this one has the attention) · dim (another one does). */
type State = 'rest' | 'tuned' | 'dim'

/* Same five entries the page has always carried, newest first by start date.
   The degree sits last because it began first, not because education
   conventionally goes at the bottom — and keeping all five is what shows the
   overlap a shorter list would hide. */
const RECORD = [
  { span: 'May – Jul 2026', org: 'SuperHealth', role: 'Product Design' },
  { span: 'Sept 2024 – Feb 2026', org: 'CNVRT Labs', role: 'Product Design' },
  { span: 'Apr 2024 – Jul 2025', org: 'Impact Acquisition', role: 'Growth' },
  { span: 'Jul 2023 —', org: 'Herbal Mitra', role: 'Co-founder' },
  { span: '2021 – 2025', org: 'IIT Guwahati', role: 'B.Des.' },
]

function Piece({
  id,
  state,
  foot,
  className = '',
  onTune,
  children,
}: {
  id: string
  state: State
  foot?: string
  className?: string
  onTune: (id: Tuned) => void
  children: React.ReactNode
}) {
  return (
    <section
      className={`piece ${className}`}
      data-state={state}
      onPointerEnter={() => onTune(id)}
      onPointerLeave={() => onTune(null)}
      onFocus={() => onTune(id)}
      onBlur={() => onTune(null)}
    >
      <CornerMarks />
      {children}
      {foot && <p className="piece-foot">{foot}</p>}
    </section>
  )
}

export function AboutStage() {
  const [tuned, setTuned] = useState<Tuned>(null)

  const tune = useCallback((id: Tuned) => {
    setTuned((cur) => (id === null ? (cur === null ? cur : null) : id))
  }, [])

  const stateOf = (id: string): State => (id === tuned ? 'tuned' : tuned ? 'dim' : 'rest')

  return (
    <div className="stage">
      <Piece id="signal" state={stateOf('signal')} className="stage-signal" onTune={tune}>
        {/* The only element here with a real edge, and the only thing that
            moves by itself. Three stills on a boomerang — left profile, front,
            right profile, and back — ordered as a head turning rather than in
            the order the camera took them.

            Photographs, so no `pixelated`: LINEAR is right and NEAREST would
            only alias. The studio backdrop is keyed out in the shader and
            replaced with noise inside the tube, so the raster runs across the
            new ground as well as the picture. */}
        <div className="stage-shot">
          <CrtScreen
            src="/images/anshul-left.jpg"
            frames={['/images/anshul-front.jpg', '/images/anshul-right.jpg']}
            frameMs={1800}
            alt="Anshul Suthar"
            lines={190}
            warp={0.18}
            mask={0.55}
            bloomAmount={0.3}
            shift={2.2}
            focusY={0.36}
            instability={0.9}
            roll={0.55}
            tear={0.75}
            sag={0.45}
            snow={0.95}
            keyStrength={1}
          />
        </div>
      </Piece>

      {/* The right-hand column, spaced to the same height as the picture. The
          identity heads it rather than sitting under the photograph: read top
          to bottom it now goes name, record, statement, which is the order the
          three are wanted in.

          Not a Piece — it has no hover state of its own. Dimming the name
          while pointing at the record would be the page hiding whose record it
          is. */}
      <div className="stage-side">
        <header className="stage-id">
          <h1 className="stage-name">Anshul Suthar</h1>
          <p className="stage-role">
            Product Designer <span>·</span> India <span>·</span> Open to work
          </p>
        </header>

        <Piece
          id="record"
          state={stateOf('record')}
          foot="Case file: 2019—2026"
          className="stage-record"
          onTune={tune}
        >
          <ol className="record">
            {RECORD.map((r) => (
              <li className="record-row" key={r.org}>
                <span className="record-span">{r.span}</span>
                <span className="record-org">{r.org}</span>
                <span className="record-role">{r.role}</span>
              </li>
            ))}
          </ol>
        </Piece>

        <Piece
          id="statement"
          state={stateOf('statement')}
          foot="Question until it makes sense"
          className="stage-statement"
          onTune={tune}
        >
          <p className="statement">
            I’m interested in how people, products, and systems fit together. I like getting close
            to a problem, understanding what’s actually happening, and{' '}
            <b>turning that into clear, useful experiences.</b>
          </p>
        </Piece>
      </div>
    </div>
  )
}
