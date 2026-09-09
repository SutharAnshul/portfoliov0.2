'use client'

import { useEffect, useState } from 'react'
import { installMaterial } from '@/lib/physics'

/**
 * Four arms around a hole, at the pointer, and nothing else.
 *
 * The arms are pulled back from the centre so the exact pixel being pointed at
 * is left uncovered; pressing runs them in until they meet flush. That is the
 * whole interaction — the click reads as the mark closing on its target rather
 * than as something thrown around it.
 *
 * It arrived here by subtraction: a violet ring that sprang on hover, a burst
 * on click, and two full-viewport guide rules all came out. Each was saying
 * something the page already says — a link looks like a link, a click has a
 * result, and a mark that tracks the pointer does not need two lines to
 * announce where the pointer is.
 *
 * The mark is difference blended, which is what keeps it legible over a
 * photograph without knowing anything about it: white inverts to whatever the
 * backdrop is not.
 *
 * It tracks the pointer exactly. There is no easing left in it — with nothing
 * trailing behind, lag would only read as lag — and so no animation frame
 * either: pointermove already fires at most once a frame, and a loop that
 * republishes the last coordinate is latency bought for nothing.
 */
const NATIVE_CURSOR = '.cursor-native, .cursor-col-resize, .cursor-zoom-in, .cursor-zoom-out'

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || reduce.matches) return
    installMaterial()
    setEnabled(true)
  }, [])

  useEffect(() => {
    if (!enabled) return

    const root = document.querySelector<HTMLElement>('.cursor-root')
    const core = document.querySelector<HTMLElement>('.cursor-core')
    if (!root || !core) return

    document.documentElement.classList.add('has-custom-cursor')

    const targetX = window.innerWidth / 2
    const targetY = window.innerHeight / 2

    const place = (x: number, y: number) => {
      core.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
    }
    place(targetX, targetY)

    const onMove = (e: PointerEvent) => {
      place(e.clientX, e.clientY)

      const el = e.target as Element | null
      root.style.opacity = el?.closest?.(NATIVE_CURSOR) ? '0' : '1'
    }

    /**
     * A cross-origin iframe swallows pointermove — the parent document stops
     * hearing anything the moment the cursor crosses the frame's edge, so the
     * crosshair would freeze there rather than hand over.
     *
     * mouseover/mouseout still fire on the iframe *element*, which lives in
     * this document even though its contents do not. They are the only signal
     * that survives the boundary, and unlike sampling coordinates on move they
     * cannot be skipped over by a fast flick of the wrist.
     */
    const onOver = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.(NATIVE_CURSOR)) root.style.opacity = '0'
    }
    const onOut = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.(NATIVE_CURSOR)) root.style.opacity = '1'
    }

    const onLeave = () => {
      root.style.opacity = '0'
    }
    const onEnter = () => {
      root.style.opacity = '1'
    }

    /* Down and up rather than a :active rule, because the cursor layer is
       pointer-events: none and so is never the pressed element. `pointerup` is
       on the window and not the document: a press that ends outside the
       viewport still has to let the arms back out. */
    const onDown = () => {
      root.dataset.press = 'true'
    }
    const onUp = () => {
      delete root.dataset.press
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })
    document.addEventListener('mouseover', onOver, { passive: true })
    document.addEventListener('mouseout', onOut, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('pointerenter', onEnter)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('pointerenter', onEnter)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div className="cursor-root" aria-hidden="true">
      <div className="cursor-layer">
        <div className="cursor-core">
          <span className="cursor-arm cursor-arm-t" />
          <span className="cursor-arm cursor-arm-r" />
          <span className="cursor-arm cursor-arm-b" />
          <span className="cursor-arm cursor-arm-l" />
        </div>
      </div>
    </div>
  )
}
