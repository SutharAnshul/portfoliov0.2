'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * A running prototype in a case study: an artifact in the page, and a window
 * over it.
 *
 * ── What was here before ────────────────────────────────────────────────
 *
 * The prototype is a phone build, 390×844, and it used to be drawn at that
 * size in the page. On a phone that is very nearly the whole viewport, and a
 * vertical drag there has two possible meanings — move the page, or drive the
 * prototype. An iframe claims every one of them, and cross-origin it cannot be
 * asked to give any back: this page cannot see scrolling inside it, cannot
 * know when its inner scroller has hit the end, and cannot chain out of it.
 *
 * So the frame was made inert and given a lid you pressed to hand the gestures
 * over, and a bar fixed to the viewport to hand them back, and a release
 * button beside it — three pieces of chrome built to undo one decision. It
 * worked, and it was still wrong, because the frame remained taller than the
 * screen: the one control that mattered, the way to open it properly, sat
 * below the fold of a thing you could not scroll past. Readers never saw it.
 *
 * ── What is here now ────────────────────────────────────────────────────
 *
 * An artifact. The prototype runs in the page, but small — fitted to a box
 * that is capped well under a screenful, so whatever else is true, the way in
 * is on screen at the same time as the thing it opens. It holds no gestures at
 * all: the whole card is one control, and pressing it opens the prototype in a
 * window over the page.
 *
 * That deletes the ambiguity rather than negotiating with it. There is no
 * state where the page and the prototype are both listening, so there is
 * nothing to arm, nothing to release, and no bar to escape by.
 *
 * ── The window ──────────────────────────────────────────────────────────
 *
 * Near the whole screen, with a margin of dark left showing all the way
 * round. The margin is the point: flush to the edges it would read as having
 * replaced the site, and nothing would say the case study is still there
 * underneath. Floating, it is plainly something opened over a page you have
 * not left.
 *
 * One way out is drawn — the cross at the top right. Escape and the back
 * gesture work too; they are the platform's, they cost no pixels, and nobody
 * discovers them by looking. The backdrop deliberately does not close it: on a
 * phone that margin is a few millimetres either side of everything you are
 * trying to press, and a dismiss target there is a hazard rather than a
 * convenience.
 *
 * ── Why the fit is measured ─────────────────────────────────────────────
 *
 * CSS cannot compute it. calc() will not divide one length by another, so
 * `scale(calc(100cqw / 390px))` is not a ratio and not valid — it silently
 * does nothing and the device renders full size and overflows. The box has to
 * be measured, and it is, on a ResizeObserver.
 *
 * ── Why the window is portalled ─────────────────────────────────────────
 *
 * It is `position: fixed`, and it is rendered to document.body rather than in
 * place. It has to be: this component sits inside .plate, .plate carries a
 * transform for the frame's own switch-on, and a transformed ancestor becomes
 * the containing block for everything fixed inside it. Left in the tree, the
 * old escape bar measured 62px *below* the bottom of the screen — pinned to
 * the plate rather than to the viewport, and so exactly unreachable at the
 * moment it was the only way out.
 */

/* The build these prototypes are made at. Used when a record does not name its
   own size — a section that forgot to declare one should still render at a
   sensible phone rather than collapse to nothing. */
const DEFAULT_W = 390
const DEFAULT_H = 844

/** The window's title bar. Kept in step with .live-win-bar in globals.css. */
const LIVE_BAR = 44

/** Its hairline, on each of the four sides. Same rule: change both together. */
const LIVE_EDGE = 1

/**
 * The measured size of a box.
 *
 * `when` is only there to re-run the observer when the element it watches
 * arrives — the window's measuring box does not exist until the window is
 * open, and an effect that ran once on mount would have found nothing.
 */
function useBox(when?: unknown) {
  const ref = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = () => {
      const r = el.getBoundingClientRect()
      /* Sub-pixel churn would otherwise re-render on every scroll that moves
         a fractional layout by a fractional amount. */
      setBox((b) =>
        Math.abs(b.w - r.width) < 0.5 && Math.abs(b.h - r.height) < 0.5
          ? b
          : { w: r.width, h: r.height },
      )
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [when])

  return [ref, box] as const
}

export function LivePrototype({
  src,
  title = 'Live prototype',
  w = DEFAULT_W,
  h = DEFAULT_H,
}: {
  src?: string
  title?: string
  w?: number
  h?: number
}) {
  const [full, setFull] = useState(false)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)

  const [artRef, art] = useBox()
  const [areaRef, area] = useBox(full)

  /* Never above 1. These are phone builds; scaling one up is a blurry lie
     about the size it was drawn at.
     The window's fit gives up its own chrome first — the title bar and the
     hairline on all four sides. Miss the hairline and the device is two pixels
     wider than the box holding it, which overflow: hidden then shaves off the
     right-hand edge of the prototype rather than reporting it. */
  const kArt = art.w && art.h ? Math.min(1, art.w / w, art.h / h) : 0
  const kWin =
    area.w && area.h
      ? Math.min(
          1,
          (area.w - LIVE_EDGE * 2) / w,
          (area.h - LIVE_BAR - LIVE_EDGE * 2) / h,
        )
      : 0

  /**
   * Every way out of the window goes through here.
   *
   * Opening pushes a history entry so the phone's back gesture closes the
   * prototype rather than leaving the case study. That means every *other* way
   * out has to consume that entry, or it is left on the stack — and the next
   * back press then spends it doing nothing visible, with the press after that
   * finally leaving the page. Closing by Escape used to do exactly that.
   *
   * Going through history.back() rather than setFull(false) also makes the
   * popstate listener the single place the window is torn down, whichever exit
   * was used.
   */
  const closeFull = useCallback(() => {
    if (window.history.state?.prototype) window.history.back()
    else setFull(false)
  }, [])

  useEffect(() => {
    if (!full) return

    returnTo.current = document.activeElement as HTMLElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    /* The same flag the deck sets, so anything that needs to know something
       modal is open can ask one question rather than several. */
    document.documentElement.dataset.modal = 'prototype'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFull()
    }
    document.addEventListener('keydown', onKey)

    /* A history entry, so the phone's own back gesture closes it. Anyone who
       has opened something over a page on a phone tries that first, and
       landing on the previous *page* instead would be the worst possible
       answer to it. */
    window.history.pushState({ prototype: true }, '')
    const onPop = () => setFull(false)
    window.addEventListener('popstate', onPop)

    return () => {
      document.body.style.overflow = prevOverflow
      delete document.documentElement.dataset.modal
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('popstate', onPop)
      returnTo.current?.focus?.()
    }
  }, [full, closeFull])

  /**
   * Focus the way out, once there is one to focus.
   *
   * Separate from the effect above, and it has to be: the window is not in the
   * tree when that one runs. Nothing is rendered until the room has been
   * measured, so a focus() there had no button to land on and focus stayed
   * behind on the page — leaving a modal dialog open with the keyboard still
   * operating the record underneath it.
   */
  const ready = full && kWin > 0
  useEffect(() => {
    if (ready) closeBtn.current?.focus()
  }, [ready])

  /* A section that calls itself an embed but names no address has nothing to
     show. Rendering the chrome around an empty frame would be worse than
     rendering nothing — it would advertise a prototype that is not there. */
  if (!src) return null

  return (
    <div className="live">
      <div className="live-bar t-meta">
        <span className="live-dot" aria-hidden="true" />
        Live prototype
      </div>

      <div className="live-art">
        <div ref={artRef} className="live-fit live-art-fit">
          {kArt > 0 && (
            <div
              className="live-dev"
              style={{ width: Math.round(w * kArt), height: Math.round(h * kArt) }}
            >
              {/* Running, not photographed. A still would be cheaper and would
                  also be a lie — this way the thing you open is the thing you
                  were already looking at. It is scaled down and holds nothing:
                  the lid over it is what takes the press. */}
              <iframe
                src={src}
                title={title}
                loading="lazy"
                tabIndex={-1}
                className="live-frame"
                style={{ width: w, height: h, transform: `scale(${kArt})` }}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />

              <button
                type="button"
                className="live-art-hit"
                onClick={() => setFull(true)}
                aria-label={`Open ${title}`}
              >
                <span className="live-art-cue t-meta">
                  Open prototype
                  <span aria-hidden="true">↗</span>
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {full &&
        createPortal(
          <div className="live-full" role="dialog" aria-modal="true" aria-label={title}>
            {/* Stretched to the padding box, so measuring this measures
                exactly the room the window has to fit into. */}
            <div ref={areaRef} className="live-area">
              {/* Border-box, so the hairline the fit gave up is added back
                  here and the content box is the device exactly. */}
              {kWin > 0 && (
                <div
                  className="live-win"
                  style={{ width: Math.round(w * kWin) + LIVE_EDGE * 2 }}
                >
                  <header className="live-win-bar">
                    <span className="live-win-title t-meta">{title}</span>
                    <button
                      ref={closeBtn}
                      type="button"
                      className="live-x"
                      onClick={closeFull}
                      aria-label="Close prototype"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </header>

                  <div
                    className="live-fit live-win-stage"
                    style={{ height: Math.round(h * kWin) }}
                  >
                    <div
                      className="live-dev"
                      style={{ width: Math.round(w * kWin), height: Math.round(h * kWin) }}
                    >
                      <iframe
                        src={src}
                        title={title}
                        className="live-frame cursor-native"
                        style={{ width: w, height: h, transform: `scale(${kWin})` }}
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
