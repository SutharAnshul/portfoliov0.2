'use client'

import './reveal.css'

import { useState } from 'react'
import { DURATION, Reveal, type Mode } from './reveal'

/**
 * Four image reveals for the case studies, side by side.
 *
 * The reveal the site ships today is a CSS bloom, and it is about the frame —
 * two marks on a centre line, and the plate grows out from between them. It
 * says a panel opened. None of these say that. Each one is about the picture,
 * and each answers a different question about why it was not there a moment
 * ago. That is the choice being made here, not which one looks best in
 * isolation.
 *
 * Press one to run it again; press Run all to see them together, which is the
 * only way to judge pace against each other.
 */

const SHOT = '/images/incentiwise/deck/01.png'
const ALT = 'Incentiwise — the feed, organisation and badges screens in perspective'

const NOTES: Record<Mode, { title: string; claim: string; how: string; against: string }> = {
  raster: {
    title: 'A · Raster',
    claim: 'It is being drawn, and the beam has not got there yet.',
    how: 'The beam sweeps once and leaves heat behind it — the lines just painted are brighter and cool back to correct, because a hard edge between drawn and not-drawn is a wipe, and a wipe is a mask sliding rather than a tube working. The raster jitters while it lays down and locks as the frame completes.',
    against: 'The most literal reading of the site’s own metaphor, which is either the point or the problem: with tubes on About and on every thumbnail, a fourth CRT idea risks reading as a filter applied to everything rather than as a motif.',
  },
  converge: {
    title: 'B · Converge',
    claim: 'It is there and wrong, and the set is pulling it straight.',
    how: 'Nothing is hidden — the picture is complete from the first frame and simply misregistered, pincushioned and ringing. The ring is a damped oscillation, constant frequency with a falling envelope, because a degauss coil is an LC circuit; a linear ease is the one thing that would give it away.',
    against: 'It reveals nothing, so on a long page it may read as a glitch rather than an arrival. Also the strongest of the four, which makes it the most tiring to meet four times in a row.',
  },
  resolve: {
    title: 'C · Resolve',
    claim: 'It is there and coarse, and more of it is coming.',
    how: 'Cells and levels both step in powers of two — 16px and two colours up to pixels and thirty-two. It steps rather than slides, because a blur clearing is a continuous thing losing radius and this is a discrete thing gaining resolution: you should be able to count the stages. Ordered Bayer dither, not noise, so two levels make a pattern instead of a mess.',
    against: 'The only one that is not about a display, so it sits with the icons rather than with the tubes. That is either the cleanest fit with the pixel language or a second, competing story about what this site is.',
  },
  transmit: {
    title: 'D · Transmit',
    claim: 'It is arriving in pieces, out of order, down a wire.',
    how: 'Bands land on an interlaced schedule — every eighth, then the fours, then the twos, then the rest — which is how a progressive JPEG came in over a modem. Each lands with a sideways tear and snaps straight. Unlanded bands hold snow.',
    against: 'Out-of-order arrival is legible to anyone who used the web before broadband and possibly to nobody else. It is also the longest, and length is the one thing a reveal cannot afford four times down a page.',
  },
}

const ORDER: Mode[] = ['raster', 'converge', 'resolve', 'transmit']

export default function RevealLab() {
  const [keys, setKeys] = useState<Record<Mode, number>>({
    raster: 1,
    converge: 1,
    resolve: 1,
    transmit: 1,
  })

  const play = (m: Mode) => setKeys((k) => ({ ...k, [m]: k[m] + 1 }))
  const playAll = () =>
    setKeys((k) => ({
      raster: k.raster + 1,
      converge: k.converge + 1,
      resolve: k.resolve + 1,
      transmit: k.transmit + 1,
    }))

  return (
    <div className="rv-page">
      <header className="rv-head">
        <h1>Image reveal · four options</h1>
        <p>
          The reveal on the case studies today is a CSS bloom, and it is about the frame: two marks
          on a centre line, and the plate grows out from between them. It says a panel opened. None
          of these say that — each is about the picture, and each answers a different question about
          why it was not there a moment ago.
        </p>
        <p className="rv-note">
          That is the choice: a screen in a case study is either a thing being shown to you (A, B)
          or a thing being received (C, D). Pick the fiction first and the animation second.
        </p>
        <button className="rv-btn" type="button" onClick={playAll}>
          ▶ Run all
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
