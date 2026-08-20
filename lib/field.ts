'use client'

import { SPRING, clamp, distanceToCentre, falloff, springStep } from '@/lib/physics'

/**
 * One cursor field for the whole page.
 *
 * Every element that reacts to the pointer registers here and is driven by a
 * single rAF loop, rather than each component running its own. That is what
 * makes the page behave like one field instead of a collection of independent
 * hover effects — and it keeps the cost flat as more elements opt in.
 *
 * Each frame reads every rect first and writes every transform afterwards, so
 * measurement never forces a synchronous re-layout mid-loop.
 */

export interface FieldOptions {
  /** Peak deflection toward the pointer, in px. Keep small — this is a nudge. */
  maxShift?: number
  /** Falloff radius as a multiple of the element's longest edge. */
  radiusRatio?: number
  /** Inertia. Heavier elements lag further behind the pointer. */
  mass?: number
}

interface Entry extends Required<FieldOptions> {
  el: HTMLElement
  x: number
  xv: number
  y: number
  yv: number
  s: number
  sv: number
  rect: DOMRect | null
}

const entries = new Set<Entry>()

let pointerX = -1e6
let pointerY = -1e6
let inWindow = false
let frame = 0
let listening = false

function onMove(e: PointerEvent) {
  pointerX = e.clientX
  pointerY = e.clientY
  inWindow = true
}
function onLeave() {
  inWindow = false
}
function onEnter() {
  inWindow = true
}

function loop() {
  // Read pass
  for (const entry of entries) {
    entry.rect = entry.el.getBoundingClientRect()
  }

  // Write pass
  for (const entry of entries) {
    const r = entry.rect
    if (!r || r.width === 0) continue

    let tx = 0
    let ty = 0
    let ts = 0

    if (inWindow) {
      const radius = Math.max(r.width, r.height) * entry.radiusRatio
      ts = falloff(distanceToCentre(pointerX, pointerY, r), radius)
      const dx = pointerX - (r.left + r.width / 2)
      const dy = pointerY - (r.top + r.height / 2)
      const len = Math.hypot(dx, dy) || 1
      // Attraction toward the pointer, scaled by field strength.
      tx = (dx / len) * entry.maxShift * ts
      ty = (dy / len) * entry.maxShift * ts
    }

    ;[entry.x, entry.xv] = springStep(entry.x, entry.xv, tx, entry.mass)
    ;[entry.y, entry.yv] = springStep(entry.y, entry.yv, ty, entry.mass)
    ;[entry.s, entry.sv] = springStep(entry.s, entry.sv, ts, entry.mass)

    entry.el.style.transform = `translate3d(${entry.x.toFixed(2)}px, ${entry.y.toFixed(2)}px, 0)`
    // Published for CSS so borders/tone can track the field without a second loop.
    entry.el.style.setProperty('--fe', clamp(entry.s, 0, 1).toFixed(3))
  }

  frame = requestAnimationFrame(loop)
}

function start() {
  if (listening) return
  listening = true
  window.addEventListener('pointermove', onMove, { passive: true })
  // pointerenter/leave do not bubble and never fire on the Document node.
  document.documentElement.addEventListener('pointerleave', onLeave)
  document.documentElement.addEventListener('pointerenter', onEnter)
  window.addEventListener('blur', onLeave)
  frame = requestAnimationFrame(loop)
}

function stop() {
  if (!listening) return
  listening = false
  cancelAnimationFrame(frame)
  window.removeEventListener('pointermove', onMove)
  document.documentElement.removeEventListener('pointerleave', onLeave)
  document.documentElement.removeEventListener('pointerenter', onEnter)
  window.removeEventListener('blur', onLeave)
}

/** Adds an element to the field. Returns the unregister function. */
export function joinField(el: HTMLElement, options: FieldOptions = {}): () => void {
  if (
    typeof window === 'undefined' ||
    !window.matchMedia('(pointer: fine)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return () => {}
  }

  const entry: Entry = {
    el,
    maxShift: options.maxShift ?? 4,
    radiusRatio: options.radiusRatio ?? 1.6,
    mass: options.mass ?? 1,
    x: 0,
    xv: 0,
    y: 0,
    yv: 0,
    s: 0,
    sv: 0,
    rect: null,
  }
  entries.add(entry)
  start()

  return () => {
    entries.delete(entry)
    el.style.transform = ''
    el.style.removeProperty('--fe')
    if (entries.size === 0) stop()
  }
}

export { SPRING }
