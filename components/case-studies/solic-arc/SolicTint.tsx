'use client'

import { useEffect } from 'react'
import { ACTS } from './lib/acts'

/**
 * Keeps the site's index legible over the case study's colour.
 *
 * Solic Arc paints the document's background as you read — eight acts, cream
 * to ink to a deep blue and back. The index in the left quarter is not inside
 * `.solic`, so none of that reaches it, and left alone it is dark type on
 * whatever the page has become: invisible for three of the eight acts.
 *
 * ── Why it reads the sections and not the colour ────────────────────────
 *
 * The obvious version asked the page what colour it had gone — read
 * `body`'s computed background, find the nearest act, take that act's
 * foreground. It was wrong by exactly one act, always.
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
 * takes that act's own foreground. No ordering to lose, and the ink is by
 * construction the one the act was drawn against.
 */
export function SolicTint() {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.solic-record')
    if (!el) return

    let queued = 0
    let acts: HTMLElement[] = []

    const measure = () => {
      acts = [...document.querySelectorAll<HTMLElement>('[data-act]')]
    }

    const read = () => {
      queued = 0
      if (!acts.length) return

      /* The middle of the window, the same line Chrome changes the marker on,
         so the index and the piece's own bar never disagree. */
      const line = window.innerHeight * 0.5
      let i = acts.findIndex((a) => a.getBoundingClientRect().bottom > line)
      if (i < 0) i = acts.length - 1

      const act = ACTS[Number(acts[i].dataset.act) || 0]
      if (act) el.style.setProperty('--solic-ink', act.fg)
    }

    const onScroll = () => {
      if (!queued) queued = requestAnimationFrame(read)
    }

    const onResize = () => {
      measure()
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
      el.style.removeProperty('--solic-ink')
    }
  }, [])

  return null
}
