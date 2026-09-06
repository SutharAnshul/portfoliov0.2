'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * A frame that switches on when you scroll to it.
 *
 * Off, the picture is squashed to a bright line across the middle of the plate
 * and the four corner marks have met on that same line. Bring the middle of
 * the frame up the screen and the set comes on: the line blooms open into the
 * picture, overshoots a hair, and settles, while the marks travel out to the
 * corners. Scroll back and it collapses to the line before going dark.
 *
 * Reversible on purpose. The reveal it replaces fired once and disconnected
 * its observer, so scrolling back up past a frame found it already on and
 * there was nothing to see a second time.
 *
 * What is watched is a sentinel across the plate's centre line, not the frame
 * itself, and the reason is the whole effect. A frame is around 490px tall; if
 * you trigger on its top edge entering a band, the switch fires while its
 * centre — where the bright line actually is — is still below the fold, so the
 * line is never once seen. Watching the centre instead gives roughly a third
 * of a screen of scrolling where the frame is nothing but that line, which is
 * the part worth having.
 *
 * Fails open twice over. Nothing renders as off: the attribute is absent until
 * the observer has actually reported, so the server's HTML, a client with JS
 * broken, and anyone who has asked for reduced motion all get a plain visible
 * picture rather than a hairline waiting on a script.
 */
export function Tube({ children }: { children: React.ReactNode }) {
  const centre = useRef<HTMLSpanElement>(null)
  const [state, setState] = useState<'idle' | 'on' | 'off'>('idle')

  useEffect(() => {
    const el = centre.current
    if (!el) return
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => setState(entry.isIntersecting ? 'on' : 'off'),
      // On once the centre line is above the lower third of the screen, off
      // again as it leaves out of the top.
      { threshold: 0, rootMargin: '-8% 0px -30% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="tube" data-tube={state === 'idle' ? undefined : state}>
      <span ref={centre} className="tube-centre" aria-hidden="true" />
      {children}
    </div>
  )
}
