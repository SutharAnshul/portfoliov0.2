'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SoundControl } from '@/components/SoundControl'
import { CornerMarks } from '@/components/CornerMarks'
import {
  CatMark,
} from '@/components/Icons'
import { PixelIcon } from '@/components/PixelIcon'
import { NameMark } from '@/components/NameMark'

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
 *   bottom  where. A fixed rail in the thumb zone carrying the same three
 *           mechanisms as desktop and the same corner-mark selection, plus
 *           Mr. Toast on the end.
 *
 * Nothing here is a new idea — it is the same information architecture with
 * the reach corrected. A tab strip at the top of a phone is the one thing a
 * thumb cannot comfortably hit, which is why that is what this replaces.
 */

/** Withheld from the rail, same as on desktop — see the note in SideNav. */
const NAV = [
  { href: '/', title: 'About', icon: 'about' },
  { href: '/work', title: 'Work', icon: 'work' },
  { href: '/garage', title: 'Garage', icon: 'garage', hidden: true },
] as const

const CONTACT = [
  { href: 'mailto:s.anshul@iitg.ac.in', label: 'Email', icon: 'mail' },
  { href: 'tel:+916376542708', label: 'Phone', icon: 'phone' },
  { href: 'https://linkedin.com/in/sutharanshul', label: 'LinkedIn', icon: 'linkedin' },
  { href: 'https://behance.net/anshulsuthar', label: 'Behance', icon: 'behance' },
] as const

export function MobileChrome({ onOpenChat }: { onOpenChat?: () => void }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const mastheadRef = useRef<HTMLElement>(null)
  const railRef = useRef<HTMLElement>(null)

  /**
   * Publish the real height of both bars.
   *
   * These were hardcoded, and the numbers were guesses that held only on the
   * viewport they were written against. On a phone with a safe-area inset the
   * masthead is taller than the guess, so the first line of every page tucked
   * up underneath it. Measured, they cannot drift — and ResizeObserver catches
   * rotation, dynamic type, and the address bar collapsing.
   */
  useEffect(() => {
    const bars = [
      [mastheadRef.current, '--masthead-h'],
      [railRef.current, '--rail-h'],
    ] as const

    const measure = () => {
      for (const [el, prop] of bars) {
        if (el) document.documentElement.style.setProperty(prop, `${Math.ceil(el.getBoundingClientRect().height)}px`)
      }

    }

    measure()
    const ro = new ResizeObserver(measure)
    for (const [el] of bars) if (el) ro.observe(el)
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
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-scroll-root]')
    if (!root) return

    let frame = 0
    const write = () => {
      frame = 0
      const range = Math.max(1, root.clientHeight * 0.45)
      const p = Math.min(1, Math.max(0, root.scrollTop / range))
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
      document.documentElement.dataset.reveal = p >= 1 ? 'done' : 'live'
      // Only the things that cannot be a fraction — what is pressable, and
      // what is still in the layer tree. React drops the identical boolean, so
      // this is not a render on every frame.
      setSettled(p >= 1)
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
    const onGrab = () => {
      clearTimeout(idle)
      snapping = false
    }

    write()
    root.addEventListener('scroll', onScroll, { passive: true })
    root.addEventListener('pointerdown', onGrab, { passive: true })
    root.addEventListener('touchstart', onGrab, { passive: true })
    return () => {
      root.removeEventListener('scroll', onScroll)
      root.removeEventListener('pointerdown', onGrab)
      root.removeEventListener('touchstart', onGrab)
      clearTimeout(idle)
      if (frame) cancelAnimationFrame(frame)
      for (const p of ['--reveal', '--follow', '--reveal-range']) {
        document.documentElement.style.removeProperty(p)
      }
      delete document.documentElement.dataset.reveal
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
        <span className="m-mark">
          <NameMark as="span" interactive={false} />
        </span>

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

          <div className="contact-row">
            {CONTACT.map(({ href, label, icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                data-sfx="tick"
                className="contact-chip"
                aria-label={label}
              >
                <PixelIcon name={icon} size={26} />
              </a>
            ))}
          </div>

          <div style={{ marginTop: 'var(--s5)' }}>
            <SoundControl />
          </div>
        </div>
      </div>

      {/* Tapping the page closes the card, rather than trapping you in it. */}
      {open && (
        <button className="m-scrim" aria-label="Close" onClick={() => setOpen(false)} />
      )}

      {/* ── Where ───────────────────────────────────────────────────── */}
      <nav ref={railRef} className="m-rail" data-settled={settled} aria-label="Sections">
        {NAV.filter((n) => !('hidden' in n && n.hidden)).map(({ href, title, icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              data-sfx="tick"
              data-active={active}
              className="m-rail-item"
              aria-current={active ? 'page' : undefined}
            >
              <CornerMarks />
              <PixelIcon name={icon} size={26} />
              <span className="t-label">{title}</span>
            </Link>
          )
        })}

        {/* Only when there is something to open. */}
        {onOpenChat && (
        <button onClick={onOpenChat} data-sfx="tick" className="m-rail-item m-rail-cat" aria-label="Ask Mr. Toast">
          <CatMark size={26} />
          <span className="t-label">Toast</span>
        </button>
        )}
      </nav>
    </>
  )
}
