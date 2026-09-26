'use client'

import { useEffect } from 'react'
import { ACTS } from './lib/acts'

/**
 * The act's colour becomes the site's colour.
 *
 * Solic Arc paints the document as you read — eight acts, cream to ink to a
 * deep blue and back — but it paints `background-color` directly, which tells
 * the rest of the site nothing. Everything of ours around it is mixed from
 * two tokens, so left alone the mark, its halo, the veil and the index all
 * stay dressed for a dark page and three of the eight acts swallow them.
 *
 * So this does for Solic Arc what StoryBackground does for the Incentiwise
 * scroll: it writes the act's own foreground and background into --foreground
 * and --background. One value each, and the mark, the glass under it and the
 * index in the margin all come along, because that is what every colour on
 * the site is mixed from. Both tokens are registered with a type (see the top
 * of globals.css), so they interpolate rather than snap, and the change moves
 * on the same clock as the piece's own crossfade.
 *
 * ── Why it reads the sections and not the paint ─────────────────────────
 *
 * The obvious version asked the page what colour it had gone — read `body`'s
 * computed background, find the nearest act, take that act's foreground. It
 * was wrong by exactly one act, always.
 *
 * Both this and the piece's own Chrome answer a scroll by queueing a
 * requestAnimationFrame. This one is mounted first, so its callback is queued
 * first and runs first, and what it read was the colour Chrome had painted on
 * the *previous* frame. While the wheel is moving that is a frame behind and
 * invisible; when scrolling stops there is no further event, so the last read
 * stands — permanently one act stale, which is precisely the case where the
 * ink is wrong and unreadable.
 *
 * So it does not look at the paint at all. It reads the same thing Chrome
 * reads — which `[data-act]` section holds the middle of the window — and
 * takes that act's own pair.
 */
export function SolicTint() {
  useEffect(() => {
    const root = document.documentElement

    /* What the route is, for the handful of rules that only apply while a
       record is painting the site its own colour. Removed on unmount, with
       the tokens, so the site's palette comes back on the way out. */
    root.dataset.solic = 'true'
    const prevFg = root.style.getPropertyValue('--foreground')
    const prevBg = root.style.getPropertyValue('--background')

    let queued = 0
    let acts: HTMLElement[] = []
    let last = -1

    const measure = () => {
      acts = [...document.querySelectorAll<HTMLElement>('[data-act]')]

    }

    const read = () => {
      queued = 0
      if (!acts.length) return

      /* The middle of the window, the same line Chrome changes its marker on,
         so the index and the piece's own bar never disagree. */
      const line = window.innerHeight * 0.5
      let i = acts.findIndex((a) => a.getBoundingClientRect().bottom > line)
      if (i < 0) i = acts.length - 1

      const n = Number(acts[i].dataset.act) || 0
      if (n === last) return
      last = n

      const act = ACTS[n]
      if (!act) return
      root.style.setProperty('--foreground', act.fg)
      root.style.setProperty('--background', act.bg)
    }

    const onScroll = () => {
      if (!queued) queued = requestAnimationFrame(read)
    }

    const onResize = () => {
      measure()
      last = -1
      onScroll()
    }

    measure()
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })

    /* The acts are not in the tree on the first pass — this mounts beside the
       case study, not inside it — and their heights settle as images load. */
    const ro = new ResizeObserver(onResize)
    ro.observe(document.body)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      ro.disconnect()
      if (queued) cancelAnimationFrame(queued)
      delete root.dataset.solic
      if (prevFg) root.style.setProperty('--foreground', prevFg)
      else root.style.removeProperty('--foreground')
      if (prevBg) root.style.setProperty('--background', prevBg)
      else root.style.removeProperty('--background')
    }
  }, [])

  return null
}
