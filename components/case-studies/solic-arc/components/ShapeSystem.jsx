import { useEffect, useMemo, useRef, useState } from 'react'
import { useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import { interpolate } from 'flubber'
import RAW from '../lib/iterations.json'
import { smooth, clamp01, lerp } from '../lib/acts'
import { NC } from './ui'

/* Where the neck heel starts and where the neck centreline runs, per study (design-file units).
   Used to align every body on the same heel and string axis so the morph shows only shape change. */
const ANCHOR = { 1: [561.0, 283.1], 2: [565.5, 264.6], 3: [538.0, 268.2], 4: [557.0, 265.6], 6: [546.3, 265.1], 7: [523.8, 265.1], 8: [524.5, 265.1] }

const shift = (d, dx, dy) =>
  d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${(+x + dx).toFixed(1)},${(+y + dy).toFixed(1)}`)

const V = RAW.map((v, i) => {
  const [hx, cy] = ANCHOR[v.id]
  return { ...v, label: `R0${i + 1}`, d: shift(v.outline, -hx, -cy) }
})
const fwOf = (i) => (V[i].fw ? V[i].fw : fwOf(i - 1))
const widths = (fw) => [0, 1, 2].map((j) => fw.red[j][3] + fw.red[j + 3][3])

const INTRO = [
  ['A silhouette on its own', 'R01, the first framework study in my design file. By itself it is just a drawing. Nothing says which parts of it matter.'],
  ['Blue: reference axes', 'Three axes across the body, perpendicular to the strings, after Diego Fabián: at the tail, the waist and the horns. Their tilt sets how the body leans.'],
  ['Red: the extrema', 'Each column runs from the centreline to where a curve peaks or dips. Their positions and lengths set the proportions and the visual balance.'],
  ['Now a body is a set of numbers', 'Three angles and three widths. Change them, redraw the silhouette, look at it again. That is the loop.'],
]
const STEPS = [
  null,
  ['Extrema slide toward the tail', 'All three upper extrema move left. The lower bout narrows from 600 to 572 units. The axes stay put.'],
  ['A freehand check', 'No framework in the file for this study. The body shortens from 854 to 808 units.'],
  ['The waist axis stands up', 'From −8.0° to +1.1°, almost vertical. The tail axis eases from 22.2° to 18.8°.'],
  ['Extrema move toward the neck', 'The waist narrows from 389 to 371 units and the horns from 505 to 468.'],
  ['Same extrema, new axes', 'The waist axis tilts back to −5.6° and the tail axis opens to 22.0°.'],
  ['The chosen design', 'Tail axis 23.8°, waist −7.2°, horns −16.1°. The lower-bout extremum moves 59 units toward the neck. This is the body that went to CAD.'],
]

const SEG0 = 0.25, SEG = 0.125, MORPH = 0.07
const AXES = ['Tail', 'Waist', 'Horns']
const EXT = ['Lower bout', 'Waist', 'Horns']
const fmtDeg = (a) => `${a < -0.05 ? '−' : a > 0.05 ? '+' : ''}${Math.abs(a).toFixed(1)}°`

export default function ShapeSystem() {
  const sec = useRef(null)
  const body = useRef(null), ghost = useRef(null), fwG = useRef(null), msg = useRef(null)
  const blues = useRef([]), reds = useRef([]), angT = useRef([]), angG = useRef([]), widT = useRef([]), dimT = useRef(null), clRef = useRef(null)
  const [cap, setCap] = useState(0) // 0..3 intro, 4.. versions
  const [ver, setVer] = useState(0)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: sec, offset: ['start start', 'end end'] })

  const interps = useMemo(
    () => V.slice(1).map((v, i) => interpolate(V[i].d, v.d, { maxSegmentLength: 5 })),
    [],
  )

  const render = (p) => {
    let from = 0, to = 0, t = 0, intro = 1
    if (p < SEG0) { intro = p / SEG0 }
    else {
      const k = Math.min(6, Math.floor((p - SEG0) / SEG) + 1)
      const local = p - SEG0 - (k - 1) * SEG
      from = k - 1; to = k
      t = reduce ? (local > MORPH / 2 ? 1 : 0) : smooth(clamp01(local / MORPH))
    }
    // body
    body.current.setAttribute('d', from === to ? V[0].d : t >= 1 ? V[to].d : t <= 0 ? V[from].d : interps[from](t))
    ghost.current.setAttribute('d', V[from].d)
    ghost.current.style.opacity = from === to ? 0 : String(Math.min(1, t * 3) * 0.9)
    // framework
    const A = fwOf(from), B = fwOf(to)
    const visA = !!V[from].fw, visB = !!V[to].fw
    const vis = lerp(visA ? 1 : 0.1, visB ? 1 : 0.1, t)
    fwG.current.style.opacity = String(vis)
    msg.current.style.opacity = vis < 0.35 ? '1' : '0'
    const drawBlue = reduce ? (intro > 0.25 ? 1 : 0) : smooth(clamp01((intro - 0.24) / 0.28))
    const growRed = reduce ? (intro > 0.52 ? 1 : 0) : smooth(clamp01((intro - 0.52) / 0.28))
    const cl = lerp(A.red[3][1], B.red[3][1], t)
    clRef.current.setAttribute('y1', cl); clRef.current.setAttribute('y2', cl)
    const ang = []
    A.blue.forEach((a, j) => {
      const b = B.blue[j]
      const x1 = lerp(a[0], b[0], t), y1 = lerp(a[1], b[1], t), x2 = lerp(a[2], b[2], t), y2 = lerp(a[3], b[3], t)
      const el = blues.current[j]
      // draw from the centreline outwards
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
      el.setAttribute('x1', lerp(mx, x1, drawBlue)); el.setAttribute('y1', lerp(my, y1, drawBlue))
      el.setAttribute('x2', lerp(mx, x2, drawBlue)); el.setAttribute('y2', lerp(my, y2, drawBlue))
      ang.push((Math.atan2(x2 - x1, y2 - y1) * 180) / Math.PI)
    })
    A.red.forEach((a, j) => {
      const b = B.red[j]
      const x = lerp(a[0], b[0], t), y = lerp(a[1], b[1], t), w = lerp(a[2], b[2], t), h = lerp(a[3], b[3], t)
      const top = j < 3
      const hh = h * growRed
      const el = reds.current[j]
      el.setAttribute('x', x); el.setAttribute('width', w)
      el.setAttribute('y', top ? y + h - hh : cl + (y - cl)); el.setAttribute('height', Math.max(0, hh))
    })
    // readouts
    const wa = widths(A), wb = widths(B)
    ang.forEach((a, j) => {
      angT.current[j].textContent = fmtDeg(a)
      angG.current[j].setAttribute('transform', `rotate(${-a} 20 20)`)
    })
    wa.forEach((w, j) => { widT.current[j].textContent = Math.round(lerp(w, wb[j], t)) })
    dimT.current.textContent = `${Math.round(lerp(V[from].w, V[to].w, t))} × ${Math.round(lerp(V[from].h, V[to].h, t))}`
    // discrete state
    const c = p < SEG0 ? Math.min(3, Math.floor(intro * 4)) : 3 + to
    const v = p < SEG0 ? 0 : t > 0.5 ? to : from
    setCap((o) => (o === c ? o : c))
    setVer((o) => (o === v ? o : v))
  }

  useMotionValueEvent(scrollYProgress, 'change', render)
  useEffect(() => { render(scrollYProgress.get()) }, []) // eslint-disable-line

  const [title, text] = cap < 4 ? INTRO[cap] : STEPS[cap - 3]
  const showRead = cap >= 3

  return (
    <section ref={sec} className="relative" style={{ height: '720vh' }} aria-label="Interactive: seven body studies generated from the framework">
      <div className="sticky top-0 h-[100svh] overflow-hidden flex flex-col pt-[64px] md:pt-[78px] pb-5 md:pb-8">
        <div className="sa-wrap flex-1 min-h-0 flex flex-col">
          {/* header row */}
          <div className="sa-g12 gap-y-3 items-start">
            <div className="col-span-5 md:col-span-3">
              <div className="sa-t-mono sa-t-num font-medium leading-[0.85] tracking-[-0.04em] text-[clamp(52px,7.4vw,124px)]" aria-live="polite">{V[ver].label}</div>
              <ol className="flex gap-1.5 mt-3" aria-label="Studies">
                {V.map((v, i) => (
                  <li key={v.id} className="flex-1 max-w-[28px]">
                    <div className="h-[3px]" style={{ background: 'var(--fg)', opacity: i === ver ? 1 : i < ver ? 0.4 : 0.14 }} />
                    <div className="sa-t-label text-[9px] mt-1 text-mu hidden md:block sa-t-num">{String(i + 1).padStart(2, '0')}</div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="col-span-7 md:col-start-5 md:col-span-7 lg:col-span-6 min-h-[118px] md:min-h-[130px]">
              <p className="sa-t-sub text-[clamp(20px,2vw,32px)]">{title}</p>
              <p className="text-[14.5px] md:text-[16px] leading-relaxed mt-2 md:mt-3 max-w-[40em] text-mu">{text}</p>
            </div>
          </div>

          {/* drawings */}
          <div className="flex-1 min-h-0 grid grid-cols-12 gap-x-[clamp(12px,1.6vw,28px)] gap-y-2 items-center mt-2">
            <div className="col-span-8 md:col-span-5 h-full min-h-0 flex flex-col justify-center order-2 md:order-1">
              <div className="sa-t-label text-mu mb-2">Framework</div>
              <div className="relative">
                <svg viewBox="-90 -40 1030 710" className="w-full h-auto max-h-[34vh] md:max-h-[46vh] overflow-visible">
                  <rect x="0" y="0" width="847" height="628" fill="var(--fg)" fillOpacity=".055" stroke="var(--rule)" />
                  <g ref={fwG}>
                    <line ref={clRef} x1="0" x2="847" y1="282" y2="282" stroke="var(--fg)" strokeOpacity=".35" strokeDasharray="6 8" strokeWidth="2" />
                    {[0, 1, 2, 3, 4, 5].map((j) => (
                      <rect key={j} ref={(el) => (reds.current[j] = el)} fill="var(--red)" />
                    ))}
                    {[0, 1, 2].map((j) => (
                      <line key={j} ref={(el) => (blues.current[j] = el)} stroke="var(--blue)" strokeWidth="11" />
                    ))}
                  </g>
                </svg>
                <div ref={msg} className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity">
                  <span className="sa-t-label text-mu px-2 text-center">No framework drawn<br />for this study</span>
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-7 h-full min-h-0 flex flex-col justify-center order-1 md:order-2">
              <div className="sa-t-label text-mu mb-2 hidden md:block">Silhouette</div>
              <svg viewBox="-640 -330 1180 690" className="w-full h-auto max-h-[30vh] md:max-h-[52vh]" role="img" aria-label={`Body outline, study ${V[ver].label}`}>
                <defs>
                  <linearGradient id="neckfade" x1="0" x2="1">
                    <stop offset="0" stopColor="var(--fg)" stopOpacity=".9" />
                    <stop offset="1" stopColor="var(--fg)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="-640" x2="540" y1="0" y2="0" stroke="var(--fg)" strokeOpacity=".3" strokeDasharray="6 8" strokeWidth="2" />
                <rect x="-10" y="-46" width="550" height="92" fill="url(#neckfade)" />
                <path ref={body} fill="var(--fg)" />
                <path ref={ghost} fill="none" stroke="var(--fg)" strokeOpacity=".55" strokeWidth="2.5" strokeDasharray="10 8" style={{ opacity: 0 }} />
              </svg>
            </div>
          </div>

          {/* readouts */}
          <div className={`sa-g12 gap-y-4 mt-3 md:mt-4 transition-opacity duration-500 ${showRead ? 'opacity-100' : 'opacity-40'}`}>
            <div className="col-span-12 md:col-span-5 grid grid-cols-3 gap-3 sa-rule pt-3">
              {AXES.map((a, j) => (
                <div key={a} className="flex items-center gap-2 min-w-0">
                  <svg viewBox="0 0 40 40" className="w-6 h-6 md:w-8 md:h-8 shrink-0" aria-hidden="true">
                    <g ref={(el) => (angG.current[j] = el)}><line x1="20" y1="3" x2="20" y2="37" stroke="var(--blue)" strokeWidth="4" /></g>
                  </svg>
                  <div className="min-w-0">
                    <div className="sa-t-label text-mu text-[9.5px] md:text-[11px]">{a} axis</div>
                    <div ref={(el) => (angT.current[j] = el)} className="sa-t-mono sa-t-num text-[14px] md:text-[17px]">0°</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-span-12 md:col-span-7 grid grid-cols-4 gap-3 sa-rule pt-3">
              {EXT.map((a, j) => (
                <div key={a} className="min-w-0">
                  <div className="sa-t-label text-mu text-[9.5px] md:text-[11px] flex items-center gap-1.5"><span className="w-[5px] h-3 shrink-0" style={{ background: 'var(--red)' }} />{a}</div>
                  <div ref={(el) => (widT.current[j] = el)} className="sa-t-mono sa-t-num text-[14px] md:text-[17px]">0</div>
                </div>
              ))}
              <div className="min-w-0">
                <div className="sa-t-label text-mu text-[9.5px] md:text-[11px]">Body</div>
                <div ref={dimT} className="sa-t-mono sa-t-num text-[14px] md:text-[17px] whitespace-nowrap">0</div>
              </div>
            </div>
          </div>
          <p className="sa-t-label text-mu mt-3 text-[9.5px] md:text-[10.5px] normal-case tracking-[0.04em] leading-snug">
            The last stage of iteration, in the order the studies sit in the design file. Widths and lengths in drawing units. <NC>what prompted each change</NC>
          </p>
        </div>
      </div>
    </section>
  )
}
