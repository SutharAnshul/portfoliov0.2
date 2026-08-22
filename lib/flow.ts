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

/**
 * Garage is not here, and its route folder is `app/_garage` — the App Router
 * skips a leading underscore, so the page is unrouted rather than merely
 * unlisted. Hiding it from the nav alone was not enough: overscrolling the
 * bottom of Work still carried you into it, because this list is what the
 * gauge advances through. Put the entry back and rename the folder to bring
 * it back in one move.
 */
export const PAGES: Page[] = [
  { path: '/', label: 'About' },
  { path: '/work', label: 'Selected Work' },
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
