'use client'

import { useEffect } from 'react'

/**
 * The record's colour becomes the site's colour.
 *
 * The case study is built in acts, and each act is a colour: ink, cream,
 * mustard, pale, graphite. Rather than painting those behind the content —
 * which would make every act a coloured card floating on a black page — the
 * sections are left transparent and the *page* takes their colour. The effect
 * is that the content has no background at all: the site is the background,
 * and it changes as you read.
 *
 * Whichever section holds the middle of the screen owns the colour. It eases
 * across when a new one takes over rather than blending continuously through
 * the scroll: mixing mustard into blue in proportion to a finger's position
 * passes through a run of colours nobody chose, and they look like mud.
 *
 * The ink goes with it. Light acts take dark type, dark acts take light — and
 * because every colour on the site is mixed from --foreground, swapping that
 * one value carries the mark, the index, the rules and the margins with it.
 * Handing the page a light background and leaving white type on it would be
 * the one thing worse than not doing this at all.
 */

/** Where the head reads: the line an act has to cross to take the page. */
const LINE = 0.5

export type Theme = { bg: string; ink: string }

export function StoryBackground({ themes }: { themes: Record<string, Theme> }) {
  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>('.story [data-theme]')]
    if (!sections.length) return

    const root = document.documentElement
    /* What the site is when it is not being a record, to be handed back. */
    const style = root.style
    const had = { bg: style.getPropertyValue('--background'), ink: style.getPropertyValue('--foreground') }

    let queued = 0
    let last = ''

    const read = () => {
      queued = 0
      const line = window.innerHeight * LINE
      let now = sections[0]
      for (const s of sections) {
        if (s.getBoundingClientRect().top <= line) now = s
      }

      const name = now.dataset.theme || ''
      if (name === last) return
      last = name

      const theme = themes[name]
      if (!theme) return
      style.setProperty('--background', theme.bg)
      style.setProperty('--foreground', theme.ink)
    }

    const onScroll = () => {
      if (!queued) queued = requestAnimationFrame(read)
    }

    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    root.dataset.story = 'on'

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (queued) cancelAnimationFrame(queued)
      /* Leaving the record gives the site its own colours back. */
      delete root.dataset.story
      if (had.bg) style.setProperty('--background', had.bg)
      else style.removeProperty('--background')
      if (had.ink) style.setProperty('--foreground', had.ink)
      else style.removeProperty('--foreground')
    }
  }, [themes])

  return null
}
