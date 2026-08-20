'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SoundControl } from '@/components/SoundControl'
import { CornerMarks } from '@/components/CornerMarks'
import {
  IconAperture,
  IconSheet,
  IconBolt,
  IconMail,
  IconPhone,
  IconLinkedIn,
  IconBehance,
  CatMark,
} from '@/components/Icons'

/**
 * The site's chrome on a phone.
 *
 * The desktop left rail carries two different things at once — who he is, and
 * where you can go — which works when there is a whole column for it. On a
 * phone they split by hand position rather than by hierarchy:
 *
 *   top     who. A slim masthead that pulls down into the studio card: the
 *           role line, the CV, contacts, theme, and the transport. Everything
 *           the sidebar held, reached by tapping his name.
 *   bottom  where. A fixed rail in the thumb zone carrying the same three
 *           mechanisms as desktop and the same corner-mark selection, plus
 *           Mr. Toast on the end.
 *
 * Nothing here is a new idea — it is the same information architecture with
 * the reach corrected. A tab strip at the top of a phone is the one thing a
 * thumb cannot comfortably hit, which is why that is what this replaces.
 */

const NAV = [
  { href: '/', title: 'About', Icon: IconAperture },
  { href: '/work', title: 'Work', Icon: IconSheet },
  { href: '/garage', title: 'Garage', Icon: IconBolt },
] as const

const CONTACT = [
  { href: 'mailto:s.anshul@iitg.ac.in', label: 'Email', Icon: IconMail, tint: '#D9603C' },
  { href: 'tel:+916376542708', label: 'Phone', Icon: IconPhone, tint: '#4FA871' },
  { href: 'https://linkedin.com/in/sutharanshul', label: 'LinkedIn', Icon: IconLinkedIn, tint: '#3B8BD8' },
  { href: 'https://behance.net/anshulsuthar', label: 'Behance', Icon: IconBehance, tint: '#6C7BFF' },
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

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(path + '/')

  // The studio card is a navigation surface; leaving the page should close it.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      {/* ── Who ─────────────────────────────────────────────────────── */}
      <header ref={mastheadRef} className="m-masthead">
        <button
          onClick={() => setOpen((v) => !v)}
          data-sfx="tick"
          className="m-name"
          aria-expanded={open}
          aria-controls="studio-card"
        >
          <span className="t-name">Anshul Suthar</span>
          <span className="m-chev" data-open={open} aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </button>
        <ThemeToggle />
      </header>

      <div id="studio-card" className="m-studio" data-open={open}>
        <div className="m-studio-inner">
          <p className="t-body" style={{ opacity: 0.8 }}>
            Product designer based in India. Design as solving real problems, and building systems
            that scale.
          </p>

          <a
            href="/Anshul_Suthar_CV.pdf"
            target="_blank"
            rel="noopener noreferrer"
            data-sfx="tick"
            className="link-quiet"
            style={{ marginTop: 'var(--s4)' }}
          >
            Curriculum vitae ↗
          </a>

          <div className="contact-row">
            {CONTACT.map(({ href, label, Icon, tint }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                data-sfx="tick"
                className="contact-chip"
                style={{ color: tint }}
                aria-label={label}
              >
                <Icon size={20} />
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
      <nav ref={railRef} className="m-rail" aria-label="Sections">
        {NAV.map(({ href, title, Icon }) => {
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
              <Icon size={19} />
              <span className="t-label">{title}</span>
            </Link>
          )
        })}

        <button onClick={onOpenChat} data-sfx="tick" className="m-rail-item m-rail-cat" aria-label="Ask Mr. Toast">
          <CatMark size={26} />
          <span className="t-label">Toast</span>
        </button>
      </nav>
    </>
  )
}
