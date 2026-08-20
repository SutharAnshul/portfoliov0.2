/**
 * The reading order of the site, used by the overscroll-to-advance control.
 *
 * Pushing past the bottom charges a gauge toward the next page; pushing past
 * the top charges it toward the previous one. Order is derived from this list,
 * so adding a page in the middle needs no other change.
 */
export interface Page {
  path: string
  label: string
}

export const PAGES: Page[] = [
  { path: '/', label: 'About' },
  { path: '/work', label: 'Selected Work' },
  { path: '/garage', label: 'My Garage' },
]

export interface Neighbours {
  next: Page | null
  prev: Page | null
}

export function neighbours(pathname: string): Neighbours {
  const i = PAGES.findIndex((p) => p.path === pathname)
  if (i === -1) return { next: null, prev: null }
  return {
    next: i < PAGES.length - 1 ? PAGES[i + 1] : null,
    prev: i > 0 ? PAGES[i - 1] : null,
  }
}
