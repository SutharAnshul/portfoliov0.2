'use client'

import { useEffect } from 'react'

/**
 * The record was drawn at 1440 and is shown at 1440, or at whatever fraction
 * of it the window can hold.
 *
 * Everything inside it — type sizes, rules, the gaps between things — is set
 * in absolute units against that width. Letting it reflow into a narrower box
 * would not make it smaller, it would make it wrong: headings drawn to fill a
 * line would wrap into three, and a layout built in columns would break its
 * columns. So the whole piece is scaled instead, and it arrives as it was
 * drawn on every screen.
 *
 * `zoom` rather than a transform, because zoom scales the box as well as the
 * paint: the page is as tall as the scaled record, and everything measuring
 * scroll positions against it — the index, the background — keeps working
 * without knowing any of this happened. A transform would leave the old
 * height behind and put a screenful of nothing at the foot.
 */
export function StoryFit({ width = 1440 }: { width?: number }) {
  useEffect(() => {
    const story = document.querySelector<HTMLElement>('.story')
    if (!story) return

    const fit = () => {
      /* The room the record has: its own column, before any scaling. */
      const room = story.parentElement?.getBoundingClientRect().width ?? window.innerWidth
      const k = Math.min(1, room / width)
      story.style.setProperty('--story-k', String(Math.round(k * 1000) / 1000))
    }

    fit()
    const ro = new ResizeObserver(fit)
    if (story.parentElement) ro.observe(story.parentElement)
    window.addEventListener('resize', fit, { passive: true })

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', fit)
      story.style.removeProperty('--story-k')
    }
  }, [width])

  return null
}
