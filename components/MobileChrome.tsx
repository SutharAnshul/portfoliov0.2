'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SoundControl } from '@/components/SoundControl'
import { NameMark } from '@/components/NameMark'
import { ContactRow } from '@/components/ContactRow'

/**
 * The site's chrome on a phone.
 *
 * The desktop left rail carries two different things at once — who he is, and
 * where you can go — which works when there is a whole column for it. On a
 * phone they split by hand position rather than by hierarchy:
 *
 *   top     who. The mark, and a menu button holding everything else the
 *           sidebar carried — the role line, the CV, the contacts and the
 *           transport.
 *
 *           The mark opens the page centred and large and shrinks into the bar
 *           once the page moves, because at the top of a page it is not chrome
 *           yet: nothing has been read, so there is nothing for it to keep out
 *           of the way of. It used to be the menu's own button, which meant the
 *           one thing on the page with his name on it could not be looked at
 *           without also being a control.
 * There is no bottom rail any more. It held two destinations, and the work
 * index now runs on under the About page in the same scroll — so its two
 * buttons had become a control for moving between two halves of one document,
 * bought with 74 fixed pixels of every screen. The scroll does that job, and
 * the breadcrumb is what gets you back out of a case study.
 *
 * Which leaves the phone with one piece of chrome instead of two, and the
 * whole lower half of the screen given back to the page.
 */

/**
 * Whether the opening has already played in this page load.
 *
 * Module scope on purpose — see the note on the latch below. It resets when
 * the script is evaluated again, which is exactly on a reload and at no other
 * time, and that is the rule: the mark comes back to the centre of the screen
 * for someone arriving at the site, and for nobody else.
 */
let introDone = false

export function MobileChrome({ onOpenChat }: { onOpenChat?: () => void }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const mastheadRef = useRef<HTMLElement>(null)

  /**
   * Publish the masthead's real height.
   *
   * It was hardcoded, and the number was a guess that held only on the
   * viewport it was written against. On a phone with a safe-area inset the
   * masthead is taller than the guess, so the first line of every page tucked
   * up underneath it. Measured, it cannot drift — and ResizeObserver catches
   * rotation, dynamic type, and the address bar collapsing.
   *
   * One bar now, not two. The rail that used to be measured alongside it is
   * gone, and so is the padding the page held open for it.
   */
  useEffect(() => {
    const el = mastheadRef.current
    if (!el) return

    const measure = () => {
      document.documentElement.style.setProperty(
        '--masthead-h',
        `${Math.ceil(el.getBoundingClientRect().height)}px`,
      )
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('orientationchange', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('orientationchange', measure)
    }
  }, [])

  /**
   * How far through the opening we are, 0 to 1.
   *
   * At the top of a page the mark is the page's opening: centred, large, with
   * the site behind a sheet. It is not chrome yet — nothing has been read, so
   * there is nothing for it to sit out of the way of. Scrolling turns it into
   * chrome, and everything else arrives with it.
   *
   * This was a threshold with a CSS transition behind it, and that is why it
   * read as instantaneous: crossing 20px fired the whole thing on a timer, so
   * the reveal happened near the gesture rather than because of it. Published
   * as a fraction instead, every part of the opening is a direct function of
   * where the finger is. Drag halfway and it sits halfway.
   *
   * The range is 45% of a screenful, taken from the scroller rather than from
   * the viewport so it is the height the reader actually has.
   *
   * On [data-scroll-root] and not the window: on a phone this layout scrolls
   * inside its own element, so window scroll never fires at all.
   */
  const [settled, setSettled] = useState(introDone)

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-scroll-root]')
    if (!root) return

    let frame = 0

    /**
     * Pin the opening open, for good.
     *
     * The run-up goes to zero and the scroller comes down by the same amount,
     * in that order and in one go: the spacer is above the page, so taking it
     * away without moving the scroller would slide everything the reader is
     * looking at up by half a screen. Setting scrollTop forces the layout the
     * height change needs, so the two land in the same frame.
     */
    const latch = (range: number) => {
      introDone = true
      const css = document.documentElement.style
      css.setProperty('--reveal', '1')
      css.setProperty('--follow', '1')
      css.setProperty('--reveal-range', '0px')
      document.documentElement.dataset.reveal = 'done'
      root.scrollTop = Math.max(0, root.scrollTop - range)
      setSettled(true)
    }

    const write = () => {
      frame = 0
      /* Nothing left to compute once it is over — and nothing that should be,
         since every value here is a function of a scroll position that no
         longer means anything. */
      if (introDone) return
      const range = Math.max(1, root.clientHeight * 0.45)
      /* A pixel of tolerance, and it is load bearing. scrollTop is an integer
         in every engine that matters while the range is a fraction of a
         height — scrolling exactly to the end of the run-up lands on 365
         against a range of 365.4, so a strict p >= 1 never became true and the
         opening never formally finished. That left the lifting transform on
         permanently, and a transformed ancestor is a containing block for
         everything fixed inside it. */
      const done = root.scrollTop >= range - 1
      const p = done ? 1 : Math.min(1, Math.max(0, root.scrollTop / range))
      const css = document.documentElement.style
      css.setProperty('--reveal', String(p))
      /**
       * The page follows rather than leads.
       *
       * It has further to travel than the mark does — a screen, against the
       * mark's half-screen — so on the same fraction it would move at twice
       * the speed and arrive looking thrown. Squared, it barely moves while
       * the mark is setting off and gathers as the mark arrives, which reads
       * as the page coming up behind it.
       */
      css.setProperty('--follow', String(p * p))
      css.setProperty('--reveal-range', `${Math.round(range)}px`)
      /* The transform that lifts the page has to come off entirely once the
         opening is over: a transformed ancestor is a containing block for
         anything fixed inside it, and translateY(0) is still a transform.
         Leaving it on would quietly break position: fixed for every page. */
      document.documentElement.dataset.reveal = done ? 'done' : 'live'
      // Only the things that cannot be a fraction — what is pressable, and
      // what is still in the layer tree. React drops the identical boolean, so
      // this is not a render on every frame.
      setSettled(done)
      if (done) latch(range)
    }

    /**
     * The opening commits or it comes back — it is never left half open.
     *
     * A fraction that follows the finger exactly is the right feel during the
     * gesture and the wrong thing to be left with after it: let go at a third
     * and the mark sits in the middle of the paragraph forever, which is a
     * state nobody chose and every subsequent scroll has to be read through.
     *
     * So when the scrolling stops, it goes to whichever end it is nearest —
     * except that "nearest" is not the middle. The commit point is at a fifth,
     * deliberately close to the start, because the two gestures being told
     * apart are "I meant to open this" and "I brushed the screen". Any real
     * flick clears a fifth of the range; a graze does not.
     *
     * It is done by scrolling rather than by animating the fraction, because
     * the fraction is a function of scrollTop — animating it on its own would
     * leave the page's position and the page's appearance disagreeing, and the
     * next touch would jump. Scrolling to the end of the range makes the
     * browser's own smooth scroll drive the same scrub that the finger did.
     */
    const COMMIT = 0.2
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let idle: ReturnType<typeof setTimeout> | undefined
    let snapping = false

    const settle = () => {
      if (introDone) return
      const range = Math.max(1, root.clientHeight * 0.45)
      const y = root.scrollTop
      // Only inside the opening. Past the range the reveal is over and this has
      // no business moving the page the reader is now reading.
      if (y <= 0 || y >= range) return
      snapping = true
      root.scrollTo({ top: y / range > COMMIT ? range : 0, behavior: reduce ? 'auto' : 'smooth' })
      setTimeout(() => {
        snapping = false
      }, 700)
    }

    /**
     * Coalesced to a frame. Scroll fires faster than the screen redraws, and
     * each of these writes a custom property that a full-screen layer and a
     * relaid-out mark both read — doing that twice between two paints is work
     * nobody sees.
     */
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(write)
      if (snapping) return
      clearTimeout(idle)
      // Not scrollend: it is still missing on Safari, which is most of the
      // phones this runs on. A short idle after the last scroll event is the
      // same signal, and momentum keeps firing events until it stops.
      idle = setTimeout(settle, 140)
    }

    /** A hand on the screen outranks a snap in flight. */
    const onGrab = (e: Event) => {
      clearTimeout(idle)
      snapping = false
      mark(e as PointerEvent)
    }

    /* Where and when the finger went down, so a tap can be told from a drag
       that happened to end where it started. */
    let from: { x: number; y: number; t: number } | null = null
    let nudging = false

    const mark = (e: PointerEvent) => {
      from =
        typeof e.clientX === 'number' ? { x: e.clientX, y: e.clientY, t: performance.now() } : null
    }

    const nudge = (e: PointerEvent) => {
      const start = from
      from = null

      /* Only while the opening is still shut. Past the top of the range the
         reader is reading, and a tap there is a tap on the page — and once it
         has latched there is no opening left to demonstrate. */
      if (introDone || root.scrollTop > 0.5 || nudging || !start) return

      /* A tap, not the end of a drag. Ten pixels and half a second is the
         usual line, and it matters here because letting go of a short drag
         lands at scrollTop 0 as often as not. */
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10) return
      if (performance.now() - start.t > 500) return

      /* Nothing that was pressed on purpose. The menu button lives on this
         screen, and its answer is the menu, not a demonstration of scrolling. */
      if ((e.target as Element | null)?.closest('a, button, input, select, textarea, [role="button"]'))
        return

      /* Someone who has asked for less motion has asked not to be shown this. */
      if (reduce) return

      nudging = true
      snapping = true
      const range = Math.max(1, root.clientHeight * 0.45)
      const lift = Math.min(48, range * 0.14)

      root.scrollTo({ top: lift, behavior: 'smooth' })
      /* Long enough for the lift to be seen as a movement and not a flicker,
         short enough that it is plainly a bounce and not the page opening. */
      window.setTimeout(() => {
        root.scrollTo({ top: 0, behavior: 'smooth' })
        window.setTimeout(() => {
          nudging = false
          snapping = false
        }, 460)
      }, 240)
    }

    /* The opening belongs to the front door.
       ──────────────────────────────────────────────────────────────────
       It is the site arriving, so it plays at / and nowhere else. Loading a
       case study directly — a shared link, a reload, a search result — used to
       run it there too, which put the whole record below the fold behind half
       a screen of run-up: you arrived at a named piece of work and were shown
       nothing, and scrolling past the run-up landed you with the title tucked
       under the sticky bar.

       Latching it here rather than skipping the reveal keeps one code path:
       everything downstream already knows what "already over" looks like. */
    if (pathname !== '/') introDone = true

    /* Arriving on a new route with the opening already over: pin it before
       the first paint rather than waiting for a scroll that may never come.
       The properties survived the last route's cleanup for the same reason. */
    if (introDone) {
      const css = document.documentElement.style
      css.setProperty('--reveal', '1')
      css.setProperty('--follow', '1')
      css.setProperty('--reveal-range', '0px')
      document.documentElement.dataset.reveal = 'done'
      /* And it is chrome, not merely drawn where chrome goes.
         ────────────────────────────────────────────────────────────────
         settled starts from whatever introDone held when this component
         first rendered — and on a direct load of any page but the front
         door that was still false, because the line above that sets it is
         in this effect, which runs after. So the opening got pinned open
         and the flag was left behind: the mark sat in the bar looking
         exactly like the way home, with pointer-events switched off by the
         rule that keeps it from swallowing the splash's tap. Tapping his
         name did nothing at all, on every page reached by a link, a reload
         or a share. */
      setSettled(true)
    } else {
      write()
    }

    root.addEventListener('scroll', onScroll, { passive: true })
    root.addEventListener('pointerdown', onGrab, { passive: true })
    root.addEventListener('touchstart', onGrab, { passive: true })
    root.addEventListener('pointerup', nudge as EventListener, { passive: true })
    return () => {
      root.removeEventListener('scroll', onScroll)
      root.removeEventListener('pointerdown', onGrab)
      root.removeEventListener('touchstart', onGrab)
      root.removeEventListener('pointerup', nudge as EventListener)
      clearTimeout(idle)
      if (frame) cancelAnimationFrame(frame)
      /* Left in place once the opening is over. Clearing them would let the
         run-up back for the frame between this route unmounting and the next
         one's effect running, which is a flash of the splash on every
         navigation. */
      if (!introDone) {
        for (const p of ['--reveal', '--follow', '--reveal-range']) {
          document.documentElement.style.removeProperty(p)
        }
        delete document.documentElement.dataset.reveal
      }
    }
  }, [pathname])

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(path + '/')

  // The studio card is a navigation surface; leaving the page should close it.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      {/* ── Who ─────────────────────────────────────────────────────── */}
      <header ref={mastheadRef} className="m-masthead" data-settled={settled}>
        {/* The mark is no longer a control — the menu has its own button now —
            so it goes back to being the thing it is. Not interactive: reading
            the name by moving across the boxes is a pointer idea, and on touch
            the twelve cells would only be twelve things to press by accident. */}
        {/* The way home. It is the one thing on a phone that is always on
            screen and always his name, which is what a masthead is for.

            Not interactive in the desktop sense — reading the name by moving
            across its twelve cells is a pointer idea, and on touch those cells
            would be twelve things to press by accident. The whole mark is one
            target instead.

            It only becomes a link once the opening has settled; see the note
            in globals.css. */}
        <Link href="/" className="m-mark" aria-label="Home">
          <NameMark as="span" interactive={false} settle={500} />
        </Link>

        <button
          onClick={() => setOpen((v) => !v)}
          data-sfx="tick"
          className="m-burger"
          data-open={open}
          aria-expanded={open}
          aria-controls="studio-card"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {/* Two rules that fold into a cross. Two and not three because with
              three the middle one has nowhere to go — it can only be faded
              out, and a part that disappears rather than moves is the seam in
              the movement. With two, every stroke that is there at the start
              is there at the end, and the whole thing is one gesture.

              Drawn as elements rather than swapped for an icon for the same
              reason: two pictures cannot travel between each other. */}
          <i aria-hidden="true" />
          <i aria-hidden="true" />
        </button>

        {/* The one instruction on the splash. Hidden from assistive tech: it
            describes a gesture, and a screen reader is already moving down the
            document by its own means — being told to scroll is noise there. */}
        <span className="m-hint" aria-hidden="true">
          SCROLL
        </span>
      </header>

      <div id="studio-card" className="m-studio" data-open={open}>
        <div className="m-studio-inner">
          <p className="t-body bio" style={{ opacity: 0.8 }}>
            Product designer based in India. I like figuring out how things&nbsp;work, then making
            them better.
          </p>

          <a
            href="/Anshul_Suthar_CV.pdf"
            target="_blank"
            rel="noopener noreferrer"
            data-sfx="tick"
            className="link-quiet"
            style={{ marginTop: 'var(--s4)' }}
          >
            Curriculum vitae →
          </a>

          <ContactRow />

          <div style={{ marginTop: 'var(--s5)' }}>
            <SoundControl />
          </div>
        </div>
      </div>

      {/* Tapping the page closes the card, rather than trapping you in it. */}
      {open && (
        <button className="m-scrim" aria-label="Close" onClick={() => setOpen(false)} />
      )}

    </>
  )
}
