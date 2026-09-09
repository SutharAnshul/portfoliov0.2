'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Two ways to read a record's screens.
 *
 * Scroll mode is the page you are already on: frames in plates, one under the
 * next, read at your own pace. Presentation mode is the same frames one at a
 * time, filling the viewport, driven by the arrow keys — which is how a deck
 * was meant to be looked at, and how anyone who has sat through a portfolio
 * review already expects to move through one.
 *
 * The frames themselves stay server-rendered. This component wraps them and
 * catches clicks on its own subtree rather than owning the markup, so the page
 * keeps its HTML and a still frame becomes a way in at that exact slide.
 * Live-prototype frames carry no index and are left alone to be used.
 *
 * The way in says "Present". After that the screen belongs to the slide, and
 * two things are allowed to sit on top of it: a rail along the bottom saying
 * how far through you are, and a cross to leave by. Nothing appears on hover,
 * nothing appears on the way to the next slide, and nothing waits to fade —
 * there is no third state to discover, because there is nothing else there.
 *
 * The rail says it without saying a number. "14 / 24" is a fact you have to
 * read; a row of dashes is a proportion you can take in without looking away
 * from the slide, which is the only reason to put anything there at all.
 *
 * The cross is present and faint rather than hidden and revealed: reachable
 * the instant you want it, invisible until then, and fully drawn only when the
 * pointer is actually on it. A control that has to be summoned is a control
 * people assume does not exist.
 *
 * Every key still works the whole time — arrows, space, page keys, Home and
 * End, Escape and F — as does clicking the slide to advance and swiping on a
 * phone. They are simply not advertised on every frame.
 */

export interface Slide {
  src: string
  alt: string
}

/** How long the one line about getting out stays up. */
const HINT_MS = 3600

export function Presenter({
  title,
  label,
  count,
  slides,
  children,
}: {
  title: string
  /** What this set of frames is — "Screens", or "Prototype" where it is one. */
  label: string
  /** How many, said the way the record says it. */
  count: string
  slides: Slide[]
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [i, setI] = useState(0)
  const [hint, setHint] = useState(false)
  const overlay = useRef<HTMLDivElement>(null)
  const opener = useRef<HTMLElement | null>(null)

  useEffect(() => setMounted(true), [])

  const show = useCallback(
    (at: number) => {
      opener.current = document.activeElement as HTMLElement | null
      setI(Math.min(Math.max(at, 0), slides.length - 1))
      setOpen(true)
      setHint(true)
      // Opening is a click, so this is a user gesture and the request is
      // allowed. Best-effort: refused, the overlay still fills the viewport.
      document.documentElement.requestFullscreen?.().catch(() => {})
    },
    [slides.length],
  )

  const hide = useCallback(() => {
    setOpen(false)
    // Fullscreen is opt-in, but if it is on, leaving the deck leaves it too.
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    opener.current?.focus?.()
  }, [])

  const go = useCallback(
    (d: number) => setI((n) => Math.min(Math.max(n + d, 0), slides.length - 1)),
    [slides.length],
  )

  /** A click on a still frame opens the deck there. */
  const onFrameClick = (e: React.MouseEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-slide]')
    if (!el) return
    e.preventDefault()
    show(Number(el.dataset.slide))
  }

  // ── Keys ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      const k = e.key
      if (k === 'Escape') return hide()
      if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ') {
        e.preventDefault()
        return go(1)
      }
      if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') {
        e.preventDefault()
        return go(-1)
      }
      if (k === 'Home') return setI(0)
      if (k === 'End') return setI(slides.length - 1)
      // Tab must not walk out of a modal and start operating the page behind
      // it, so the ends of the deck's own controls are wired to each other.
      if (k === 'Tab') {
        const box = overlay.current
        if (!box) return
        const stops = box.querySelectorAll<HTMLElement>('button:not(:disabled)')
        if (!stops.length) return
        const first = stops[0]
        const last = stops[stops.length - 1]
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        } else if (e.shiftKey && (document.activeElement === first || document.activeElement === box)) {
          e.preventDefault()
          last.focus()
        }
        return
      }
      if (k === 'f' || k === 'F') {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
        else document.documentElement.requestFullscreen?.().catch(() => {})
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, go, hide, slides.length])

  // ── The page underneath stays put ───────────────────────────────
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Read by ScrollAdvance, which otherwise turns a wheel inside the deck
    // into a navigation away from the record.
    document.documentElement.dataset.modal = 'deck'
    overlay.current?.focus()
    return () => {
      document.body.style.overflow = prev
      delete document.documentElement.dataset.modal
    }
  }, [open])

  // ── The one line, and then silence ──────────────────────────────
  useEffect(() => {
    if (!open || !hint) return
    const t = window.setTimeout(() => setHint(false), HINT_MS)
    return () => window.clearTimeout(t)
  }, [open, hint])

  // ── Leaving fullscreen leaves the deck ──────────────────────────
  // Escape is taken by the browser while fullscreen is on, so the keydown
  // handler never sees it. Without this the first Escape would drop out of
  // fullscreen and appear to do nothing, and it would take a second one to
  // actually close — which is not what the line on screen promised.
  useEffect(() => {
    if (!open) return
    const onFs = () => {
      if (!document.fullscreenElement) hide()
    }
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [open, hide])

  // ── Swipe ───────────────────────────────────────────────────────
  const touch = useRef<{ x: number; y: number } | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.changedTouches[0]
    touch.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touch.current.x
    const dy = t.clientY - touch.current.y
    touch.current = null
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1)
  }

  const at = slides[i]
  const last = i === slides.length - 1

  return (
    <>
      {/* The way in sits in the row that already counts the frames, next to
          the count, because that is where a reader is already looking to find
          out how much of this there is. */}
      <div className="flex items-baseline justify-between" style={{ paddingBottom: 'var(--s3)' }}>
        <span className="t-label">{label}</span>
        <span className="screens-meta">
          <span className="t-label">{count}</span>
          {slides.length > 0 && (
            <button type="button" className="present-open t-label" onClick={() => show(0)}>
              Present
              <span aria-hidden="true">→</span>
            </button>
          )}
        </span>
      </div>
      <hr className="rule" />

      {/* Clicks are caught here rather than bound to each frame, so the frames
          stay server-rendered markup and a still becomes a way in at itself. */}
      <div onClick={onFrameClick}>{children}</div>

      {mounted &&
        open &&
        at &&
        createPortal(
          <div
            ref={overlay}
            className="deck cursor-native"
            role="dialog"
            aria-modal="true"
            aria-label={`${title}, presentation`}
            tabIndex={-1}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* The way out. That is all this row carries. */}
            <header className="deck-bar">
              <button type="button" className="deck-x" onClick={hide} aria-label="Close, back to the page">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </header>

            {/* The slide. Clicking it advances, which is what a deck does. */}
            <div className="deck-stage" onClick={() => !last && go(1)}>
              <img src={at.src} alt={at.alt} className="deck-img" />
            </div>

            {/* Neighbours, fetched quietly so a keypress never waits. */}
            <div className="deck-warm" aria-hidden="true">
              {[i - 1, i + 1]
                .filter((n) => n >= 0 && n < slides.length)
                .map((n) => (
                  <img key={slides[n].src} src={slides[n].src} alt="" />
                ))}
            </div>

            {/* One dash a slide: how far through, and a way to jump without
                stepping through everything in between. */}
            <footer className="deck-rail">
              {slides.map((s, n) => (
                <button
                  key={s.src}
                  type="button"
                  className={`deck-tick${n === i ? ' is-at' : ''}${n < i ? ' is-past' : ''}`}
                  onClick={() => setI(n)}
                  aria-label={`Slide ${n + 1}`}
                  aria-current={n === i ? 'true' : undefined}
                />
              ))}
            </footer>

            {/* Said once, on the way in, and then it goes. A phone is told
                about the control it actually has. */}
            {hint && (
              <p className="deck-hint t-meta" role="status">
                <span className="deck-hint-fine">
                  Press <kbd>Esc</kbd> to exit fullscreen
                </span>
                <span className="deck-hint-touch">Tap × to exit</span>
              </p>
            )}
          </div>,
          document.body,
        )}
    </>
  )
}
