import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import REFS from '../lib/refs.json'

export const tilt = ([x0, y0, x1, y1]) => (Math.atan2(x1 - x0, y1 - y0) * 180) / Math.PI
export const deg = (v) => `${v < -0.05 ? '−' : v > 0.05 ? '+' : ''}${Math.abs(v).toFixed(1)}°`

/* A reference guitar reduced to its silhouette, with the three axes I drew on it. */
export function AxisGuitar({ k, name, className = '', showAngles = true }) {
  const r = REFS[k]
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 92%', 'start 40%'] })
  const draw = useTransform(scrollYProgress, [0, 1], [0.12, 1])
  const top = Math.min(...r.lines.map((l) => l[1])) - 12
  const bot = Math.max(...r.lines.map((l) => l[3])) + 12
  return (
    <figure ref={ref} className={className}>
      <svg viewBox={`-20 ${top} 1640 ${bot - top}`} className="w-full h-auto overflow-visible" role="img" aria-label={`${name} silhouette with three reference axes`}>
        <path d={r.d} fill="var(--fg)" />
        {r.lines.map((l, i) => (
          <motion.line
            key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]}
            stroke="var(--blue)" strokeWidth="11" strokeLinecap="butt" fill="none"
            style={reduce ? undefined : { pathLength: draw }}
          />
        ))}
      </svg>
      <figcaption className="flex flex-wrap justify-between gap-x-4 gap-y-1 mt-2">
        <span className="text-[14px]">{name}</span>
        {showAngles && (
          <span className="sa-t-label text-mu sa-t-num">{r.lines.map((l) => deg(tilt(l))).join('  ·  ')}</span>
        )}
      </figcaption>
    </figure>
  )
}

/* Three short strokes showing only the axis angles, centred. Used for comparisons. */
export function AxisGlyph({ angles, className = '', color = 'var(--blue)', w = 220, h = 120 }) {
  const xs = [w * 0.2, w * 0.5, w * 0.8]
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} aria-hidden="true">
      <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke="currentColor" strokeOpacity=".25" strokeDasharray="3 4" />
      {angles.map((a, i) => {
        const t = (a * Math.PI) / 180, L = h * 0.46
        const dx = Math.sin(t) * L, dy = Math.cos(t) * L
        return <line key={i} x1={xs[i] - dx} y1={h / 2 - dy} x2={xs[i] + dx} y2={h / 2 + dy} stroke={color} strokeWidth="5" />
      })}
    </svg>
  )
}
