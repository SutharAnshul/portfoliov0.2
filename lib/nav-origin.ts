'use client'

import { useSyncExternalStore } from 'react'

/**
 * Which door the reader came through.
 *
 * A case study can be reached two ways, and the left nav should answer the
 * question "where am I?" the way the reader would answer it themselves:
 *
 *   Work index → a study      they are in Work, so Work is lit
 *   Left nav   → a study      they picked that project, so that project is lit
 *
 * The route alone cannot tell these apart — both end on /work/<slug> — and
 * neither can the previous pathname, because reading it back needs an effect
 * that lands a frame after the new page has already painted the wrong item.
 * So the door records itself on the way through, before navigation starts,
 * and the nav has the answer on its first render.
 *
 * A stale value is deliberately left alone. Paging between studies with the
 * record's own prev/next keeps whichever door you came in by, which is what
 * you would say if asked. Arriving cold — a typed URL, a refresh, a shared
 * link — leaves it null, and null lights the project, because with no journey
 * behind you the more specific answer is the true one.
 */

export type NavOrigin = 'work' | 'nav' | null

let origin: NavOrigin = null
const listeners = new Set<() => void>()

export function setNavOrigin(next: NavOrigin) {
  if (next === origin) return
  origin = next
  for (const notify of listeners) notify()
}

function subscribe(notify: () => void) {
  listeners.add(notify)
  return () => {
    listeners.delete(notify)
  }
}

/** Always null on the server, which matches a cold arrival on the client. */
export function useNavOrigin(): NavOrigin {
  return useSyncExternalStore(
    subscribe,
    () => origin,
    () => null,
  )
}
