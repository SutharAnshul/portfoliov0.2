'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CatMark, CatSide } from '@/components/Icons'

/**
 * Mr. Toast.
 *
 * When the pointer comes near him he performs one sequence, and it is a story
 * in four beats rather than a path with keyframes on it:
 *
 *   1  He does not want you there. A short recoil, then he bolts out of the
 *      right wall — fleeing is faster than patrolling, and reads as such.
 *   2  Half a second of nothing. The absence is the beat that makes the third
 *      one land; without it the leap is just more movement.
 *   3  He comes back in through the left wall already travelling, touches down
 *      on the middle of the top edge of the first suggestion, and launches out
 *      through the right wall. One continuous leap across the drawer, not a
 *      fall — he arrives from off-stage the same way he left.
 *   4  He is seen coming home — in from the left, decelerating into his box,
 *      turning to face you, and sitting. The story resolves.
 *
 * Startle, absence, spectacle, resolution.
 *
 * The motion is built from how cats actually move rather than from cartoon
 * convention, which mostly means restraint:
 *
 *  - Squash and stretch stays under six percent. A real cat barely deforms;
 *    fifteen percent is a bouncing ball with ears.
 *  - The head counters the body's pitch. Cats hold their heads level through
 *    almost anything, and this is the single detail that stops a leap reading
 *    as a thrown object.
 *  - The tail counter-rotates against the body. That is angular momentum, and
 *    it is what a cat's tail is doing in the air.
 *  - Timing is asymmetric everywhere. The gather before a launch is slow, the
 *    launch itself is two frames, the float is long, and the landing absorbs
 *    fast and settles slowly.
 *  - Body pitch is read off the path it is on rather than authored, damped, so
 *    he points where he is going without weathervaning.
 */

const SIDE_W = 62
const SIDE_H = (SIDE_W * 36) / 64
const FRONT_W = 32
const FRONT_H = (FRONT_W * 48) / 40

/** Fleeing is quicker than coming home. */
const FLEE_SPEED = 0.42
const HOME_SPEED = 0.24

const GATHER_MS = 150
const FALL_MS = 560
const ABSORB_MS = 90
const PUSH_MS = 70
const RISE_MS = 620
const LEAP_MS = FALL_MS + ABSORB_MS + PUSH_MS + RISE_MS

const GONE_MS = 520

const STARTLE_PX = 140
const COOLDOWN_MS = 4200

type Pose = 'sit' | 'side'

interface Point {
  x: number
  y: number
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()))

/** Falling accelerates. Rising bleeds off. One symmetric ease reads as floaty. */
const fallEase = (s: number) => s * s
const riseEase = (s: number) => 1 - (1 - s) * (1 - s)

export function OrionCat({
  hostRef,
  bedRef,
  perchRef,
  altPerchRef,
  active,
}: {
  hostRef: React.RefObject<HTMLElement | null>
  bedRef: React.RefObject<HTMLElement | null>
  /** The first suggestion — only on screen before a conversation starts. */
  perchRef: React.RefObject<HTMLElement | null>
  /** Where he lands once the suggestions are gone. */
  altPerchRef: React.RefObject<HTMLElement | null>
  active: boolean
}) {
  const layerRef = useRef<HTMLSpanElement>(null)
  const sideRef = useRef<HTMLSpanElement>(null)
  const frontRef = useRef<HTMLSpanElement>(null)

  const [pose, setPose] = useState<Pose>('sit')
  const busy = useRef(false)
  const last = useRef(0)
  const alive = useRef(true)
  const introShown = useRef(false)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const geometry = useCallback(() => {
    const host = hostRef.current
    const bed = bedRef.current?.getBoundingClientRect()
    if (!host || !bed) return null
    const hostBox = host.getBoundingClientRect()
    // The suggestions unmount as soon as anyone asks anything, so once a
    // conversation is running he lands on the edge of the box you type into
    // instead. Something is always there to land on.
    const target = perchRef.current ?? altPerchRef.current
    const perch = target?.getBoundingClientRect()
    return {
      w: hostBox.width,
      h: hostBox.height,
      home: {
        x: bed.left - hostBox.left + (bed.width - FRONT_W) / 2,
        y: bed.top - hostBox.top + (bed.height - FRONT_H) / 2,
      } as Point,
      // Dead centre of the top edge of the first suggestion — he always lands
      // on the same spot, which is what makes it read as deliberate.
      perch: perch
        ? ({
            x: perch.left - hostBox.left + perch.width / 2 - SIDE_W / 2,
            y: perch.top - hostBox.top - SIDE_H + 3,
          } as Point)
        : null,
    }
  }, [hostRef, bedRef, perchRef, altPerchRef])

  /**
   * Running or airborne. He is in profile for both, but the gallop cycle must
   * not keep running while he is in the air — legs cycling through a jump is
   * the single most common tell of an animation nobody looked at twice.
   */
  const gait = useCallback((g: 'run' | 'air') => {
    const el = sideRef.current
    if (el) el.dataset.gait = g
  }, [])

  const place = useCallback((p: Point) => {
    const l = layerRef.current
    if (l) l.style.transform = `translate(${p.x}px, ${p.y}px)`
  }, [])

  const clearAll = useCallback(() => {
    for (const root of [sideRef.current, frontRef.current, layerRef.current]) {
      root?.getAnimations().forEach((a) => a.cancel())
      root?.querySelectorAll('*').forEach((el) => el.getAnimations().forEach((a) => a.cancel()))
    }
  }, [])

  const goHome = useCallback(() => {
    clearAll()
    const g = geometry()
    if (g) place(g.home)
    setPose('sit')
  }, [clearAll, geometry, place])

  useEffect(() => {
    goHome()
    const host = hostRef.current
    if (!host) return
    const ro = new ResizeObserver(() => {
      if (!busy.current) goHome()
    })
    ro.observe(host)
    return () => ro.disconnect()
  }, [goHome, hostRef])

  const travel = useCallback(async (from: Point, to: Point, speed: number, stop = false) => {
    const layer = layerRef.current
    if (!layer) return
    const ms = Math.max(240, Math.hypot(to.x - from.x, to.y - from.y) / speed)
    const a = layer.animate(
      [
        { transform: `translate(${from.x}px, ${from.y}px)` },
        { transform: `translate(${to.x}px, ${to.y}px)` },
      ],
      {
        duration: ms,
        // Coming home he slows into the box. Fleeing, he does not.
        easing: stop ? 'cubic-bezier(0.16, 0.85, 0.3, 1)' : 'linear',
        fill: 'both',
      },
    )
    await a.finished.catch(() => {})
  }, [])

  /**
   * Profile narrows to nothing and the front view opens out of it on the same
   * frame — one animal turning, not two pictures swapping. The weight then
   * drops into the sit, recovering more slowly than it compressed.
   */
  const turnAndSit = useCallback(async () => {
    const side = sideRef.current
    if (!side) return

    await side
      .animate(
        [
          { transform: 'scaleX(1)', opacity: 1 },
          { transform: 'scaleX(0.16)', opacity: 1, offset: 0.78 },
          { transform: 'scaleX(0.05)', opacity: 0 },
        ],
        { duration: 190, easing: 'ease-in', fill: 'both' },
      )
      .finished.catch(() => {})
    if (!alive.current) return

    setPose('sit')
    await nextFrame()

    await frontRef.current
      ?.animate(
        [
          { transform: 'scaleX(0.1) scaleY(1.04)', opacity: 0 },
          { transform: 'scaleX(1.04) scaleY(0.95)', opacity: 1, offset: 0.5 },
          { transform: 'scaleX(0.99) scaleY(1.01)', offset: 0.78 },
          { transform: 'scaleX(1) scaleY(1)', opacity: 1 },
        ],
        { duration: 460, easing: 'cubic-bezier(0.22, 1, 0.3, 1)', fill: 'both' },
      )
      .finished.catch(() => {})
  }, [])

  /** Beat 3. Down from the top, one touchdown on the perch, out the right wall. */
  const leap = useCallback(
    async (g: NonNullable<ReturnType<typeof geometry>>) => {
      const layer = layerRef.current
      const perch = g.perch
      if (!layer || !perch) return

      // In through the left wall already travelling, not dropped from above —
      // he arrives from off-stage the same way he left, and the arc reads as
      // one continuous leap across the drawer rather than a fall.
      const start: Point = { x: -SIDE_W - 10, y: perch.y - g.h * 0.22 }
      const end: Point = { x: g.w + SIDE_W, y: perch.y - g.h * 0.2 }

      const path: (Point & { t: number })[] = []
      const N = 10
      for (let i = 0; i <= N; i++) {
        const s = i / N
        path.push({
          t: FALL_MS * s,
          x: start.x + (perch.x - start.x) * s,
          y: start.y + (perch.y - start.y) * fallEase(s),
        })
      }
      for (let i = 1; i <= N; i++) {
        const s = i / N
        path.push({
          t: FALL_MS + ABSORB_MS + PUSH_MS + RISE_MS * s,
          x: perch.x + (end.x - perch.x) * s,
          y: perch.y + (end.y - perch.y) * riseEase(s),
        })
      }

      // Pitch follows the path, damped — pointing where he is going without
      // swinging around like a weathervane.
      const pitch = path.map((_, i) => {
        const a = path[Math.min(i, path.length - 2)]
        const b = path[Math.min(i + 1, path.length - 1)]
        const deg = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
        return Math.max(-22, Math.min(22, deg * 0.5))
      })

      const body: Keyframe[] = []
      const head: Keyframe[] = []
      const tail: Keyframe[] = []

      const at = (t: number) => Math.min(1, Math.max(0, t / LEAP_MS))
      const push = (t: number, x: number, y: number, rot: number, sx = 1, sy = 1) => {
        const offset = at(t)
        body.push({
          offset,
          transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${sx}, ${sy})`,
          easing: 'linear',
        })
        // Head holds level against the body; tail swings the other way to
        // conserve the rotation the body is putting in.
        head.push({ offset, transform: `rotate(${(-rot * 0.72).toFixed(2)}deg)`, easing: 'linear' })
        tail.push({ offset, transform: `rotate(${(-rot * 0.9 - 6).toFixed(2)}deg)`, easing: 'linear' })
      }

      path.forEach((p, i) => {
        if (i === N) {
          // Contact. Absorb fast, hold nothing, push off in two frames.
          push(p.t, p.x, p.y, 0, 1.04, 0.95)
          push(p.t + ABSORB_MS, p.x + 3, p.y + 2, -2, 1.05, 0.94)
          push(p.t + ABSORB_MS + PUSH_MS, p.x + 8, p.y - 3, -10, 0.97, 1.05)
        } else {
          push(p.t, p.x, p.y, pitch[i])
        }
      })

      const contactAt = at(FALL_MS)
      const pushedAt = at(FALL_MS + ABSORB_MS + PUSH_MS)

      // Front legs reach for the landing, fold under on contact, trail after.
      // Back legs stay tucked on the way down and extend through the push.
      sideRef.current?.querySelector('.leg-front')?.animate(
        [
          { offset: 0, transform: 'rotate(-6deg)' },
          { offset: contactAt * 0.72, transform: 'rotate(19deg)', easing: 'ease-out' },
          { offset: contactAt, transform: 'rotate(2deg)', easing: 'ease-out' },
          { offset: pushedAt, transform: 'rotate(-14deg)', easing: 'ease-out' },
          { offset: 1, transform: 'rotate(-24deg)' },
        ],
        { duration: LEAP_MS, easing: 'linear', fill: 'both' },
      )
      sideRef.current?.querySelector('.leg-back')?.animate(
        [
          { offset: 0, transform: 'rotate(10deg)' },
          { offset: contactAt * 0.8, transform: 'rotate(-4deg)', easing: 'ease-in' },
          { offset: contactAt, transform: 'rotate(6deg)', easing: 'ease-out' },
          { offset: pushedAt, transform: 'rotate(30deg)', easing: 'ease-out' },
          { offset: 1, transform: 'rotate(20deg)' },
        ],
        { duration: LEAP_MS, easing: 'linear', fill: 'both' },
      )

      sideRef.current?.querySelector('.head-s')?.animate(head, {
        duration: LEAP_MS,
        easing: 'linear',
        fill: 'both',
      })
      sideRef.current?.querySelector('.tail-s')?.animate(tail, {
        duration: LEAP_MS,
        easing: 'linear',
        fill: 'both',
      })

      await layer
        .animate(body, { duration: LEAP_MS, easing: 'linear', fill: 'both' })
        .finished.catch(() => {})
    },
    [],
  )

  /** The whole four-beat sequence. */
  const startle = useCallback(async () => {
    const g = geometry()
    if (!g || busy.current) return
    if (performance.now() - last.current < COOLDOWN_MS) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    busy.current = true
    last.current = performance.now()

    const runY = g.home.y + FRONT_H - SIDE_H
    const offRight = { x: g.w + SIDE_W, y: runY }
    const offLeft = { x: -SIDE_W - 12, y: runY }

    try {
      // ── 1. He does not want you there ────────────────────────────────
      // A recoil before the bolt. Anticipation is what makes a fast move
      // read as a decision rather than a jump cut.
      await frontRef.current
        ?.animate(
          [
            { transform: 'translateX(0) scaleX(1)' },
            { transform: 'translateX(-3px) scaleX(0.96) scaleY(1.03)', offset: 0.55 },
            { transform: 'translateX(1px) scaleX(1.02) scaleY(0.98)' },
          ],
          { duration: GATHER_MS, easing: 'ease-out', fill: 'both' },
        )
        .finished.catch(() => {})
      if (!alive.current) return

      clearAll()
      place(g.home)
      setPose('side')
      gait('run')
      await nextFrame()
      await travel({ x: g.home.x, y: runY }, offRight, FLEE_SPEED)
      if (!alive.current) return

      // ── 2. Gone ──────────────────────────────────────────────────────
      await wait(GONE_MS)
      if (!alive.current) return

      // ── 3. The leap ──────────────────────────────────────────────────
      clearAll()
      setPose('side')
      gait('air')
      await nextFrame()
      await leap(g)
      if (!alive.current) return

      // ── 4. Home ──────────────────────────────────────────────────────
      await wait(240)
      clearAll()
      place(offLeft)
      setPose('side')
      gait('run')
      await nextFrame()
      await travel(offLeft, { x: g.home.x, y: runY }, HOME_SPEED, true)
      if (!alive.current) return

      await turnAndSit()
      place(g.home)
    } finally {
      busy.current = false
    }
  }, [geometry, clearAll, place, travel, leap, turnAndSit, gait])

  /**
   * He does this once, unprompted, shortly after you open the drawer — and
   * never again on his own. That single performance is what teaches you he is
   * there and that he reacts; repeating it on a timer would turn a character
   * into a screensaver. After this, he moves only because you came near him.
   *
   * The ref guard matters: `active` flips whenever a reply is in flight, so
   * without it the effect would re-run and he would perform again.
   */
  useEffect(() => {
    if (!active || introShown.current) return
    introShown.current = true
    const t = setTimeout(() => void startle(), 2600)
    return () => clearTimeout(t)
  }, [active, startle])

  // And whenever you get too close.
  useEffect(() => {
    if (!active) return
    const onMove = (e: PointerEvent) => {
      const bed = bedRef.current?.getBoundingClientRect()
      if (!bed) return
      const dx = e.clientX - (bed.left + bed.width / 2)
      const dy = e.clientY - (bed.top + bed.height / 2)
      if (Math.hypot(dx, dy) < STARTLE_PX) void startle()
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [active, startle, bedRef])

  return (
    <span ref={layerRef} className="cat-layer" aria-hidden="true">
      <span
        ref={sideRef}
        className="cat-pose"
        style={{ display: pose === 'side' ? 'block' : 'none' }}
      >
        <CatSide size={SIDE_W} />
      </span>
      <span
        ref={frontRef}
        className="cat-pose"
        style={{ display: pose === 'sit' ? 'block' : 'none' }}
      >
        <CatMark size={FRONT_W} />
      </span>
    </span>
  )
}
