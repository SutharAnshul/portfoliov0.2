import { createContext, useContext, useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import manifest from '../lib/manifest.json'
import { actVars, ACTS } from '../lib/acts'

/* Where the case-study images are served from. Set once on <SolicArc imgBase="..."/>. */
export const ImgBase = createContext('img/')
export const useSrc = () => {
  const base = useContext(ImgBase)
  return (name) => `${base}${name}.webp`
}

/* Photograph or drawing from the supplied material. Width/height come from the manifest. */
export function Img({ name, alt, className = '', imgClass = '', eager = false, style, imgStyle }) {
  const src = useSrc()
  const [w, h] = manifest[name] || [1600, 1000]
  return (
    <div className={className} style={style}>
      <img
        src={src(name)} alt={alt} width={w} height={h}
        loading={eager ? 'eager' : 'lazy'} decoding="async"
        className={`w-full h-full ${imgClass}`} style={imgStyle}
      />
    </div>
  )
}

/* Image that uncovers from a mask as it enters. Always visible at rest. */
export function Reveal({ name, alt, className = '', imgClass = 'object-cover', from = 'bottom', eager, imgStyle, parallax = 0 }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const src = useSrc()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 100%', 'start 45%'] })
  const inset = useTransform(scrollYProgress, [0, 1], [14, 0])
  const clip = useTransform(inset, (v) =>
    from === 'left' ? `inset(0 ${v}% 0 0)` : from === 'right' ? `inset(0 0 0 ${v}%)` : `inset(${v}% 0 0 0)`)
  const { scrollYProgress: sp } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(sp, [0, 1], [`${-parallax}%`, `${parallax}%`])
  const [w, h] = manifest[name] || [1600, 1000]
  return (
    <motion.div ref={ref} className={`overflow-hidden ${className}`} style={reduce ? undefined : { clipPath: clip }}>
      <motion.img
        src={src(name)} alt={alt} width={w} height={h}
        loading={eager ? 'eager' : 'lazy'} decoding="async"
        className={`w-full h-full ${imgClass}`}
        style={{ ...(imgStyle || {}), ...(reduce || !parallax ? {} : { y, scale: 1 + parallax / 50 }) }}
      />
    </motion.div>
  )
}

export const Label = ({ children, className = '' }) => (
  <div className={`sa-t-label text-mu ${className}`}>{children}</div>
)

/* Evidence type tag: separates research evidence, interpretation, intent and feedback. */
export const Kind = ({ children, className = '' }) => (
  <div className={`sa-t-label ${className}`} style={{ color: 'var(--fg)' }}>
    <span aria-hidden="true" className="inline-block w-[7px] h-[7px] mr-2 align-[1px]" style={{ background: 'var(--fg)' }} />
    {children}
  </div>
)

/**
 * Whether the open facts are shown on the page.
 *
 * The export ships four of these — the scallops on the finished guitar, the
 * final weight in two places — drawn deliberately, so nobody forgets they are
 * unanswered. They are working marks, and the record is published now, so they
 * are off. The tags stay in the acts rather than being deleted, and the
 * questions stay in Coda's open list where they read as work still to do
 * rather than as a gap in the page. Set this to true to see them again.
 */
export const SHOW_NC = false

export const NC = ({ children }) =>
  SHOW_NC ? <span className="sa-nc">NEEDS CONFIRMATION{children ? `: ${children}` : ''}</span> : null

export const Cap = ({ children, className = '' }) => <p className={`sa-t-cap mt-4 ${className}`}>{children}</p>

/* An act owns its text colours; the fixed background layer handles the field colour. */
export function Act({ i, id, children, className = '' }) {
  return (
    <section data-act={i} id={id} style={actVars(i)} className={`relative ${className}`}>
      {children}
    </section>
  )
}

/* Chapter card: act number + title. `align` varies the composition per act. */
export function Opener({ i, align = 'left', lede, children }) {
  const a = ACTS[i]
  const al = align === 'right' ? 'md:col-start-4 md:col-span-9 md:text-right' : align === 'center' ? 'md:col-start-2 md:col-span-10 text-left md:text-center' : 'md:col-span-10'
  return (
    <div className="sa-wrap sa-g12">
      <div className={`col-span-12 ${al}`}>
        <div className="sa-t-label text-mu mb-6 md:mb-8 sa-t-num">Act {a.n}</div>
        <h2 className="sa-t-act">{children || a.title}</h2>
        {lede && <p className={`sa-t-body mt-8 md:mt-10 text-mu ${align === 'right' ? 'md:ml-auto' : align === 'center' ? 'md:mx-auto' : ''}`}>{lede}</p>}
      </div>
    </div>
  )
}
