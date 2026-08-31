'use client'

import { useEffect, useState } from 'react'
import { MASS, installMaterial, springStep } from '@/lib/physics'
import { sfx } from '@/lib/audio'

/**
 * Crosshair cursor: full-viewport guide rules, a precise "+" at the pointer,
 * and a damped square ring that springs on hover and click.
 *
 * Motion model — position and scale animate separately so the cursor reads as
 * a physical object rather than a snapping div:
 *   position  -> damped lerp (heavier the further back the layer sits)
 *   scale     -> spring with slight overshoot, so hover "pops"
 *
 * The ring used to turn 45° on hover as well. It does not any more: the square
 * becoming a diamond changed what the mark *was* every time it crossed a link,
 * which is a lot of movement to spend on saying "this is clickable" when the
 * size change already says it.
 *
 * Layering — guides and the "+" live in a `difference` blend layer so they stay
 * legible on any backdrop in either theme. The ring sits in a normal-blend
 * layer instead: difference inverts its backdrop and would desaturate the
 * accent, so the glow only works outside of it.
 */

const POS_EASE = 0.13
const GUIDE_EASE = 0.22

const HOVER_SCALE = 1.55
const PRESS_SCALE = 0.7

/** Where the crosshair stands down and the machine's own pointer takes over. */
const NATIVE_CURSOR = '.cursor-native, .cursor-col-resize, .cursor-zoom-in, .cursor-zoom-out'
const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, [data-cursor="interactive"]'

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
    const ring = document.querySelector<HTMLElement>('.cursor-ring')
    const hLine = document.querySelector<HTMLElement>('.cursor-guide-h')
    const vLine = document.querySelector<HTMLElement>('.cursor-guide-v')
    if (!root || !core || !ring || !hLine || !vLine) return

    document.documentElement.classList.add('has-custom-cursor')

    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let guideX = targetX
    let guideY = targetY
    let ringX = targetX
    let ringY = targetY

    let scale = 1
    let scaleVel = 0

    let hovering = false
    let pressed = false

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX
      targetY = e.clientY

      const el = e.target as Element | null
      root.style.opacity = el?.closest?.(NATIVE_CURSOR) ? '0' : '1'

      const next = !!el?.closest?.(INTERACTIVE)
      if (next !== hovering) {
        hovering = next
        ring.dataset.hover = String(hovering)
      }
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

    const spawnBurst = (x: number, y: number) => {
      const burst = document.createElement('div')
      burst.className = 'cursor-burst'
      burst.style.left = `${x}px`
      burst.style.top = `${y}px`
      ring.parentElement?.appendChild(burst)
      burst.addEventListener('animationend', () => burst.remove(), { once: true })
    }

    const onDown = () => {
      pressed = true
      ring.dataset.press = 'true'
      // Kick the spring so the press registers ahead of the easing.
      scaleVel -= 3.3
      spawnBurst(targetX, targetY)
      sfx.shutter()
    }
    const onUp = () => {
      pressed = false
      ring.dataset.press = 'false'
    }
    const onLeave = () => {
      root.style.opacity = '0'
    }
    const onEnter = () => {
      root.style.opacity = '1'
    }

    let frame = 0
    const loop = () => {
      guideX += (targetX - guideX) * GUIDE_EASE
      guideY += (targetY - guideY) * GUIDE_EASE
      ringX += (targetX - ringX) * POS_EASE
      ringY += (targetY - ringY) * POS_EASE

      const speed = Math.min(Math.hypot(targetX - ringX, targetY - ringY) / 90, 1)
      const scaleTarget = (pressed ? PRESS_SCALE : hovering ? HOVER_SCALE : 1) + speed * 0.3

      ;[scale, scaleVel] = springStep(scale, scaleVel, scaleTarget, MASS.light)

      core.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${scale})`
      hLine.style.transform = `translate3d(0, ${guideY}px, 0)`
      vLine.style.transform = `translate3d(${guideX}px, 0, 0)`

      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver, { passive: true })
    document.addEventListener('mouseout', onOut, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('pointerenter', onEnter)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('pointerenter', onEnter)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div className="cursor-root" aria-hidden="true">
      {/* Difference-blended: always legible, never colourful */}
      <div className="cursor-layer cursor-layer-blend">
        <div className="cursor-guide cursor-guide-h" />
        <div className="cursor-guide cursor-guide-v" />
        <div className="cursor-core">
          <span className="cursor-core-h" />
          <span className="cursor-core-v" />
        </div>
      </div>

      {/* Normal-blended: where colour and glow actually work */}
      <div className="cursor-layer cursor-layer-plain">
        <div className="cursor-ring" data-hover="false" data-press="false" />
      </div>
    </div>
  )
}
