import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { Act, Kind, Cap, Reveal } from '../components/ui'

/**
 * The act title as the process it names: three steps on one line, and a return
 * under them that carries the end back to the beginning.
 *
 * It replaces a five-across list — Draw, Build, Hold, Feel, Modify, each with a
 * sentence — that said the same thing at far greater length and only drew its
 * return on desktop. The title was already the summary of it; closing the title
 * into a loop makes the list a second telling.
 *
 * The line is drawn as you arrive, so the cycle completes itself rather than
 * being there from the start. It holds still for anyone who asked their system
 * not to animate.
 */
function Cycle() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 60%'] })
  const draw = useTransform(scrollYProgress, [0.15, 1], [0, 1])
  return (
    <div ref={ref} className="solic-cycle">
      <h2 className="sa-t-act solic-flow">
        Draw <i aria-hidden="true">→</i> Build <i aria-hidden="true">→</i> Feel
      </h2>
      {/* Down from the end of the line, back along the bottom, up into the
          start of it. preserveAspectRatio is off so the path stretches to
          whatever width and height the column gives it; the stroke is held at
          one weight regardless by vectorEffect. */}
      <svg
        viewBox="0 0 1000 120" preserveAspectRatio="none"
        className="solic-cycle-return" aria-hidden="true"
      >
        <motion.path
          d="M 990 4 C 990 112, 990 112, 900 112 L 100 112 C 10 112, 10 112, 10 16"
          fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke"
          style={reduce ? undefined : { pathLength: draw }}
        />
        <path d="M 2 30 L 10 10 L 18 30" fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* In the space the loop encloses. See .solic-cycle-label. */}
      <div className="solic-cycle-label sa-t-label text-mu">Until it feels right</div>
    </div>
  )
}

export default function Act05() {
  return (
    <Act i={4} id="prototype">
      <div className="sa-wrap">
        <div className="sa-t-label text-mu mb-6 md:mb-8">Act 05</div>
        <Cycle />
      </div>

      <div className="sa-wrap sa-g12 mt-20 md:mt-28 gap-y-10 md:gap-y-16 items-end">
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
