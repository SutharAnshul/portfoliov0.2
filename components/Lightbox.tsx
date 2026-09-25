'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Any picture in a record, opened full screen and zoomed at the pointer.
 *
 * A record is read at whatever size the column allows — the long scroll is
 * drawn at 1440 and shown at the fraction of it that fits — so every screen in
 * it is smaller on the page than it was designed to be. This is the way back
 * to the thing itself: click a picture and it fills the window at its own
 * size, and the wheel takes you into it.
 *
 * Zoom is at the pointer, not at the middle of the screen. What is under the
 * cursor stays under the cursor as the scale changes, which is what makes it
 * possible to go looking for a detail rather than scaling up and then hunting
 * for where the detail went. The arithmetic is one line: a point sits at
 * `centre + offset + local * scale`, so holding it still while the scale
 * changes means moving the offset by the same ratio.
 *
 * It listens at the document rather than being wrapped around anything,
 * because half the pictures on a record are inside markup this site did not
 * write — the export's own, dropped in whole. `within` is what keeps it from
 * hijacking every image on the site: a thumbnail on the front page is a door,
 * not a picture, and clicking it should still open the record.
 */

type View = { s: number; x: number; y: number }
type Shot = { src: string; alt: string }

const REST: View = { s: 1, x: 0, y: 0 }
const MIN = 1
const MAX = 8
/* Smaller than this on the page and it is a glyph, not a picture. */
const GLYPH = 80

/** A wheel notch in pixels, whatever unit the device reports it in. */
function ticks(e: WheelEvent) {
  if (e.deltaMode === 1) return e.deltaY * 16
  if (e.deltaMode === 2) return e.deltaY * 400
  return e.deltaY
}

export function Lightbox({ within }: { within: string }) {
  const [shot, setShot] = useState<Shot | null>(null)
  const [view, setView] = useState<View>(REST)

  const stage = useRef<HTMLDivElement>(null)
  const shown = useRef<HTMLImageElement>(null)
  const drag = useRef<{ x: number; y: number; vx: number; vy: number; far: number } | null>(null)

  /* Panning stops at the edges of the picture: past them there is nothing to
     look at, and a picture that can be flung off the screen feels broken
     rather than free. At rest it is centred and there is nothing to hold. */
  const hold = useCallback((v: View): View => {
    const el = shown.current
    if (!el || v.s <= 1) return { s: v.s, x: 0, y: 0 }
    const mx = (el.offsetWidth * (v.s - 1)) / 2
    const my = (el.offsetHeight * (v.s - 1)) / 2
    return {
      s: v.s,
      x: Math.min(mx, Math.max(-mx, v.x)),
      y: Math.min(my, Math.max(-my, v.y)),
    }
  }, [])

  /* ── opening ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    const open = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      const target = e.target as Element | null
      const picture = target?.closest?.('img') as HTMLImageElement | null
      if (!picture || !picture.closest(within)) return
      /* A picture inside a link is a link. */
      if (picture.closest('a')) return
      /* And an image the size of a letter is a letter: the record sets some of
         its bullets and logos as files, and opening one full screen would be
         answering a click nobody meant to make. */
      const box = picture.getBoundingClientRect()
      if (box.width < GLYPH || box.height < GLYPH) return
      e.preventDefault()
      setView(REST)
      setShot({ src: picture.currentSrc || picture.src, alt: picture.alt || '' })
    }

    document.addEventListener('click', open)
    return () => document.removeEventListener('click', open)
  }, [within])

  /* ── while it is open ────────────────────────────────────────────────── */
  useEffect(() => {
    if (!shot) return

    const was = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShot(null)
    }
    window.addEventListener('keydown', key)

    return () => {
      document.body.style.overflow = was
      window.removeEventListener('keydown', key)
    }
  }, [shot])

  /* The wheel has to be taken rather than watched — the page behind would
     scroll otherwise — and a listener that cancels cannot be a passive one,
     which is the only reason this is not an onWheel prop. */
  useEffect(() => {
    const el = stage.current
    if (!el || !shot) return

    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      const box = el.getBoundingClientRect()
      const cx = box.left + box.width / 2
      const cy = box.top + box.height / 2

      setView((v) => {
        const s = Math.min(MAX, Math.max(MIN, v.s * Math.exp(-ticks(e) * 0.0022)))
        const k = s / v.s
        return hold({
          s,
          x: e.clientX - cx - (e.clientX - cx - v.x) * k,
          y: e.clientY - cy - (e.clientY - cy - v.y) * k,
        })
      })
    }

    el.addEventListener('wheel', wheel, { passive: false })
    return () => el.removeEventListener('wheel', wheel)
  }, [shot, hold])

  if (!shot) return null

  const grabbing = view.s > 1

  /* Hung on the body rather than left where it was written. The page carries
     a transform while it arrives, and an element with a transform is the
     containing block for everything fixed inside it — which made a full-screen
     overlay the height of the whole record instead of the height of the
     window. Nothing about an overlay belongs in the document flow anyway. */
  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={shot.alt || 'Full screen'}>
      <button type="button" className="lightbox-shut" onClick={() => setShot(null)} aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path d="M3 3 15 15M15 3 3 15" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>

      <div
        ref={stage}
        className="lightbox-stage"
        data-grab={grabbing}
        onPointerDown={(e) => {
          if (!grabbing) return
          ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
          drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, far: 0 }
        }}
        onPointerMove={(e) => {
          const d = drag.current
          if (!d) return
          const dx = e.clientX - d.x
          const dy = e.clientY - d.y
          d.far = Math.max(d.far, Math.abs(dx) + Math.abs(dy))
          setView((v) => hold({ s: v.s, x: d.vx + dx, y: d.vy + dy }))
        }}
        onPointerUp={() => {
          drag.current = null
        }}
        onPointerCancel={() => {
          drag.current = null
        }}
        onClick={(e) => {
          /* The ground closes it; the picture does not. A drag that ended on
             the ground is not a click on it. */
          if (e.target === e.currentTarget) setShot(null)
        }}
      >
        {/* Read off the page, so the source is whatever the record is already
            showing — next/image has nothing to add to a file it has not seen
            at build time. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={shown}
          className="lightbox-shot"
          src={shot.src}
          alt={shot.alt}
          draggable={false}
          style={{ transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.s})` }}
          onDoubleClick={() => setView((v) => hold(v.s > 1 ? REST : { s: 2.5, x: 0, y: 0 }))}
        />
      </div>

      <p className="lightbox-hint">
        {view.s > 1 ? `${Math.round(view.s * 100)}% · drag to move` : 'Scroll to zoom'} · Esc to close
      </p>
    </div>,
    document.body,
  )
}
