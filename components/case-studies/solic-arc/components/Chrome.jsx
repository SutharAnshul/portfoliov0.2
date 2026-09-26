import { useEffect, useRef, useState } from 'react'
import { ACTS, mixHex, smooth } from '../lib/acts'

/* Page colour field (painted on body) + the editorial act marker.
   The field interpolates across each act boundary; the marker changes at the midpoint. */
export default function Chrome({ backHref, backLabel = 'All work' }) {
  const mark = useRef(null)
  const bar = useRef(null)
  const [cur, setCur] = useState(0)
  const curRef = useRef(0)

  useEffect(() => {
    let bounds = []
    let raf = 0
    // this page paints the document colour while it is mounted; put the host's back on unmount
    const prevBody = document.body.style.backgroundColor
    const prevHtml = document.documentElement.style.backgroundColor
    const measure = () => {
      bounds = [...document.querySelectorAll('[data-act]')].map((el) => {
        const r = el.getBoundingClientRect()
        return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, i: +el.dataset.act }
      })
    }
    const paint = () => {
      raf = 0
      if (!bounds.length) return
      const vh = window.innerHeight
      const y = window.scrollY + vh * 0.5
      const z = Math.min(vh * 0.45, 420)
      let k = bounds.findIndex((b) => y < b.bottom)
      if (k < 0) k = bounds.length - 1
      const a = bounds[k]
      let other = null, t = 0
      const next = bounds[k + 1], prev = bounds[k - 1]
      if (next && y > a.bottom - z) { other = next; t = smooth((y - (a.bottom - z)) / (2 * z)) }
      else if (prev && y < a.top + z) { other = prev; t = smooth((a.top + z - y) / (2 * z)) }
      const A = ACTS[a.i], O = other ? ACTS[other.i] : A
      const col = mixHex(A.bg, O.bg, t)
      document.body.style.backgroundColor = col
      document.documentElement.style.backgroundColor = col
      const fg = mixHex(A.fg, O.fg, t)
      mark.current.style.color = fg
      mark.current.style.backgroundColor = col
      const doc = document.documentElement.scrollHeight - vh
      bar.current.style.transform = `scaleX(${doc > 0 ? window.scrollY / doc : 0})`
      if (curRef.current !== a.i) { curRef.current = a.i; setCur(a.i) }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(paint) }
    const onResize = () => { measure(); onScroll() }
    measure(); paint()
    const ro = new ResizeObserver(onResize)
    ro.observe(document.body)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(raf)
      document.body.style.backgroundColor = prevBody
      document.documentElement.style.backgroundColor = prevHtml
    }
  }, [])

  const a = ACTS[cur]
  const isAct = /^\d/.test(a.n)
  return (
    <>
      <div
        ref={mark}
        className="fixed left-0 right-0 z-40 pointer-events-none"
        style={{ top: 'env(safe-area-inset-top, 0px)', color: ACTS[0].fg, backgroundColor: ACTS[0].bg }}
      >
        <div className="sa-wrap flex items-start justify-between gap-6 pt-3 md:pt-4">
          <div className="sa-t-label flex items-baseline gap-3 min-w-0" aria-live="polite">
            <span className="sa-t-num shrink-0">{isAct ? `Act ${a.n}` : a.n}</span>
            <span aria-hidden="true" className="opacity-50">/</span>
            <span className="truncate">{a.title}</span>
          </div>
          <div className="sa-t-label shrink-0 sa-t-num flex items-baseline gap-4">
            <span className="hidden sm:inline">Solic Arc<span className="opacity-50"> — {isAct ? `${a.n} / 07` : 'end'}</span></span>
            {backHref && (
              <a href={backHref} className="pointer-events-auto no-underline hover:underline">← {backLabel}</a>
            )}
          </div>
        </div>
        <div className="sa-wrap mt-2.5 md:mt-3">
          <div className="h-px w-full overflow-hidden" style={{ background: 'currentColor', opacity: 0.12 }} />
          <div ref={bar} className="h-px -mt-px w-full origin-left" style={{ background: 'currentColor', opacity: 0.7, transform: 'scaleX(0)' }} />
        </div>
      </div>
    </>
  )
}
