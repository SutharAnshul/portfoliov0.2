/**
 * The site's single material.
 *
 * Everything that moves — scroll settle, cursor deflection, the portrait field
 * — resolves from the constants below. Nothing anywhere should invent its own
 * easing curve or duration; if it moves, it moves like this.
 *
 * CSS and JS stay in sync by construction: the spring is simulated once here,
 * and the sampled positions are emitted as a CSS `linear()` easing function.
 * That means a CSS transition and a JS rAF spring produce the identical curve,
 * rather than a hand-picked cubic-bezier that merely looks similar.
 */

/**
 * The material is defined by two numbers, not by hand-tuned per-frame factors.
 *
 *   OMEGA — angular frequency, i.e. how fast it moves
 *   ZETA  — damping ratio, i.e. how much it overshoots
 *
 * Overshoot follows exp(-pi*z / sqrt(1 - z^2)), so ZETA alone fixes the
 * "bounce" character: 0.7 gives roughly 5%, a hint of life without wobble.
 * 1.0 would be critically damped, with none at all.
 *
 * Mass then scales frequency by 1/sqrt(m), which is the actual relationship
 * for a spring–mass system. That keeps bounce identical across masses while
 * heavier things genuinely take longer to arrive — the naive approach of
 * dividing stiffness by mass gets this backwards and makes heavy items settle
 * *sooner*, because they stop oscillating.
 */
export const OMEGA = 12.5
export const ZETA = 0.7

export const SPRING = { omega: OMEGA, zeta: ZETA }

/** Multiplies inertia. Only knob callers should reach for. */
export const MASS = {
  heavy: 1.7,
  medium: 1,
  light: 0.62,
} as const

export type MassName = keyof typeof MASS

/** Distance falloff exponent — matches the portrait field. */
export const FALLOFF_EXPONENT = 5

const FRAME_MS = 1000 / 60
const DT = 1 / 60

/**
 * One semi-implicit Euler step of the damped spring. Velocity is in units per
 * second (not per frame), so every caller must go through this function rather
 * than rolling its own integration.
 */
export function springStep(
  value: number,
  velocity: number,
  target: number,
  mass = 1,
  dt = DT,
): [number, number] {
  const w = OMEGA / Math.sqrt(mass)
  const accel = w * w * (target - value) - 2 * ZETA * w * velocity
  const v = velocity + accel * dt
  return [value + v * dt, v]
}

/**
 * Inverse-power falloff, softened at the origin.
 *
 *     strength = 1 / (1 + (d/R)^n)
 *
 * A literal 1/dⁿ diverges at d = 0. This form is finite at contact and
 * converges to Rⁿ/dⁿ once d >> R — inverse-power in the far field.
 */
export function falloff(distance: number, radius: number, exponent = FALLOFF_EXPONENT): number {
  return 1 / (1 + Math.pow(distance / radius, exponent))
}

/** Straight-line distance from a point to the centre of a rect. */
export function distanceToCentre(px: number, py: number, r: DOMRect): number {
  return Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2))
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)

interface Curve {
  /** CSS easing string — a `linear()` sampled from the real spring. */
  easing: string
  /** ms the spring needs to come to rest, from the same simulation. */
  duration: number
}

const curveCache = new Map<number, Curve>()

/**
 * Runs the spring to rest and returns both the CSS easing and the duration.
 * Cached per mass — the simulation is identical every time.
 */
export function springCurve(mass: number = MASS.medium): Curve {
  const cached = curveCache.get(mass)
  if (cached) return cached

  const points: number[] = [0]
  let x = 0
  let v = 0
  let frames = 0
  const MAX = 300

  for (let i = 0; i < MAX; i++) {
    ;[x, v] = springStep(x, v, 1, mass)
    points.push(x)
    frames++
    if (Math.abs(1 - x) < 0.0015 && Math.abs(v) < 0.0015) break
  }
  // Land exactly on target so the transition cannot leave a sub-pixel residue.
  points[points.length - 1] = 1

  const curve: Curve = {
    easing: `linear(${points.map((p) => p.toFixed(4)).join(',')})`,
    duration: Math.round(frames * FRAME_MS),
  }
  curveCache.set(mass, curve)
  return curve
}

/**
 * `linear()` easing is recent (Chrome 113+, Safari 17.4+, Firefox 112+).
 * Where it is missing the browser would discard the whole declaration, so fall
 * back to the closest fixed curve rather than losing the transition entirely.
 */
export function supportsLinearEasing(): boolean {
  if (typeof CSS === 'undefined' || !CSS.supports) return false
  return CSS.supports('transition-timing-function', 'linear(0, 1)')
}

export const FALLBACK_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)'

/**
 * Publishes the material's curves as CSS custom properties, once per document.
 *
 * A `linear()` string sampled from the spring runs to ~50 points; inlining it
 * on every element would repeat hundreds of bytes per node. Emitting it once
 * on the root lets components reference var(--ease-medium) instead.
 */
let materialInstalled = false

export function installMaterial(): void {
  if (materialInstalled || typeof document === 'undefined') return
  materialInstalled = true

  const root = document.documentElement
  const linearOK = supportsLinearEasing()

  for (const name of Object.keys(MASS) as MassName[]) {
    const { easing, duration } = springCurve(MASS[name])
    root.style.setProperty(`--ease-${name}`, linearOK ? easing : FALLBACK_EASING)
    root.style.setProperty(`--dur-${name}`, `${duration}ms`)
  }
}
