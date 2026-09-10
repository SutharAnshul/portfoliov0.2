'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * A running prototype embedded in a case study, without trapping the page.
 *
 * ── The problem ─────────────────────────────────────────────────────────
 *
 * The prototype is a phone build, 390×844, which on a phone is very nearly the
 * whole viewport. A vertical drag has two possible meanings there — move the
 * page, or drive the prototype — and an iframe silently claims every one of
 * them. Readers arrived at the prototype and could not get past it.
 *
 * The obvious fix is not available. The prototype is cross-origin, so this page
 * cannot see scrolling inside it, cannot know when its inner scroller has hit
 * the end, and cannot chain the scroll back out. "Let it scroll until it runs
 * out, then release the page" is impossible at any price, not merely awkward.
 *
 * ── The answer ──────────────────────────────────────────────────────────
 *
 * So the gesture's meaning is made explicit instead, in two steps that suit two
 * different readers:
 *
 *   Inert.   It loads and runs immediately — it is genuinely alive, not a
 *            screenshot — but an overlay holds every pointer event. Scrolling
 *            past it is scrolling past a picture. Someone skimming never has
 *            to know it is interactive.
 *
 *   Armed.   Tapping hands the gestures over. Now the prototype has them all,
 *            which is the whole point, and the page cannot be scrolled while a
 *            finger is inside the frame.
 *
 *   Full.    Or open it properly, where it gets the entire viewport. On a
 *            phone that means the prototype finally runs at the size it was
 *            designed for rather than squeezed into a plate.
 *
 * ── Getting out ─────────────────────────────────────────────────────────
 *
 * This is the part that has to be right, because arming deliberately takes the
 * scroll away. A control below the frame would be unreachable — you cannot
 * scroll down to a button when the thing you must scroll past is the thing
 * holding your finger.
 *
 * So while it is armed there is a bar fixed to the bottom of the *viewport*,
 * not the page. It is on screen wherever you have got to. Alongside it:
 * Escape, and a tap anywhere outside the frame. Three ways out, one of which
 * is always visible.
 *
 * Full screen has the same three — a Close that never scrolls away, Escape,
 * and the backdrop — plus the browser's own back gesture, since opening it
 * pushes a history entry.
 *
 * ── Why both of those are portalled ─────────────────────────────────────
 *
 * The escape bar and the full-screen dialog are `position: fixed`, and both
 * are rendered to document.body rather than in place. They have to be: this
 * component sits inside .plate, .plate carries a transform for the frame's own
 * switch-on, and a transformed ancestor becomes the containing block for
 * everything fixed inside it. Left in the tree the escape bar measured 62px
 * *below* the bottom of the screen — pinned to the plate, not to the viewport,
 * and so exactly unreachable at the moment it is the only way out.
 */

/* The build these prototypes are made at. Used when a record does not name
   its own size — a section that forgot to declare one should still render at a
   sensible phone rather than collapse to nothing. */
const DEFAULT_W = 390
const DEFAULT_H = 844

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
  const [armed, setArmed] = useState(false)
  const [full, setFull] = useState(false)
  const stage = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)

  const disarm = useCallback(() => setArmed(false), [])

  /* A section that calls itself an embed but names no address has nothing to
     show. Rendering the chrome around an empty frame would be worse than
     rendering nothing — it would advertise a prototype that is not there. */
  const missing = !src

  /* ── Out of the armed state ─────────────────────────────────────────── */
  useEffect(() => {
    if (!armed) return

    /* Pointer down outside the frame. Capture phase, because the iframe will
       happily swallow the event on its way back up and this has to see it
       first. */
    const onDown = (e: PointerEvent) => {
      if (!stage.current?.contains(e.target as Node)) disarm()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') disarm()
    }

    document.addEventListener('pointerdown', onDown, true)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [armed, disarm])

  /**
   * Every way out of full screen goes through here.
   *
   * Opening pushes a history entry so the phone's back gesture closes the
   * prototype rather than leaving the case study. That means every *other* way
   * out has to consume that entry, or it is left on the stack — and the next
   * back press then spends it doing nothing visible, with the press after that
   * finally leaving the page. Closing by Escape used to do exactly that.
   *
   * Going through history.back() rather than setFull(false) also means the
   * popstate listener is the single place the dialog is torn down, whichever
   * of the four exits was used.
   */
  const closeFull = useCallback(() => {
    if (window.history.state?.prototype) window.history.back()
    else setFull(false)
  }, [])

  /* ── Full screen ────────────────────────────────────────────────────── */
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
       has opened something full screen on a phone tries that first, and
       landing on the previous *page* instead would be the worst possible
       answer to it. */
    window.history.pushState({ prototype: true }, '')
    const onPop = () => setFull(false)
    window.addEventListener('popstate', onPop)

    closeBtn.current?.focus()

    return () => {
      document.body.style.overflow = prevOverflow
      delete document.documentElement.dataset.modal
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('popstate', onPop)
      returnTo.current?.focus?.()
    }
  }, [full, closeFull])

  if (missing) return null

  return (
    <div className="live" data-armed={armed}>
      <div className="live-bar t-meta">
        <span className="live-dot" aria-hidden="true" />
        {armed ? 'Yours — the page is held' : 'Live prototype — tap to use'}
      </div>

      <div className="live-stage" ref={stage} style={{ width: w, maxWidth: '100%' }}>
        {/* Always mounted and always running, armed or not. A still would be
            cheaper and would also be a lie — this way what you tap into is the
            thing you were already looking at, mid-state. */}
        <iframe
          src={src}
          title={title}
          loading="lazy"
          className="live-frame cursor-native"
          style={{ width: w, height: h }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          tabIndex={armed ? undefined : -1}
        />

        {/* The lid. It covers the frame exactly and takes every pointer event
            until it is pressed, which is the whole mechanism — there is no
            state where the page and the prototype are both listening. */}
        {!armed && (
          <button className="live-arm" type="button" onClick={() => setArmed(true)}>
            <span className="live-arm-label">Tap to use</span>
          </button>
        )}
      </div>

      <div className="live-actions">
        <button className="live-btn" type="button" onClick={() => setFull(true)}>
          Open full screen ↗
        </button>
        {armed && (
          <button className="live-btn" type="button" onClick={disarm}>
            Release
          </button>
        )}
      </div>

      {/* Fixed to the viewport, not to the page, and portalled out of the
          plate so that "fixed" means the viewport — see the note above. While
          armed the page cannot be scrolled, so anything in the flow below the
          frame is unreachable; this is the way out that is always on screen. */}
      {armed &&
        createPortal(
          <div className="live-escape" role="status">
            <span className="live-escape-text t-meta">Prototype has the screen</span>
            <button className="live-btn live-btn-strong" type="button" onClick={disarm}>
              Release ✕
            </button>
          </div>,
          document.body,
        )}

      {full &&
        createPortal(
          <div className="live-full" role="dialog" aria-modal="true" aria-label={title}>
          {/* The backdrop is its own button so that a press anywhere off the
              device closes it, and so that press is a real control rather than
              a handler bolted to a div. */}
          <button className="live-full-scrim" type="button" aria-label="Close" onClick={closeFull} />

          <div className="live-full-bar">
            <span className="t-meta">{title}</span>
            <button
              ref={closeBtn}
              className="live-btn live-btn-strong"
              type="button"
              onClick={closeFull}
            >
              Close ✕
            </button>
          </div>

          {/* On a phone this fills the viewport, which is the entire reason to
              have a full screen at all: a phone prototype finally running at
              phone size. On a desktop it keeps its own 390×844 so it does not
              become a stretched tablet. */}
          <iframe
            src={src}
            title={title}
            className="live-full-frame cursor-native"
            style={{ ['--pw' as string]: `${w}px`, ['--ph' as string]: `${h}px` }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>,
          document.body,
        )}
    </div>
  )
}
