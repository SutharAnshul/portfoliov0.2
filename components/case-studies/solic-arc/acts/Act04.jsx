import { Act, Opener, Label, Kind, Cap, Img } from '../components/ui'
import ShapeSystem from '../components/ShapeSystem'
import { AxisGlyph } from '../components/Axis'

const SKETCHES = [
  ['sk_v1', 'Version 1'],
  ['sk_v3', 'Version 3'],
  ['sk_v7', 'Version 7'],
  ['sk_v12', 'Version 12'],
]
const HEADS = [
  ['tele', 'Tele'], ['strat', 'Strat'], ['suhr', 'Suhr'],
  ['custom1', 'Custom 1'], ['custom2', 'Custom 2'], ['custom3', 'Custom 3'],
]

function Legend() {
  const items = [
    [<svg key="b" viewBox="0 0 40 60" className="w-8 h-12"><line x1="8" y1="56" x2="32" y2="4" stroke="var(--blue)" strokeWidth="5" /></svg>, 'Blue lines', 'Reference axes across the body, perpendicular to the strings: tail, waist, horns. Their tilt sets how the body leans.'],
    [<svg key="r" viewBox="0 0 40 60" className="w-8 h-12"><line x1="0" y1="34" x2="40" y2="34" stroke="currentColor" strokeOpacity=".4" strokeDasharray="3 3" /><rect x="8" y="6" width="10" height="28" fill="var(--red)" /><rect x="22" y="34" width="10" height="20" fill="var(--red)" /></svg>, 'Red columns', 'The extrema. Each runs from the centreline to where a curve peaks or dips. Positions and lengths set proportion and balance.'],
    [<svg key="s" viewBox="0 0 40 60" className="w-8 h-12"><path d="M4 14 C 14 4, 20 22, 36 12 L 34 30 C 26 34, 30 44, 36 50 C 22 58, 12 48, 4 54 Z" fill="currentColor" /></svg>, 'Silhouette', 'The outline drawn through them. Change a number and the outline changes with it.'],
  ]
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[clamp(16px,3vw,48px)] gap-y-8">
      {items.map(([g, t, d]) => (
        <div key={t} className="sa-rule pt-5 flex gap-4">
          <div className="shrink-0">{g}</div>
          <div><div className="sa-t-label mb-2">{t}</div><p className="text-[15px] leading-relaxed text-mu">{d}</p></div>
        </div>
      ))}
    </div>
  )
}

export default function Act04() {
  return (
    <Act i={3} id="shape">
      <Opener i={3} lede="I wasn’t drawing random guitar shapes. I was building a system for exploring them." />

      <div className="sa-wrap mt-20 md:mt-28"><Legend /></div>

      {/* Calibrating on known guitars */}
      <div className="sa-wrap mt-28 md:mt-40">
        <div className="sa-g12 gap-y-6 items-end">
          <div className="col-span-12 md:col-span-6">
            <Kind className="mb-6">Method · after Diego Fabián</Kind>
            <p className="sa-t-sec">First, test the framework on guitars I already knew.</p>
          </div>
          <p className="sa-t-body col-span-12 md:col-start-8 md:col-span-5">On a Stratocaster and on a headless ergonomic design, the same three axes and six columns capture the character of each body. Then the same framework goes onto my own outline.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[clamp(16px,2.4vw,40px)] gap-y-10 mt-14">
          {[['fw_strat', 'Stratocaster'], ['fw_strandberg', 'Headless ergonomic design'], ['fw_own', 'My outline']].map(([n, t]) => (
            <figure key={n}>
              <Img name={n} alt={`${t} with blue axes and red extrema columns drawn over it, and the same framework extracted below.`} imgClass="mix-blend-multiply object-contain" className="aspect-[1.38] flex items-start" />
              <figcaption className="sa-t-label text-mu mt-3">{t}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* The sketch search */}
      <div className="sa-wrap mt-32 md:mt-48">
        <div className="sa-g12 gap-y-6">
          <div className="col-span-12 md:col-span-7">
            <Kind className="mb-6">Iteration · sketches</Kind>
            <p className="sa-t-sec">More than ten iterations of sketching, prototyping and testing.</p>
          </div>
        </div>
        <div className="mt-14 -mx-[var(--sa-gutter)] px-[var(--sa-gutter)] overflow-x-auto snap-x snap-mandatory [scrollbar-width:thin]">
          <ol className="flex md:grid md:grid-cols-4 gap-4 md:gap-6 min-w-max md:min-w-0">
            {SKETCHES.map(([n, t], i) => (
              <li key={n} className="snap-start w-[78vw] sm:w-[46vw] md:w-auto">
                <div className="sa-t-mono sa-t-num text-[13px] mb-3 flex justify-between"><span>{t}</span><span className="text-mu">{['early', '', '', 'late'][i]}</span></div>
                <Img name={n} alt={`${t} sketch of the body outline.`} imgClass="mix-blend-multiply object-contain" className="aspect-[853/368]" />
              </li>
            ))}
          </ol>
        </div>
        <div className="sa-g12 mt-10 gap-y-4">
          <div className="col-span-12 md:col-start-6 md:col-span-7 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-x-8 gap-y-3 sa-rule pt-5">
            <Kind className="md:pt-1">Observation</Kind>
            <p className="sa-t-body">The early versions look like ergonomic guitars: angular, with the horns pulled far apart. By Version 12 the outline has come back toward the Stratocaster, with a sculpted lower bout.</p>
          </div>
        </div>
      </div>

      <div className="sa-wrap mt-32 md:mt-48 sa-g12 gap-y-6">
        <div className="col-span-12 md:col-span-8">
          <Kind className="mb-6">Iteration · framework studies</Kind>
          <p className="sa-t-act">Seven studies. One body.</p>
        </div>
        <p className="sa-t-body col-span-12 md:col-start-8 md:col-span-5 md:-mt-2">The last stage of iteration happened inside the framework. Scroll slowly: the silhouette on the right follows the numbers on the left. The last study, R07, is the one that went to CAD.</p>
      </div>

      <div className="mt-10 md:mt-14">
        <ShapeSystem />
      </div>

      {/* Payoff: heritage + ergonomics in numbers */}
      <div className="sa-wrap mt-24 md:mt-36">
        <Kind className="mb-8">Measurement · axis tilt</Kind>
        <p className="sa-t-sec max-w-[22ch]">Ergonomic at the tail. Heritage at the horns.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-[clamp(16px,3vw,48px)] gap-y-10 mt-14">
          {[
            ['Stratocaster', [-2.0, 0.0, -17.1]],
            ['Solic Arc · R07', [23.8, -7.2, -16.1]],
            ['Headless design', [28.7, -11.8, -19.4]],
          ].map(([n, a], i) => (
            <div key={n} className="sa-rule pt-5">
              <AxisGlyph angles={a} className="w-full h-auto" w={300} h={150} color={i === 1 ? 'var(--blue)' : 'var(--fg)'} />
              <div className="flex justify-between items-baseline mt-4 gap-4">
                <span className={`text-[16px] ${i === 1 ? 'font-medium' : ''}`}>{n}</span>
                <span className="sa-t-mono sa-t-num text-[13px] text-mu">{a.map((v) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1)}°`).join(' · ')}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="sa-g12 mt-10 gap-y-4">
          <p className="sa-t-body col-span-12 md:col-span-6">The tail axis of the chosen study leans 23.8°, close to the headless design’s 28.7°. Its horn axis, at −16.1°, sits next to the Stratocaster’s −17.1°.</p>
          <div className="col-span-12 md:col-start-8 md:col-span-5 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-x-6 gap-y-3">
            <Kind className="md:pt-1">Interpretation</Kind>
            <p className="text-[16px] leading-relaxed">The tail borrows its lean from ergonomic guitars. The horns keep a heritage angle.</p>
          </div>
        </div>
        <Cap>Angles measured from my own axis drawings: the reference guitars on the research board and the R07 framework. Tail · waist · horns.</Cap>
      </div>

      {/* Headstocks */}
      <div className="sa-wrap mt-32 md:mt-48">
        <div className="sa-g12 gap-y-6 items-end">
          <div className="col-span-12 md:col-span-7">
            <Kind className="mb-6">Iteration · headstock</Kind>
            <p className="sa-t-sec">The same question at the other end of the neck.</p>
          </div>
          <p className="sa-t-body col-span-12 md:col-start-9 md:col-span-4">Which parts should stay familiar, and which should change? I drew the chosen body with three established headstocks and three of my own.</p>
        </div>
        <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-x-[clamp(12px,2.4vw,40px)] gap-y-8">
          {HEADS.map(([k, t], i) => (
            <figure key={k} className={`sa-rule pt-3 ${i === 3 ? 'md:col-start-1' : ''}`}>
              <div className="flex justify-between sa-t-label"><span>{t}</span><span className="text-mu">{i < 3 ? 'Established' : 'Mine'}</span></div>
              <Img name={`hs_${k}`} alt={`${t} headstock outline on the Solic Arc neck.`} className="mt-2 aspect-[800/360]" imgClass="object-contain" />
            </figure>
          ))}
        </div>
        <div className="sa-g12 mt-12 gap-y-8">
          <div className="col-span-12 md:col-span-6 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-x-6 gap-y-3 sa-rule pt-5">
            <Kind className="md:pt-1">Evidence</Kind>
            <p className="text-[16px] leading-relaxed">12 of the 14 survey players who answered the headstock question preferred a headstock, for the traditional look and feel.</p>
          </div>
          <div className="col-span-12 md:col-start-8 md:col-span-5 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-x-6 gap-y-3 sa-rule pt-5">
            <Kind className="md:pt-1">Decision</Kind>
            <p className="text-[16px] leading-relaxed">The finished guitar keeps a Strat-style headstock. The ergonomic work stays in the body and the neck.</p>
          </div>
        </div>
      </div>
      <div className="sa-pause" />
    </Act>
  )
}
