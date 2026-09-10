'use client'

import './reveal.css'

import { useState } from 'react'
import { DURATION, Reveal, type Mode } from './reveal'

/**
 * Two CRT load animations for the case study screens.
 *
 * The lesson from the earlier round of four is that the interesting question
 * is not which effect but how much of one — what shipped had to be quietened
 * twice, and what made it too much was never the mechanism, it was having
 * several going at once. So each of these is a single gesture, under half a
 * second, ending exactly on the photograph.
 *
 * Run both together to judge them against each other; that is the only
 * comparison that means anything at this length.
 */

const SHOT = '/images/incentiwise/deck/01.png'
const ALT = 'Incentiwise — the feed, organisation and badges screens in perspective'

const NOTES: Record<Mode, { title: string; claim: string; how: string; against: string }> = {
  switchon: {
    title: 'A · Switch-on',
    claim: 'The tube comes on.',
    how: 'The picture is squashed into a bright line across the middle and opens out, overbright, settling to correct. Squashed rather than masked — sampling through the opening rather than clipping to it — because a mask parting is a pair of doors, and a tube holds the whole frame in that line the entire time. The brightness runs on a slower curve than the geometry, so the shape arrives and then the light settles, which is the order it happens in.',
    against: 'The theatrical one. It moves the whole picture, so twenty-four of them down a page is twenty-four small performances — and it is close to what the frame’s own plate bloom used to do, which is the thing that read as too much.',
  },
  interlace: {
    title: 'B · Interlace',
    claim: 'The two fields have not meshed yet.',
    how: 'Alternate lines sit up to three device pixels out of register and close. Nothing else moves — the picture stays exactly where it is, at exactly the size it will be, and only its own lines shift against each other, so every edge in it is briefly combed and then is not. Device pixels rather than uv, so it is the same amount on a thumbnail as on a full-width screen.',
    against: 'Subtle enough that on a soft or low-contrast screen it may not register at all. It is a fault you notice on hard edges, and some of these pictures do not have many.',
  },
}

const ORDER: Mode[] = ['switchon', 'interlace']

export default function RevealLab() {
  const [keys, setKeys] = useState<Record<Mode, number>>({ switchon: 1, interlace: 1 })

  const play = (m: Mode) => setKeys((k) => ({ ...k, [m]: k[m] + 1 }))
  const playAll = () =>
    setKeys((k) => ({ switchon: k.switchon + 1, interlace: k.interlace + 1 }))

  return (
    <div className="rv-page">
      <header className="rv-head">
        <h1>Screen load · two CRT options</h1>
        <p>
          One gesture each, under half a second, ending exactly on the photograph. A is a display
          starting; B is a display locking. A moves the whole picture, B never moves it at all —
          only its lines against each other — which makes B the quieter by a long way.
        </p>
        <p className="rv-note">
          What is on screen now is the dither resolve, which had to be quietened twice. The thing
          that made it too much was never the mechanism, it was having more than one going at once.
          Both of these are deliberately a single idea.
        </p>
        <button className="rv-btn" type="button" onClick={playAll}>
          ▶ Run both
        </button>
      </header>

      <div className="rv-grid">
        {ORDER.map((m) => (
          <section className="rv-panel" key={m}>
            <div className="rv-panel-head">
              <h2 className="rv-title">{NOTES[m].title}</h2>
              <button className="rv-btn rv-btn-sm" type="button" onClick={() => play(m)}>
                ▶ Replay
              </button>
            </div>

            <button className="rv-stage" type="button" onClick={() => play(m)} aria-label="Replay">
              <Reveal mode={m} src={SHOT} alt={ALT} playKey={keys[m]} />
            </button>

            <p className="rv-claim">{NOTES[m].claim}</p>
            <dl className="rv-meta">
              <dt>How</dt>
              <dd>{NOTES[m].how}</dd>
              <dt>Against</dt>
              <dd>{NOTES[m].against}</dd>
              <dt>Runs</dt>
              <dd>{DURATION[m]}ms</dd>
            </dl>
          </section>
        ))}
      </div>
    </div>
  )
}
