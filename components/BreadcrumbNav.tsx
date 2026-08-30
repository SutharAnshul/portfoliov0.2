'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CatMark } from '@/components/Icons'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbNavProps {
  left?: number
  right?: number
  /** Matched to the main column's, so the two edges move as one. */
  transition?: string
  chatOpen?: boolean
  onOpenChat?: () => void
}

export function BreadcrumbNav({
  left = 0,
  right = 0,
  transition,
  chatOpen = true,
  onOpenChat,
}: BreadcrumbNavProps) {
  const pathname = usePathname()

  const breadcrumbs: BreadcrumbItem[] = []

  // Build breadcrumbs - always start with portfolio
  if (pathname === '/') {
    breadcrumbs.push({ label: 'portfolio', href: '/' })
    breadcrumbs.push({ label: 'about', href: '/' })
  } else {
    breadcrumbs.push({ label: 'portfolio', href: '/' })
    const segments = pathname.split('/').filter(Boolean)
    segments.forEach((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/')
      breadcrumbs.push({
        label: segment.replace(/-/g, ' '),
        href,
      })
    })
  }

  return (
    <div
      data-breadcrumb
      style={{ left, right, transition, padding: 'var(--s4) var(--s6)' }}
      className="fixed top-0 z-[70] bg-background"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {pathname === '/play' && (
            <Link
              href="/play"
              className="text-foreground/50 hover:text-foreground transition-colors flex-shrink-0"
              aria-label="Back to Play"
              onClick={(e) => {
                e.preventDefault()
                window.history.back()
              }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>
          )}
          <div className="t-meta flex items-center gap-2">
          {breadcrumbs.map((item, index) => (
            <div key={`${item.href}-${item.label}`} className="flex items-center gap-2">
              {index > 0 && <span className="text-foreground/40">/</span>}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-foreground">{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </div>
        </div>
        {!chatOpen && onOpenChat && (
          <button
            onClick={onOpenChat}
            data-sfx="tick"
            className="card-link t-title orion-btn cat-wake"
            aria-label="Open Mr. Toast chat"
          >
            {/* Orion himself sits on the button that opens him. */}
            <span className="orion-cat" aria-hidden="true">
              <CatMark size={25} />
            </span>
            Mr. Toast
          </button>
        )}
      </div>
    </div>
  )
}
