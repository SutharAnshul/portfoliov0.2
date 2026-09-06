'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * A frame that switches on when you scroll to it.
 *
 * Off, there is nothing there but the two marks: no picture, no plate, not
 * even the hairline the plate is drawn with. They sit on the centre line of
 * the space the frame will occupy, one at each end, and everything else grows
 * out from between them — the plate, its border and the picture together —
 * blooming open and settling. It happens once: a frame that has switched on
 * stays on, because a picture that shuts again every time it leaves the screen
 * turns reading a case study into watching a light flicker.
 *
 * The trigger is half the frame being on screen. That is watched as a sentinel
 * on the frame's own halfway line crossing the fold, rather than as a ratio of
 * the element, because a threshold of 0.5 can never be met by a frame taller
 * than the viewport and would leave it dark for its whole length.
 *
 * Fails open twice over. Nothing renders as off: the attribute is absent until
 * the observer has actually reported, so the server's HTML, a client with JS
 * broken, and anyone who has asked for reduced motion all get a plain visible
 * picture rather than a hairline waiting on a script.
 */
export function Tube({ children }: { children: React.ReactNode }) {
  const half = useRef<HTMLSpanElement>(null)
  const [state, setState] = useState<'idle' | 'on' | 'off'>('idle')

  useEffect(() => {
    const el = half.current
    if (!el) return
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          // Reported for every frame the moment it is observed, which is what
          // shuts the ones below the fold before they are ever seen.
          setState('off')
          return
        }
        observer.disconnect()
        setState('on')
      },
      // No margin: the switch is the halfway line entering the viewport, which
      // is exactly the moment half the frame is showing.
      { threshold: 0, rootMargin: '0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="tube" data-tube={state === 'idle' ? undefined : state}>
      <span ref={half} className="tube-half" aria-hidden="true" />
      {children}
    </div>
  )
}
