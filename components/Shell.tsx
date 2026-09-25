'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NameMark } from '@/components/NameMark'
import { Veil } from '@/components/Veil'

/**
 * The site's chrome, which is one thing: the mark at the top of the window.
 *
 * It is fixed there for the whole visit — the one constant, and the way home —
 * and the page scrolls up into a fade behind it. The fade is not there at
 * rest: at the top of a page nothing has gone under the mark yet, and a
 * gradient over the first screen would only dim what is on it.
 *
 * The arrival is a plain one. The mark and the page come up once, on load, in
 * CSS and in half a second — see .mark and .page in globals.css. There was a
 * held opening here: the name alone in the middle of the screen with SCROLL
 * under it, waiting two seconds or for the first touch of the wheel before
 * travelling up into its slot. It worked, and it was two seconds between the
 * reader and the work every single time.
 */
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const home = pathname === '/'

  const [scrolled, setScrolled] = useState(false)
  const [pointer, setPointer] = useState(false)

  const mark = useRef<HTMLAnchorElement>(null)
  const page = useRef<HTMLDivElement>(null)
  const lift = useRef<HTMLSpanElement>(null)

  /* Whether there is a pointer to read the mark with. Starts false so the
     server render and a touch device agree. */
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const sync = () => setPointer(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  /**
   * Where the mark stands, published for the page to line up against.
   *
   * The name is centred in the window and the reading column starts on its
   * left edge, so the first thing read and the thing that names the site begin
   * on the same line. That edge cannot be written in CSS: it depends on how
   * wide six letters are in that face at that size. So it is measured, and
   * what is published is the distance from the page's own left edge to it —
   * the width of the margin column, ready to be used as one.
   *
   * The blocks change width as the letters resolve, hence the observer; the
   * page's box is watched too, which is the resize handler.
   */
  useEffect(() => {
    const el = mark.current
    const box = page.current
    if (!el || !box) return

    const publish = () => {
      const m = el.getBoundingClientRect()
      const p = box.getBoundingClientRect()
      const pad = parseFloat(getComputedStyle(box).paddingLeft) || 0
      const css = document.documentElement.style
      css.setProperty('--mark-w', `${Math.round(m.width)}px`)
      css.setProperty('--mark-col', `${Math.max(0, Math.round(m.left - p.left - pad))}px`)
    }

    publish()
    const ro = new ResizeObserver(publish)
    ro.observe(el)
    ro.observe(box)
    return () => ro.disconnect()
  }, [])

  /**
   * The mark rides up to its line, and the page notices when it gets there.
   *
   * On the front page everything starts --drop lower than it ends up, the name
   * with it. As you scroll, the name travels up at exactly the speed of the
   * page until it reaches the line it keeps for the rest of the visit, and
   * then it stops — the ordinary behaviour of something in the flow that
   * becomes sticky, except the name was never in the flow: it is fixed, and
   * what moves it is this. Elsewhere the drop is nil and it is simply fixed
   * from the start.
   *
   * The offset is written straight to the element rather than held in state.
   * A scroll handler that re-renders React on every frame to move one span is
   * a lot of machinery for a number that only a transform reads.
   */
  useEffect(() => {
    let drop = 0

    const measure = () => {
      if (!home) {
        drop = 0
        return
      }
      const v = getComputedStyle(document.documentElement).getPropertyValue('--drop')
      drop = parseFloat(v) || 0
    }

    const read = () => {
      const y = window.scrollY
      lift.current?.style.setProperty('--mark-drop', `${Math.max(0, drop - y)}px`)
      /* The veil waits for the name to land: fading glass in at the top of the
         window while the name is still a hundred pixels below it would be a
         backing for something that is not there yet. */
      setScrolled(y > drop + 4)
    }

    const sized = () => {
      measure()
      read()
    }

    sized()
    window.addEventListener('scroll', read, { passive: true })
    window.addEventListener('resize', sized, { passive: true })
    return () => {
      window.removeEventListener('scroll', read)
      window.removeEventListener('resize', sized)
    }
  }, [pathname, home])

  return (
    <div className="shell" data-scrolled={scrolled} data-home={home}>
      <div className="site-mark-slot">
        {/* What the page goes under on its way up to the mark: four panes of
            glass, and a shader for the colour on them. It only runs while it
            is on screen, which is what the flag is for. */}
        <Veil active={scrolled} />

        {/* What carries the name down and back up. It is its own element
            because the name already animates its own arrival with a transform,
            and two transforms on one element are one transform. */}
        <span ref={lift} className="site-mark-lift">
          <Link
            ref={mark}
            href="/"
            className="site-mark"
            aria-label="Anshul Suthar, home"
            onClick={(e) => {
              /* Already home: the top of it, rather than a navigation that
                 changes nothing anybody can see. */
              if (!home) return
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            <NameMark as="span" interactive={pointer} />
          </Link>
        </span>
      </div>

      <div ref={page} className="site-page">
        {children}
      </div>
    </div>
  )
}
