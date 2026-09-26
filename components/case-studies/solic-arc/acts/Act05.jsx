import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { Act, Kind, Cap, Reveal } from '../components/ui'

const LOOP = [
  ['Draw', 'A silhouette from the framework, printed at full size.'],
  ['Build', 'Cut from thermocol with a cutter, shaped with sandpaper.'],
  ['Hold', 'Sit with it and hold it the way you would hold a guitar.'],
  ['Feel', 'Size, depth, body contact, comfort in the hands.'],
  ['Modify', 'If it felt wrong, back to the geometry for another version.'],
]

function Loop() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 45%'] })
  const draw = useTransform(scrollYProgress, [0.2, 1], [0, 1])
  return (
    <div ref={ref} className="relative">
      <ol className="grid grid-cols-1 md:grid-cols-5 gap-y-8 md:gap-x-4">
        {LOOP.map(([w, d], i) => (
          <li key={w} className="relative md:pr-4">
            <div className="flex items-baseline gap-3">
              <span className="font-display font-bold tracking-[-0.045em] leading-[0.9] text-[clamp(38px,4.4vw,80px)]">{w}</span>
              {i < 4 && <span aria-hidden="true" className="sa-t-mono text-[clamp(20px,2vw,32px)] opacity-70 md:hidden">↓</span>}
              {i < 4 && <span aria-hidden="true" className="sa-t-mono text-[clamp(20px,2vw,32px)] opacity-70 hidden md:inline absolute right-0 top-[0.35em]">→</span>}
            </div>
            <p className="text-[15px] leading-relaxed mt-3 md:mt-4 max-w-[22em] text-mu">{d}</p>
          </li>
        ))}
      </ol>
      {/* the return path: modify feeds the next drawing */}
      <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="hidden md:block w-full h-[90px] mt-6 overflow-visible" aria-hidden="true">
        <motion.path
          d="M 900 6 C 900 110, 900 110, 700 110 L 300 110 C 100 110, 100 110, 100 14"
          fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"
          style={reduce ? undefined : { pathLength: draw }}
        />
        <path d="M 92 26 L 100 10 L 108 26" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="hidden md:flex justify-center -mt-[52px]"><span className="sa-t-label px-3" style={{ background: 'transparent' }}>Next version</span></div>
      <p className="md:hidden sa-t-label mt-6">↺ Back to Draw</p>
    </div>
  )
}

export default function Act05() {
  return (
    <Act i={4} id="prototype">
      <div className="sa-wrap sa-g12">
        <div className="col-span-12">
          <div className="sa-t-label text-mu mb-6 md:mb-8">Act 05</div>
          <h2 className="sa-t-act">Draw <span className="opacity-60">→</span> Build <span className="opacity-60">→</span> Feel</h2>
        </div>
      </div>

      <div className="sa-wrap sa-g12 mt-16 md:mt-24 gap-y-8">
        <p className="sa-t-sec col-span-12 md:col-span-9">A guitar can look right on screen and still feel wrong the moment it meets the body.</p>
      </div>

      <div className="sa-wrap mt-20 md:mt-28"><Loop /></div>

      {/* In his words */}
      <div className="sa-wrap sa-g12 mt-28 md:mt-40 gap-y-8">
        <blockquote className="col-span-12 md:col-start-3 md:col-span-9">
          <p className="font-serif italic text-[clamp(34px,4.4vw,76px)] leading-[1.02] tracking-[-0.01em]">
            “This was the first time I could see my guitar taking shape in my hands.”
          </p>
          <footer className="sa-t-label mt-6 opacity-80">From my project notes · printed sketch, thermocol, a cutter, sandpaper</footer>
        </blockquote>
      </div>

      {/* Prototypes, growing */}
      <div className="sa-wrap mt-28 md:mt-40">
        <div className="sa-g12 gap-y-6 items-end">
          <div className="col-span-12 md:col-span-6">
            <Kind className="mb-6">Physical prototypes</Kind>
            <p className="sa-t-sec">Five full-scale thermocol bodies. That’s all of them.</p>
          </div>
          <p className="sa-t-body col-span-12 md:col-start-8 md:col-span-5">Each one tested depth, comfort and feel against a real body: size, contact, sitting position, proportion, how it sat in the hands. None of this was a formal test. It was physical prototyping and ergonomic evaluation, one version at a time.</p>
        </div>
      </div>

      <div className="sa-wrap sa-g12 mt-16 md:mt-24 gap-y-10 md:gap-y-16 items-end">
        <figure className="col-span-8 md:col-span-4">
          <Reveal name="proto_2" alt="Thermocol prototype body on a dark stand." className="aspect-[539/416]" />
        </figure>
        <figure className="col-span-10 col-start-3 md:col-start-6 md:col-span-6">
          <Reveal name="proto_3" alt="Thermocol prototype body with two pickup routes, on a dark wooden surface." className="aspect-[541/415]" from="right" />
        </figure>
        <figure className="col-span-12 md:col-start-2 md:col-span-7">
          <Reveal name="proto_4" alt="Thermocol prototype body with three pickup routes and control holes." className="aspect-[622/457]" />
        </figure>
        <figure className="col-span-12 md:col-start-4 md:col-span-9">
          <Reveal name="proto_1" alt="Thermocol prototype with a contour carved into its top edge." className="aspect-[622/458]" from="right" />
          <Cap>A contour carved into the top edge.</Cap>
        </figure>
      </div>

      <figure className="mt-16 md:mt-24">
        <Reveal name="proto_5" parallax={3} alt="The favoured thermocol prototype, lit warmly against a dark background." className="w-full aspect-[1167/622] max-h-[92vh]" imgClass="object-cover" />
        <div className="sa-wrap sa-g12 mt-6 gap-y-3">
          <Kind className="col-span-12 md:col-span-3">Observed feedback · informal</Kind>
          <p className="col-span-12 md:col-span-7 text-[16px] leading-relaxed">In informal sessions, guitarists from Octaves, IIT Guwahati’s music club, found this shape the most comfortable in flamenco and classical playing positions.</p>
        </div>
      </figure>

      <div className="sa-wrap sa-g12 mt-28 md:mt-40">
        <p className="sa-t-act col-span-12 md:col-start-4 md:col-span-9">The screen wasn’t the final judge. The body was.</p>
      </div>
      <div className="sa-pause" />
    </Act>
  )
}
