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
 * Every affordance is stated rather than implied. The way in says "Present",
 * the way out says "Esc", the keys are named along the bottom, and the rail
 * shows both where you are and how much is left. A deck that needs explaining
 * is a deck nobody finishes.
 */

export interface Slide {
  src: string
  alt: string
}

/** How long the chrome stays up after the last input. */
const IDLE_MS = 2600

const pad = (n: number) => String(n).padStart(2, '0')

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
  const [idle, setIdle] = useState(false)
  const overlay = useRef<HTMLDivElement>(null)
  const opener = useRef<HTMLElement | null>(null)

  useEffect(() => setMounted(true), [])

  const show = useCallback(
    (at: number) => {
      opener.current = document.activeElement as HTMLElement | null
      setI(Math.min(Math.max(at, 0), slides.length - 1))
      setOpen(true)
      setIdle(false)
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

  // ── The chrome gets out of the way ──────────────────────────────
  // Anything that is not the slide fades once you stop asking for it, and
  // comes straight back on the next movement or keystroke.
  useEffect(() => {
    if (!open) return
    let t: number
    const wake = () => {
      setIdle(false)
      clearTimeout(t)
      t = window.setTimeout(() => setIdle(true), IDLE_MS)
    }
    wake()
    window.addEventListener('pointermove', wake)
    window.addEventListener('keydown', wake)
    return () => {
      clearTimeout(t)
      window.removeEventListener('pointermove', wake)
      window.removeEventListener('keydown', wake)
    }
  }, [open])

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
  const first = i === 0
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
              <span aria-hidden="true">↗</span>
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
            className={`deck cursor-native${idle ? ' deck-idle' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={`${title}, presentation`}
            tabIndex={-1}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* Where you are, and the way out. */}
            <header className="deck-bar">
              <span className="deck-name t-label">{title}</span>
              <span className="deck-count t-label">
                {pad(i + 1)} <span className="deck-of">/ {pad(slides.length)}</span>
              </span>
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

            <button
              type="button"
              className="deck-step deck-prev"
              onClick={() => go(-1)}
              disabled={first}
              aria-label="Previous slide"
            >
              ←
            </button>
            <button
              type="button"
              className="deck-step deck-next"
              onClick={() => go(1)}
              disabled={last}
              aria-label="Next slide"
            >
              →
            </button>

            <footer className="deck-foot">
              {/* One segment a slide: where you are, how far is left, and a
                  way to jump without stepping through everything between. */}
              <div className="deck-rail">
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
              </div>
              {/* A phone has no arrow keys and no Esc, so it is told what it
                  does have. Both are rendered and CSS picks; a media query is
                  the only thing here that knows about the device. */}
              <p className="deck-keys deck-keys-fine t-meta">
                <kbd>←</kbd>
                <kbd>→</kbd> move
                <span className="deck-sep">·</span>
                <kbd>F</kbd> fullscreen
                <span className="deck-sep">·</span>
                <kbd>Esc</kbd> close
              </p>
              <p className="deck-keys deck-keys-touch t-meta">
                Swipe or tap to move
                <span className="deck-sep">·</span>
                <kbd>×</kbd> to close
              </p>
            </footer>
          </div>,
          document.body,
        )}
    </>
  )
}
