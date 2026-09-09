'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Renders its children once, on a phone, in the tree the phone actually shows.
 *
 * Two conditions, and the second one is not obvious. The shell renders the
 * page into both layouts and hides one of them with CSS, so at phone width a
 * plain media-query check is true in both copies and everything inside this
 * mounts twice. For most content that is invisible; for the work index it is
 * eight WebGL contexts where there should be four, against a per-page cap of
 * about sixteen — the browser starts killing the oldest, and tiles go black.
 *
 * So it also asks where it is. The mobile tree is the one with the scroll
 * root on it; the desktop `<main>` has no such ancestor. Checking the DOM
 * rather than threading a prop down means this keeps working wherever it is
 * used, and it cannot fall out of step with the shell the way a duplicated
 * breakpoint constant would.
 *
 * Mounting and unmounting, not hiding: `display: none` hides pixels, but it
 * does not release a context, stop a render loop or skip a texture upload.
 *
 * The cost is that this arrives after hydration rather than in the first
 * paint. That is the right side of the trade — it is the second half of a long
 * scroll, well below the fold, and it lands long before anyone has read their
 * way down to it.
 */
export function PhoneOnly({ children }: { children: React.ReactNode }) {
  const probe = useRef<HTMLSpanElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    /* 767px, matching the breakpoint the shell and the mobile chrome already
       use — a third number here would be a third thing to keep in step. */
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = () => {
      const inPhoneTree = !!probe.current?.closest('[data-scroll-root]')
      setShow(mq.matches && inPhoneTree)
    }

    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return (
    <>
      {/* The probe. It has to be in the tree before the answer is known, which
          is why the question is asked of a marker rather than of the children
          themselves — mounting them to find out where they are would be
          mounting the thing this exists to avoid mounting. */}
      <span ref={probe} hidden />
      {show ? children : null}
    </>
  )
}
