'use client'

import './cover.css'

import { useEffect, useRef, useState } from 'react'

/**
 * Four LinkedIn covers, at the real size.
 *
 * Each board is exactly 1584×396 — LinkedIn's cover size, and a 4:1 that the
 * supplied gradient already matches at 1400×349. They are drawn at full pixel
 * size and scaled down to fit the page with a transform, so what is on screen
 * is a true reduction of the artwork rather than a differently-laid-out
 * approximation of it. Toggle "1:1" to see one at its own size and screenshot
 * it.
 *
 * ── The constraint that shapes all four ─────────────────────────────────
 *
 * LinkedIn puts the profile photo over the bottom-left of the cover on
 * desktop, and crops the sides hard on a phone. So there are two dead zones,
 * and neither is negotiable:
 *
 *   the avatar   roughly the left 260px and bottom 150px. Anything there is
 *                behind a circular photograph.
 *   the phone    the outer ~15% of each side can be cropped away entirely.
 *
 * Every option below keeps its type out of both. The "safe" toggle draws them
 * so you can check rather than trust me.
 *
 * All four use Tronica for everything, which on this site is what the
 * interface speaks — see the note on the type system in globals.css.
 */

type Id = 'plate' | 'readout' | 'slate' | 'field'

const NOTES: Record<Id, { title: string; claim: string; against: string }> = {
  plate: {
    title: '01 · Nameplate',
    claim:
      'The masthead, enlarged. Name at the top of its own optical weight, role beneath it in one quiet line, and nothing else — the gradient does the work and the type stays out of its way.',
    against:
      'The most conservative of the four. It says who you are and nothing about how you think, which on a portfolio cover may be a wasted 1584 pixels.',
  },
  readout: {
    title: '02 · Readout',
    claim:
      'The cover as a status line. Small mono, ranged left, facts separated by rules rather than punctuation — the same voice the site uses for its record and its labels. Almost all gradient.',
    against:
      'Deliberately quiet, and at LinkedIn’s rendered size the type is genuinely small. It rewards a second look and risks not getting a first one.',
  },
  slate: {
    title: '03 · Slate',
    claim:
      'A broadcast slate: corner marks at the frame, a channel label, and the name on the centre line. This is the site’s own furniture — the marks are the thing it uses everywhere to say "this one".',
    against:
      'The marks and the CH label are an in-joke that only makes sense once you have seen the site. On a cover they may read as decoration rather than as a system.',
  },
  field: {
    title: '04 · Field',
    claim:
      'The name set as blocks on the icons’ own grid, half resolved and half still solid — the NameMark caught mid-sweep. The one option that shows a mechanism rather than describing one.',
    against:
      'A name that is partly unreadable is a real cost on a page whose job is to be found. It works because the profile already says the name underneath it.',
  },
}

const ORDER: Id[] = ['plate', 'readout', 'slate', 'field']

export default function CoverLab() {
  const [safe, setSafe] = useState(true)
  const [full, setFull] = useState<Id | null>(null)
  const list = useRef<HTMLDivElement>(null)

  /**
   * Publish each board's reduction as --k.
   *
   * Measured rather than expressed in CSS because there is no way to say "the
   * ratio of my container's width to 1584" — container query units are
   * lengths, and scale() wants a number. calc(100cqw / 1584) is a length, so
   * the declaration is dropped and the board renders full size.
   */
  useEffect(() => {
    const root = list.current
    if (!root) return
    const scalers = Array.from(root.querySelectorAll<HTMLElement>('.cv-scaler'))

    const fit = () => {
      for (const el of scalers) {
        const k = el.dataset.full === 'true' ? 1 : el.clientWidth / 1584
        el.style.setProperty('--k', String(k))
      }
    }

    fit()
    const ro = new ResizeObserver(fit)
    for (const el of scalers) ro.observe(el)
    return () => ro.disconnect()
  }, [full])

  return (
    <div className="cv-page">
      <header className="cv-head">
        <h1>LinkedIn cover · four options</h1>
        <p>
          Each board is exactly 1584×396, LinkedIn’s own size and the 4:1 the supplied gradient
          already is. Everything is set in Tronica.
        </p>
        <p className="cv-note">
          LinkedIn covers the bottom-left with the profile photo and crops the sides on a phone.
          Both dead zones are marked — every option keeps its type clear of them.
        </p>
        <div className="cv-controls">
          <button className="cv-btn" type="button" onClick={() => setSafe((v) => !v)}>
            {safe ? '◉' : '○'} Dead zones
          </button>
        </div>
      </header>

      <div className="cv-list" ref={list}>
        {ORDER.map((id) => (
          <section className="cv-item" key={id}>
            <div className="cv-item-head">
              <h2 className="cv-title">{NOTES[id].title}</h2>
              <button
                className="cv-btn cv-btn-sm"
                type="button"
                onClick={() => setFull(full === id ? null : id)}
              >
                {full === id ? 'Fit' : '1:1'}
              </button>
            </div>

            <div className="cv-scaler" data-full={full === id}>
              <Board id={id} safe={safe} />
            </div>

            <p className="cv-claim">{NOTES[id].claim}</p>
            <p className="cv-against">
              <span className="cv-against-tag">Against</span>
              {NOTES[id].against}
            </p>
          </section>
        ))}
      </div>
    </div>
  )
}

function Board({ id, safe }: { id: Id; safe: boolean }) {
  return (
    <div className="cv-board" data-kind={id}>
      <img className="cv-bg" src="/images/cover-gradient.png" alt="" />

      {id === 'plate' && (
        <div className="cv-plate">
          <div className="cv-name">Anshul Suthar</div>
          <div className="cv-role">
            Product designer <i /> India <i /> Open to work
          </div>
        </div>
      )}

      {id === 'readout' && (
        <div className="cv-readout">
          <div className="cv-readout-name">Anshul Suthar</div>
          <dl className="cv-readout-rows">
            <div>
              <dt>Role</dt>
              <dd>Product Designer</dd>
            </div>
            <div>
              <dt>Based</dt>
              <dd>India</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd className="cv-live">Open to work</dd>
            </div>
          </dl>
        </div>
      )}

      {id === 'slate' && (
        <>
          <span className="cv-mark cv-mark-tl" />
          <span className="cv-mark cv-mark-tr" />
          <span className="cv-mark cv-mark-bl" />
          <span className="cv-mark cv-mark-br" />
          <div className="cv-slate-top">
            <span>CH 01 — ANSHUL SUTHAR</span>
            <span className="cv-live">● OPEN TO WORK</span>
          </div>
          <div className="cv-slate-mid">
            <div className="cv-name">Anshul Suthar</div>
            <div className="cv-role">Product designer, India</div>
          </div>
        </>
      )}

      {id === 'field' && (
        <div className="cv-field">
          <div className="cv-field-grid" aria-label="Anshul Suthar">
            {['Anshul', 'Suthar'].map((word, r) => (
              <div className="cv-field-row" key={word}>
                {[...word].map((ch, i) => (
                  <span
                    className="cv-cell"
                    key={i}
                    /* Blocked to the left of the sweep, resolved to the right —
                       the mark caught mid-wipe, with the second row lagging the
                       first exactly as it does on the site. */
                    data-on={i >= (r === 0 ? 3 : 2)}
                  >
                    {ch}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className="cv-role">Product designer <i /> India <i /> Open to work</div>
        </div>
      )}

      {safe && (
        <>
          <span className="cv-zone cv-zone-avatar" title="Profile photo sits here" />
          <span className="cv-zone cv-zone-crop cv-zone-crop-l" />
          <span className="cv-zone cv-zone-crop cv-zone-crop-r" />
        </>
      )}
    </div>
  )
}
