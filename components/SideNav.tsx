'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { setNavOrigin, useNavOrigin } from '@/lib/nav-origin'
import { caseStudies } from '@/lib/case-studies'
import { NameMark } from '@/components/NameMark'
import { PixelIcon } from '@/components/PixelIcon'
import { studyIcon } from '@/lib/pixel-icons'
import { SoundControl } from '@/components/SoundControl'
import { CornerMarks } from '@/components/CornerMarks'

/**
 * Selection is marked by four corner crosses, not by border weight — against a
 * monochrome card a heavier line is too quiet to read as "you are here".
 *
 * Each nav item carries a working mechanism rather than a glyph: the aperture
 * stops down at rest and opens as you arrive, the contact sheet draws its
 * chinagraph select on, and the bolt turns one hex flat. A hairline sweeps the
 * plate on the way in, like a loupe passing over.
 */

interface SideNavProps {
  width?: number
}

/**
 * `hidden` keeps a destination in the source without offering it. The Garage
 * route still exists and still renders — it is only withheld from the nav
 * until there is something in it worth walking to. Flip the flag to bring it
 * back; nothing else has to change.
 */
const NAV = [
  { href: '/', title: 'About', note: "Let's get to know each other", icon: 'about' },
  { href: '/work', title: 'Work', note: 'A selection of recent work', icon: 'work' },
  { href: '/garage', title: 'My Garage', note: 'Things I tinker with', icon: 'garage', hidden: true },
] as const

/** Contact lives with the CV: both are ways to reach him, not page content. */
const CONTACT = [
  { href: 'mailto:s.anshul@iitg.ac.in', label: 'Email', icon: 'mail' },
  { href: 'tel:+916376542708', label: 'Phone', icon: 'phone' },
  { href: 'https://linkedin.com/in/sutharanshul', label: 'LinkedIn', icon: 'linkedin' },
  { href: 'https://behance.net/anshulsuthar', label: 'Behance', icon: 'behance' },
] as const

export function SideNav({ width }: SideNavProps) {
  const pathname = usePathname()

  /**
   * Which ends of the case-study list have something past them.
   *
   * Measured on scroll and on resize, and re-measured when the browser tells
   * us the box changed — a fade that is always on would claim there is more
   * to see at an end that has nothing past it, and the point of the fade is
   * that it is a truthful signal about the list's extent.
   */
  const studiesRef = useRef<HTMLDivElement>(null)
  const [over, setOver] = useState({ top: false, bottom: false })

  useEffect(() => {
    const el = studiesRef.current
    if (!el) return

    const check = () => {
      /* A pixel of slack at each end. Sub-pixel layout and fractional device
         ratios routinely leave scrollTop at 0.4 or the remainder at 0.6, and
         without the tolerance the fade flickers on at rest. */
      const top = el.scrollTop > 1
      const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 1
      setOver((cur) => (cur.top === top && cur.bottom === bottom ? cur : { top, bottom }))
    }

    check()
    el.addEventListener('scroll', check, { passive: true })
    const ro = new ResizeObserver(check)
    ro.observe(el)
    /* The list's own content can change height without the box doing so — the
       rail is resizable, and a card can rewrap from two lines to one. */
    for (const kid of Array.from(el.children)) ro.observe(kid)

    return () => {
      el.removeEventListener('scroll', check)
      ro.disconnect()
    }
  }, [])
  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(path + '/')

  /**
   * On a case study, exactly one thing is lit, and which one depends on the
   * door the reader came through. Arriving from the Work index they are still
   * in Work; picking the project from this list means the project is where
   * they are. Lighting both, which is what the plain route test does, answers
   * a question nobody asked.
   */
  const origin = useNavOrigin()
  const viaWork = pathname.startsWith('/work/') && origin === 'work'

  return (
    <aside
      style={width ? { width } : undefined}
      data-lenis-prevent
      className="nav-shell fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar text-sidebar-foreground"
    >
      {/* Everything above the case studies is fixed. It is a known, finite
          amount of chrome — a name, a line about him, a CV link, four contacts
          and two sections — and none of it grows. */}
      <div className="nav-fixed">
        {/* Identity */}
        <NameMark />
        <p className="t-body bio" style={{ marginTop: 'var(--s3)' }}>
          {/* Non-breaking: the column is narrow enough that "how things" and
              "work" land on different lines, and the gap between them reads as
              a stray space rather than as a wrap. */}
          Product designer based in India. I like figuring out how things&nbsp;work, then making
          them better.
        </p>

        {/* CV — a quiet aside in the same voice as the card headings, not a
            control competing with the nav below it. */}
        <a
          href="/Anshul_Suthar_CV.pdf"
          target="_blank"
          rel="noopener noreferrer"
          data-sfx="tick"
          className="link-quiet"
          style={{ marginTop: 'var(--s3)' }}
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
              title={label}
            >
              <PixelIcon name={icon} size={26} />
            </a>
          ))}
        </div>

        {/* Sections */}
        <nav className="stack" style={{ marginTop: 'var(--s6)' }} aria-label="Sections">
          {NAV.filter((item) => !('hidden' in item && item.hidden)).map((item) => {
            const active = item.href === '/work' ? pathname === '/work' || viaWork : isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                data-sfx="tick"
                data-active={active}
                className="nav-item"
                aria-current={active ? 'page' : undefined}
              >
                <CornerMarks />
                <span className="nav-plate">
                  <PixelIcon name={item.icon} size={26} />
                </span>
                <span className="min-w-0" style={{ display: 'grid', gap: 2 }}>
                  <span className="t-title">{item.title}</span>
                  <span className="t-meta truncate">{item.note}</span>
                </span>
              </Link>
            )
          })}
        </nav>

        {/* The heading belongs to the fixed block: it labels the list, so it
            should still be there when the list has been scrolled. */}
        <div style={{ marginTop: 'var(--s6)' }}>
          <span className="t-label">Selected case studies</span>
        </div>
      </div>

      {/* The one part that can grow, and so the one part that scrolls. The
          two data attributes drive the fades at its ends — see the effect
          above for why they are measured rather than always on. */}
      <div
        ref={studiesRef}
        className="nav-studies"
        data-over-top={over.top}
        data-over-bottom={over.bottom}
      >
        <div className="stack">
            {caseStudies.map((study, i) => {
              const active = pathname === `/work/${study.slug}` && !viaWork
              return (
                <Link
                  key={study.slug}
                  href={`/work/${study.slug}`}
                  onClick={() => setNavOrigin('nav')}
                  data-sfx="tick"
                  data-active={active}
                  className="card-link study-link relative"
                  aria-current={active ? 'page' : undefined}
                >
                  <CornerMarks />
                  {/* The index as the study's own mark: its own colour, drawn
                      rather than set. The accessible name is the title beside
                      it, so the number is decoration and says so. */}
                  <span className="study-no" aria-hidden="true">
                    <PixelIcon name={studyIcon(i + 1)} size={26} />
                  </span>
                  <span className="min-w-0" style={{ display: 'grid', gap: 2 }}>
                    <span className="t-title">{study.title}</span>
                    <span className="t-meta truncate">{study.category}</span>
                  </span>
                </Link>
              )
            })}
        </div>
      </div>

      <div className="nav-foot">
        <SoundControl />
      </div>
    </aside>
  )
}
