'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMotionValue, useSpring } from 'framer-motion'
import { CrtScreen } from '@/components/CrtScreen'

/**
 * The product, passing through the page.
 *
 * Act 01 opens on "Give someone recognition." and spends five thousand pixels
 * arguing its way to "Each of these questions became a screen." This is the
 * survey it owes you in between: seven surfaces, on tubes, drifting.
 *
 * ── Why it is not rendered where it is mounted ─────────────────────────
 *
 * The strip runs the full width of the window, and the record cannot do that.
 * Its sections are `width: 1440px; overflow: hidden` — the clip is the
 * export's own and every other figure in the record depends on it — so
 * anything wider than the column is simply cut off at the section's edge.
 *
 * So the mount inside the record does one job: it holds the vertical space, so
 * the headline above and the lede below sit where they should. The band itself
 * is rendered into `.case-story`, outside the clip and outside the record's
 * zoom, and pinned back to the mount's position every time the layout settles.
 * That also puts it beneath the index, which is sticky and sits a layer above.
 *
 * Being outside the zoom means the tiles are sized in screen pixels rather than
 * the record's 1440 space, so everything scaled by --k below is a design
 * measurement converted at the door.
 *
 * ── Why the tiles are not duplicated ───────────────────────────────────
 *
 * The obvious way to loop a strip is to render the set twice and translate by
 * one set width. Every tile here is a CrtScreen, and every CrtScreen is a
 * WebGL context — a browser gives you about sixteen and silently drops the
 * oldest past that. Fourteen plus the veil's would be most of that budget for
 * one band of one act. So the set is rendered once and each tile placed by its
 * own modulus: endless in both directions, seven contexts.
 *
 * The wrap is into [-step, total - step) rather than [0, total). Wrapped into
 * [0, total) a tile leaving the left edge would vanish the instant its x went
 * negative instead of sliding out, and you would see it pop.
 *
 * ── Why it has weight ──────────────────────────────────────────────────
 *
 * Scroll does not drive the row, it drives a target; a spring follows the
 * target and the row follows the spring. That is the momentum — it keeps going
 * for a moment after you stop, and never starts or stops on a frame boundary.
 * Locked straight to scroll it read as brittle no matter how low the rate,
 * because the eye reads the derivative.
 *
 * And it never stops: left alone it carries on the way your last scroll sent
 * it, a little faster than it was going under your finger.
 */

type Surface = { src: string; alt: string }

/**
 * Seven, and every one no wider than the tile's own 3:2.
 *
 * That constraint is the whole of the crop rule: the picture is laid in at the
 * full width of its frame with its top on the frame's top, so anything taller
 * runs past the bottom and is cut there. A source *wider* than the frame would
 * come up short and leave a band of nothing under it, which is why the
 * Leaderboards capture at 1.74 is not here.
 */
const SURFACES: Surface[] = [
  { src: '/images/incentiwise/story/020.webp', alt: 'Available rewards, and what each costs' },
  { src: '/images/incentiwise/story/064.webp', alt: 'Culture: budgets and disbursals by department' },
  { src: '/images/incentiwise/story/019.webp', alt: 'The appreciation feed' },
  { src: '/images/incentiwise/story/043.webp', alt: 'Requesting an additional allowance' },
  { src: '/images/incentiwise/story/063.webp', alt: 'Budget allocation across the organisation' },
  { src: '/images/incentiwise/story/049.webp', alt: 'Declining a request, with a reason' },
  { src: '/images/incentiwise/story/016.webp', alt: 'Sending an appreciation with a reward attached' },
]

/** Design px, in the record's 1440 space; converted at the door by --k. */
const TILE_W = 840
const TILE_H = 560
const GAP = 56
const STEP = TILE_W + GAP

/** Design px of travel per px of scroll. */
const RATE = 1.15
/** Design px per second when nobody is touching it — a shade quicker than the
 *  hand that let go of it, so leaving it alone is not the same as stopping. */
const DRIFT = 46
/** How far a flick carries past the finger, in seconds of its own velocity. */
const THROW = 0.18
/** Design px the fade stands proud of the strip, top and bottom, so its own
 *  edges fall on empty page instead of across the pictures. Comfortably more
 *  than the widest blur, comfortably less than the gap to the headline — and
 *  in the record's own units, so it keeps that clearance as the record scales.
 *  Fixed screen pixels would creep onto the headline on a narrow window. */
const PAD = 80

const mod = (n: number, m: number) => ((n % m) + m) % m

export function IncentiwiseStrip() {
  const [mount, setMount] = useState<HTMLElement | null>(null)
  const [stage, setStage] = useState<HTMLElement | null>(null)
  const band = useRef<HTMLDivElement>(null)
  const fade = useRef<HTMLDivElement>(null)
  const tiles = useRef<(HTMLDivElement | null)[]>([])
  const scale = useRef(1)

  const target = useMotionValue(0)
  /* Soft and heavy. Stiffer than this and the spring stops being the point. */
  const eased = useSpring(target, { stiffness: 42, damping: 22, mass: 1.1 })

  useEffect(() => {
    setMount(document.getElementById('iw-strip'))
    setStage(document.querySelector<HTMLElement>('.case-story'))
  }, [])

  /* ── paint ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    const paint = (offset: number) => {
      const k = scale.current
      const step = STEP * k
      const total = SURFACES.length * step
      tiles.current.forEach((el, i) => {
        if (!el) return
        const x = mod(i * step + offset + step, total) - step
        el.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`
      })
    }
    paint(eased.get())
    return eased.on('change', paint)
  }, [eased, mount, stage])

  /* ── place, drive ────────────────────────────────────────────────────── */
  useEffect(() => {
    const el = band.current
    if (!el || !mount || !stage) return

    const still = window.matchMedia('(prefers-reduced-motion: reduce)')
    let to = 0
    let last = window.scrollY
    /** Which way the last scroll sent it. Down, until told otherwise. */
    let way = -1
    let clock = 0
    let raf = 0
    let seen = false

    /**
     * Pin the band back over its mount, full width of the window.
     *
     * Everything here is screen pixels: the band lives outside the record's
     * zoom, so the record's own scale has to be read and applied by hand.
     */
    const place = () => {
      const story = document.querySelector<HTMLElement>('.story')
      const k = story ? parseFloat(getComputedStyle(story).zoom) || 1 : 1
      scale.current = k

      /* How far across the window the index reaches — the band needs it too,
         to know where to stop feathering its own edges. */
      const idx = document.querySelector('.case-index')
      const reach = idx ? idx.getBoundingClientRect().right : 0

      const m = mount.getBoundingClientRect()
      const s = stage.getBoundingClientRect()

      el.style.top = `${m.top - s.top}px`
      el.style.left = `${-s.left}px`
      el.style.width = `${window.innerWidth}px`
      el.style.height = `${TILE_H * k}px`
      el.style.setProperty('--k', String(k))
      el.style.setProperty('--fade', `${Math.round(reach)}px`)

      /* How far across the window the index reaches. The band starts at the
         window's left edge, so the index's right edge in viewport pixels is
         already the distance in band coordinates. Published so the fade knows
         exactly how much to cover; measured rather than assumed, because the
         index column is a grid fraction and moves with the window. */


      /* The fade stands taller than the strip and outside it. Its top and
         bottom edges are hard — a blurred box has the box's edges — so they
         are pushed into the gaps above and below, where there is nothing but
         page behind them and a blurred background is the same background.
         Enough to clear the widest blur several times over, and well short of
         the headline above and the lede below. */
      if (fade.current) {
        const f = fade.current
        f.style.top = `${m.top - s.top - PAD * k}px`
        f.style.left = `${-s.left}px`
        f.style.width = `${window.innerWidth}px`
        f.style.height = `${(TILE_H + PAD * 2) * k}px`
        f.style.setProperty('--fade', `${Math.round(reach)}px`)
        f.style.setProperty('--k', String(k))
      }
    }

    const onScroll = () => {
      const y = window.scrollY
      const dy = y - last
      last = y
      if (!seen || !dy) return
      way = dy > 0 ? -1 : 1
      to -= dy * RATE * scale.current
      target.set(to)
    }

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = clock ? Math.min(0.05, (now - clock) / 1000) : 0
      clock = now
      /* A hand on it overrides the drift; nothing should be pulling against
         the finger. */
      if (!still.matches && !drag) {
        to += way * DRIFT * scale.current * dt
        target.set(to)
      }
    }

    /* ── dragging ────────────────────────────────────────────────────────
       One set of handlers for both, because pointer events do not care
       whether the thing on the glass is a mouse or a thumb.

       The spring is bypassed while the finger is down — jump() sets the value
       without animating — so the strip sits exactly under the point you
       grabbed rather than trailing it. Let go and the spring comes back, aimed
       a little past where you stopped, so a flick carries. */
    let drag: { id: number; x: number; from: number } | null = null
    let vel = 0
    let lastMove = 0

    const onDown = (e: PointerEvent) => {
      drag = { id: e.pointerId, x: e.clientX, from: to }
      vel = 0
      lastMove = e.timeStamp
      el.dataset.dragging = 'true'
      /* Capture is a nicety — it keeps the drag alive when the pointer leaves
         the band — and it throws if the id is not an active pointer. Nothing
         below it should be lost to that. */
      try {
        el.setPointerCapture(e.pointerId)
      } catch {}
    }

    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      const next = drag.from + (e.clientX - drag.x)
      const dt = Math.max(1, e.timeStamp - lastMove)
      /* Smoothed, so one stuttery frame at the end does not decide the throw. */
      vel = vel * 0.7 + ((next - to) / dt) * 1000 * 0.3
      lastMove = e.timeStamp
      to = next
      target.set(to)
      eased.jump(to)
    }

    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      drag = null
      delete el.dataset.dragging
      if (Math.abs(vel) > 40) {
        way = vel > 0 ? 1 : -1
        to += vel * THROW
        target.set(to)
      }
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)

    /* Only while it is on screen. A spring and a drift running the length of a
       57,000px record would be a tax on every other act. */
    const io = new IntersectionObserver(
      ([e]) => {
        seen = e.isIntersecting
        if (seen && !raf) {
          clock = 0
          last = window.scrollY
          raf = requestAnimationFrame(tick)
        } else if (!seen && raf) {
          cancelAnimationFrame(raf)
          raf = 0
        }
      },
      { rootMargin: '200px 0px' },
    )
    io.observe(mount)

    place()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', place, { passive: true })
    /* The mount moves as the record's pictures arrive above it. */
    const ro = new ResizeObserver(place)
    ro.observe(document.body)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', place)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
    }
  }, [mount, stage, target, eased])

  if (!mount || !stage) return null

  return createPortal(
    <>
      <div ref={band} className="iw-strip-band">
      {SURFACES.map((s, i) => (
        <div
          key={s.src}
          ref={(el) => {
            tiles.current[i] = el
          }}
          className="iw-strip-tile"
        >
          {/* A tube, but a quiet one. The grille is what eats thin rules and
              8px labels, so it comes down to a fifth of the thumbnails' and
              the scanlines go finer than the detail rather than across it.
              The curvature, the bloom and the flicker — life={1} — are what
              carry the CRT, and none of them cost legibility.

              warp is nil, and the CSS displacement and bulge clip come off in
              globals.css. Barrel distortion magnifies about the centre and
              cuts every edge — including the top, which these frames are not
              allowed to lose. A tube shape costs the first row of every app. */}
          <CrtScreen
            src={s.src}
            alt={s.alt}
            life={1}
            focusY={0}
            glow={false}
            lines={320}
            mask={0.18}
            warp={0}
            shift={0.6}
            bloomAmount={0.12}
          />
        </div>
      ))}
      </div>

      {/* What the index stands on, and a sibling of the band rather than a
          child of it.
          ────────────────────────────────────────────────────────────────
          The band clips — it has to, that is what keeps the tiles inside it —
          and anything blurring inside a clip has the clip's own edges. That is
          the straight line across the top and bottom: not the blur failing,
          the box ending. Out here it can be taller than the strip, so its
          horizontal edges land in the gaps above and below, over nothing but
          page. A blurred background is the same background, so those edges
          have nothing to draw. */}
      <div ref={fade} className="iw-strip-fade" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
    </>,
    stage,
  )
}
