'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { caseStudies } from '@/lib/case-studies'
import { ThemeToggle } from '@/components/ThemeToggle'
import { FieldItem } from '@/components/FieldItem'
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
} from '@/components/Icons'

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
  { href: 'mailto:s.anshul@iitg.ac.in', label: 'Email', Icon: IconMail },
  { href: 'tel:+916376542708', label: 'Phone', Icon: IconPhone },
  { href: 'https://linkedin.com/in/sutharanshul', label: 'LinkedIn', Icon: IconLinkedIn },
  { href: 'https://behance.net/anshulsuthar', label: 'Behance', Icon: IconBehance },
] as const

const ICONS = {
  about: IconAperture,
  work: IconSheet,
  garage: IconBolt,
} as const

export function SideNav({ width }: SideNavProps) {
  const pathname = usePathname()
  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(path + '/')

  return (
    <aside
      style={width ? { width } : undefined}
      data-lenis-prevent
      className="fixed left-0 top-0 z-40 flex h-screen flex-col overflow-y-auto bg-sidebar text-sidebar-foreground"
    >
      <div className="flex-1" style={{ padding: 'var(--s5)' }}>
        {/* Identity */}
        <div className="flex items-start justify-between gap-3">
          <h1 className="t-name">Anshul Suthar</h1>
          <ThemeToggle />
        </div>
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
          Curriculum vitae ↗
        </a>

        <div className="contact-row">
          {CONTACT.map(({ href, label, Icon }) => (
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
              <Icon size={21} />
            </a>
          ))}
        </div>

        {/* Sections */}
        <nav className="stack" style={{ marginTop: 'var(--s6)' }} aria-label="Sections">
          {NAV.filter((item) => !('hidden' in item && item.hidden)).map((item) => {
            const I = ICONS[item.icon]
            const active = isActive(item.href)
            return (
              <FieldItem key={item.href} maxShift={3} radiusRatio={1.8} mass={0.7}>
                <Link
                  href={item.href}
                  data-sfx="tick"
                  data-active={active}
                  className="nav-item"
                  aria-current={active ? 'page' : undefined}
                >
                  <CornerMarks />
                  <span className="nav-plate">
                    <I size={17} />
                  </span>
                  <span className="min-w-0" style={{ display: 'grid', gap: 2 }}>
                    <span className="t-title">{item.title}</span>
                    <span className="t-meta truncate">{item.note}</span>
                  </span>
                </Link>
              </FieldItem>
            )
          })}
        </nav>

        {/* Case studies */}
        <div style={{ marginTop: 'var(--s6)' }}>
          <span className="t-label">Selected case studies</span>
          <div className="stack" style={{ marginTop: 'var(--s3)' }}>
            {caseStudies.map((study, i) => {
              const active = pathname === `/work/${study.slug}`
              return (
                <Link
                  key={study.slug}
                  href={`/work/${study.slug}`}
                  data-sfx="tick"
                  data-active={active}
                  className="card-link study-link relative"
                  aria-current={active ? 'page' : undefined}
                >
                  <CornerMarks />
                  {/* The index, given the same slot the nav items give their
                      mechanism. At 11px beside the title it read as a stray
                      piece of metadata; at plate size it is the item's mark. */}
                  <span className="study-no" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
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
      </div>

      <div style={{ padding: '0 var(--s5) var(--s5)' }}>
        <SoundControl />
      </div>
    </aside>
  )
}
