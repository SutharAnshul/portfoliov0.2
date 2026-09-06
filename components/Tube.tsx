'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * A frame that switches on when you scroll to it.
 *
 * Off, there is nothing there but the two marks: no picture, no plate, not
 * even the hairline the plate is drawn with. They sit on the centre line of
 * the space the frame will occupy, one at each end, and everything else grows
 * out from between them — the plate, its border and the picture together —
 * blooming open, overshooting a hair and settling. Scroll back and the whole
 * frame collapses into the marks again.
 *
 * Reversible on purpose. The reveal it replaces fired once and disconnected
 * its observer, so scrolling back up past a frame found it already on and
 * there was nothing to see a second time.
 *
 * The trigger is the frame's own bottom edge arriving in the viewport, so a
 * frame switches on at the moment it is wholly on screen and never while it
 * is still half cut off by the fold. That is watched with a sentinel on that
 * edge rather than by observing the frame, because an observer on the element
 * reports its top edge crossing, which is a different moment entirely and
 * roughly 490px too early.
 *
 * Fails open twice over. Nothing renders as off: the attribute is absent until
 * the observer has actually reported, so the server's HTML, a client with JS
 * broken, and anyone who has asked for reduced motion all get a plain visible
 * picture rather than a hairline waiting on a script.
 */
export function Tube({ children }: { children: React.ReactNode }) {
  const foot = useRef<HTMLSpanElement>(null)
  const [state, setState] = useState<'idle' | 'on' | 'off'>('idle')

  useEffect(() => {
    const el = foot.current
    if (!el) return
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => setState(entry.isIntersecting ? 'on' : 'off'),
      // On the moment the bottom edge is inside the viewport, off again once
      // it has left — either back down past the fold or up off the top.
      { threshold: 0, rootMargin: '0px 0px -2% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="tube" data-tube={state === 'idle' ? undefined : state}>
      <span ref={foot} className="tube-foot" aria-hidden="true" />
      {children}
    </div>
  )
}
