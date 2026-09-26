'use client'

import { useEffect } from 'react'

/**
 * Keeps the phone's own chrome the colour of the page it is framing.
 *
 * ── Why this and not viewport-fit: cover ────────────────────────────────
 *
 * The strip behind the clock and the battery was a flat bar of the browser's
 * colour, and against a dark site it read as a black band across the top of
 * every screenshot. `viewport-fit: cover` got rid of it by letting the document
 * reach the bezel — and replaced it with something worse: once the page is
 * under the status bar, Safari draws its own blurred backdrop up there so the
 * clock stays legible. That backdrop is browser chrome, painted above the page,
 * so nothing in a stylesheet can cover it. On a page that already has a veil of
 * its own under a fixed mark, it read as two competing bands of blur.
 *
 * So the document stays inside the safe area, and the bar is coloured instead
 * of covered. theme-color is the one lever a page has on it, and with the value
 * kept in step with what the page has actually gone, the bar stops being chrome
 * and becomes the top of the page: cream on Act 01, ink on Act 02, mustard on
 * Act 05, and the site's own dark everywhere else.
 *
 * ── Why it reads the paint ──────────────────────────────────────────────
 *
 * body's computed background, rather than the --background token, because the
 * token is not the whole story: Solic Arc's own Chrome writes
 * backgroundColor directly as well, and on a crossing between two acts the
 * painted colour is a mix of the pair that neither token holds. What is on the
 * screen is what the bar should match.
 *
 * The value is normalised by painting it and reading the pixel back, because a
 * computed background can come back in any colour syntax the engine likes —
 * this site's palette computes to lab(), and a crossing between two acts comes
 * back as oklab() — and a meta tag wants something every browser will parse.
 * Reading fillStyle is not enough: it round-trips a modern syntax unchanged,
 * so the bar was being handed lab(2.75381 0 0). One pixel through getImageData
 * is three bytes in sRGB, whatever went in.
 */
export function ThemeColor() {
  useEffect(() => {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'theme-color'
      document.head.appendChild(meta)
    }

    /* Next renders its own theme-color from the viewport export, and there can
       be more than one — a media-scoped pair, say. Any others are removed, or
       the browser picks by its own rules and this one may not be the one it
       reads. */
    for (const other of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
      if (other !== meta) other.remove()
    }

    const pad = document.createElement('canvas')
    pad.width = 1
    pad.height = 1
    const ctx = pad.getContext('2d', { willReadFrequently: true })

    let queued = 0
    let last = ''

    const read = () => {
      queued = 0
      const paint = getComputedStyle(document.body).backgroundColor
      if (!paint || !ctx) return

      ctx.clearRect(0, 0, 1, 1)
      ctx.fillStyle = paint
      ctx.fillRect(0, 0, 1, 1)
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
      const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`

      if (hex === last) return
      last = hex
      meta.setAttribute('content', hex)
    }

    const onScroll = () => {
      if (!queued) queued = requestAnimationFrame(read)
    }

    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    /* A record paints the document as you read, and it does it by writing an
       inline style on body — which no scroll of ours is guaranteed to follow,
       since the last write can land after the last scroll event. */
    const mo = new MutationObserver(onScroll)
    mo.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      mo.disconnect()
      if (queued) cancelAnimationFrame(queued)
    }
  }, [])

  return null
}
