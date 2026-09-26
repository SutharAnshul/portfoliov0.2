import { Act, Opener, Label, Kind, Cap, Reveal } from '../components/ui'

const N = 102

/* ---------- small, honest charts ---------- */
function Stack({ parts, className = '' }) {
  return (
    <div className={className}>
      <div className="flex h-3 w-full gap-[2px]" role="img" aria-label={parts.map((p) => `${p[0]} ${p[1]}`).join(', ')}>
        {parts.map(([l, v, o], i) => (
          <div key={l} style={{ flexGrow: v, background: 'var(--fg)', opacity: o ?? (i === 0 ? 1 : 0.28) }} />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-[13.5px] text-mu sa-t-num">
        {parts.map(([l, v]) => <li key={l}><span className="text-fg">{v}</span> {l}</li>)}
      </ul>
    </div>
  )
}

function Bars({ rows, first }) {
  return (
    <ul className="flex flex-col gap-3.5 sa-t-num">
      {rows.map(([l, v], i) => (
        <li key={l} className="grid grid-cols-[minmax(0,1fr)_2.2rem] items-center gap-x-3 gap-y-1">
          <div className="text-[14.5px] leading-tight col-span-2">{l}</div>
          <div className="h-2.5 relative" style={{ background: 'var(--rule)' }}>
            <div className="absolute inset-y-0 left-0" style={{ width: `${(v / N) * 100}%`, background: first && i === 0 ? 'transparent' : 'var(--fg)', border: first && i === 0 ? '1px solid var(--fg)' : 0 }} />
          </div>
          <div className="sa-t-mono text-[13px] text-right">{v}</div>
        </li>
      ))}
    </ul>
  )
}

function Dots() {
  const cats = [['Advanced / professional, 5+ years', 70, 1], ['Intermediate, 2–5 years', 23, 0.45], ['Beginner, 0–2 years', 7, 0.18], ['Described it in their own words', 2, 0]]
  const dots = cats.flatMap(([l, v, o]) => Array.from({ length: v }, () => o))
  return (
    <div>
      <div className="grid grid-cols-[repeat(17,minmax(0,1fr))] gap-[5px] max-w-[520px]" role="img" aria-label="102 respondents: 70 advanced or professional, 23 intermediate, 7 beginner, 2 other">
        {dots.map((o, i) => (
          <span key={i} className="aspect-square rounded-full" style={{ background: o ? 'var(--fg)' : 'transparent', opacity: o || 1, border: o ? 0 : '1px solid var(--fg)' }} />
        ))}
      </div>
      <ul className="mt-5 flex flex-col gap-1.5 text-[14px] sa-t-num">
        {cats.map(([l, v, o]) => (
          <li key={l} className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: o ? 'var(--fg)' : 'transparent', opacity: o || 1, border: o ? 0 : '1px solid var(--fg)' }} />
            <span className="sa-t-mono w-6 text-right">{v}</span><span className="text-mu">{l}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Scale() {
  const v = [9, 11, 36, 27, 19], max = 36
  return (
    <div>
      <div className="flex items-end gap-3 h-[150px]" role="img" aria-label="Importance of light weight, 1 to 5: 9, 11, 36, 27, 19">
        {v.map((x, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
            <span className="sa-t-mono text-[13px] mb-1.5 sa-t-num">{x}</span>
            <div className="w-full" style={{ height: `${(x / max) * 110}px`, background: 'var(--fg)', opacity: i >= 2 ? 1 : 0.35 }} />
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-2 sa-rule pt-2">
        {v.map((_, i) => <div key={i} className="flex-1 text-center sa-t-label text-mu">{i + 1}</div>)}
      </div>
    </div>
  )
}

export default function Act03() {
  return (
    <Act i={2} id="research">
      <Opener i={2} align="right" lede="Before changing anything, I needed to know what a good guitar already feels like, and what players say when you ask them." />

      {/* Benchmarking */}
      <div className="mt-24 md:mt-36">
        <Reveal
          name="store_wide" parallax={3}
          alt="Anshul seated in a music store, holding a teal headless guitar, surrounded by guitars on the walls."
          className="w-full h-[56vh] md:h-[88vh] max-h-[1000px]" imgClass="object-cover object-[50%_45%]"
        />
        <div className="sa-wrap sa-g12 mt-5">
          <Kind className="col-span-12 md:col-span-4 mb-3">Research · benchmarking</Kind>
          <p className="sa-t-cap col-span-12 md:col-span-8 mt-0">In a music store, with established guitars. These photos are benchmarking. None of them show Solic Arc.</p>
        </div>
      </div>

      <div className="sa-wrap sa-g12 mt-24 md:mt-36 gap-y-10">
        <div className="col-span-12 md:col-span-7 grid grid-cols-[0.56fr_1fr] gap-3 md:gap-4">
          <Reveal name="store_lap1" alt="Top-down view of a headless guitar resting on a seated player's thigh." className="aspect-[486/649]" />
          <Reveal name="store_side1" alt="Edge-on view of the same headless guitar, showing the thin body profile." className="aspect-[868/650] self-end" from="right" />
          <Reveal name="store_lap2" alt="Top-down view of a mahogany super-Strat resting on the thigh." className="aspect-[486/649]" />
          <Reveal name="store_side2" alt="Edge-on view of the mahogany guitar, showing its thicker body." className="aspect-[868/650] self-end" from="right" />
        </div>
        <div className="col-span-12 md:col-start-9 md:col-span-4 md:pt-4">
          <p className="sa-t-sub">What makes an established guitar feel good, before trying to reinvent it?</p>
          <p className="sa-t-body mt-8">I looked at each guitar from above, resting on the leg, and edge-on, the way it meets the body.</p>
          <ul className="mt-8 grid grid-cols-2 gap-x-4 text-[14.5px] leading-[1.9]">
            {['Body proportions', 'Contours', 'Weight and balance', 'Contact with the leg', 'Sitting position', 'Standing position', 'Neck-to-body relation', 'Control placement', 'Fret access', 'Overall feel'].map((t) => (
              <li key={t} className="sa-rule">{t}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Community */}
      <div className="sa-wrap sa-g12 mt-32 md:mt-48 gap-y-8">
        <div className="col-span-12 md:col-span-5">
          <Kind className="mb-6">Research · community</Kind>
          <p className="sa-t-sec">Then I went where guitarists talk.</p>
        </div>
        <div className="col-span-12 md:col-start-7 md:col-span-6 md:pt-14">
          <p className="sa-t-body">Reddit threads and guitar communities first, then a survey about ergonomics and preferences, then conversations with 15+ individual players.</p>
        </div>
      </div>

      {/* Conversation */}
      <div className="sa-wrap sa-g12 mt-20 md:mt-28 gap-y-8 items-end">
        <figure className="col-span-12 md:col-span-7">
          <Reveal name="venue_blue" alt="Selfie with Bryan Beller at a venue lit in deep blue." className="aspect-[1409/1055]" />
        </figure>
        <div className="col-span-12 md:col-start-9 md:col-span-4">
          <Kind className="mb-6">Research · conversation</Kind>
          <p className="sa-t-body">At a gig I got to talk gear with Bryan Beller, bassist of The Aristocrats: the custom bass he plays, and why he chose it.</p>
          <div className="grid grid-cols-2 gap-3 mt-8">
            <Reveal name="venue_bass" alt="A red five-string bass on a stand on stage." className="aspect-[637/840]" />
            <Reveal name="venue_strat" alt="Two electric guitars on stands in front of a red-lit brick wall." className="aspect-[629/840]" from="right" />
          </div>
          <Cap>Instruments on stage at the same venue.</Cap>
        </div>
      </div>

      {/* 102 */}
      <div className="sa-wrap sa-g12 mt-24 md:mt-32 gap-y-12 items-end">
        <div className="col-span-12 md:col-span-6">
          <div className="font-display font-bold tracking-[-0.06em] leading-[0.8] text-[clamp(150px,24vw,380px)] sa-t-num">102</div>
          <p className="sa-t-sub mt-6 max-w-[16em]">people answered the guitar ergonomics survey.</p>
        </div>
        <div className="col-span-12 md:col-start-8 md:col-span-5">
          <Label className="mb-4">Who answered · experience</Label>
          <Dots />
          <Cap>A dataset weighted toward experienced players: 70 of 102 have played for five years or more.</Cap>
        </div>
      </div>

      {/* The tension */}
      <div className="sa-wrap mt-32 md:mt-48">
        <Kind className="mb-10">Evidence · two separate questions</Kind>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[clamp(24px,5vw,96px)] gap-y-16">
          <div>
            <div className="font-display font-bold tracking-[-0.055em] leading-[0.82] text-[clamp(96px,13vw,220px)] sa-t-num">75<span className="text-mu">/102</span></div>
            <p className="sa-t-sub mt-6">said yes to a contoured body.</p>
            <p className="sa-t-label text-mu mt-6">Q · “Do you prefer a contoured body for comfort?”</p>
            <Stack className="mt-4" parts={[['Yes', 75], ['Maybe', 18, 0.45], ['No', 9, 0.18]]} />
          </div>
          <div className="md:pt-[clamp(0px,9vw,180px)]">
            <div className="font-display font-bold tracking-[-0.055em] leading-[0.82] text-[clamp(96px,13vw,220px)] sa-t-num">59<span className="text-mu">/102</span></div>
            <p className="sa-t-sub mt-6">chose heritage guitars as the type they prefer most.</p>
            <p className="sa-t-label text-mu mt-6">Q · “Which type of electric guitar do you prefer the most?”</p>
            <Stack className="mt-4" parts={[['Heritage (Fender, Gibson, PRS)', 59], ['No strong preference', 26, 0.45], ['Ergonomic', 12, 0.28], ['Artistic / custom', 5, 0.14]]} />
          </div>
        </div>
      </div>
      <div className="sa-wrap sa-g12 mt-20 md:mt-28">
        <div className="col-span-12 md:col-start-3 md:col-span-8">
          <p className="sa-t-sec">Different questions. Both answers hold at the same time.</p>
          <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-x-8 gap-y-3">
            <Kind className="md:pt-1.5">Interpretation</Kind>
            <p className="sa-t-body">Players want the comfort that contouring promises. Most of them still choose the shapes they grew up with. Only 12 of 102 named ergonomic guitars as their favourite type. The gap between those answers is where this project sits.</p>
          </div>
        </div>
      </div>

      {/* Issues + pain */}
      <div className="sa-wrap mt-32 md:mt-48">
        <p className="sa-t-sec max-w-[18ch]">What gets in the way.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[clamp(24px,5vw,96px)] gap-y-16 mt-14">
          <div>
            <Label className="mb-6">Ergonomic issues · select all that apply</Label>
            <Bars rows={[['Heavy weight', 35], ['Discomfort while sitting', 22], ['Difficult fret access', 18], ['Uncomfortable body shape', 14], ['Neck dive, unbalanced weight', 14], ['Discomfort while standing', 9]]} />
          </div>
          <div>
            <Label className="mb-6">Pain or strain while playing · where</Label>
            <Bars first rows={[['No pain', 36], ['Wrist', 23], ['Back', 22], ['Shoulder', 17], ['Neck', 9]]} />
          </div>
        </div>
        <Cap className="max-w-[60ch]">Bars are drawn against all 102 respondents. Players could pick several answers, and a few wrote their own (shoulders, forearm edges, the thumb hitting the heel, a guitar sliding on the leg). Many report no pain at all. The rest describe a spread of compromises, and none of this says traditional guitars cause pain.</Cap>
      </div>

      {/* Weight + sitting */}
      <div className="sa-wrap sa-g12 mt-24 md:mt-36 gap-y-16">
        <div className="col-span-12 md:col-span-5">
          <Label className="mb-6">How important is light weight? · 1 to 5</Label>
          <Scale />
          <Cap>82 of 102 answered 3 or higher. The survey gives the scale as numbers only.</Cap>
        </div>
        <div className="col-span-12 md:col-start-7 md:col-span-6 flex flex-col gap-12">
          <div>
            <Label className="mb-3">Do you mostly play</Label>
            <Stack parts={[['sitting', 48], ['both equally', 37, 0.45], ['standing', 14, 0.2], ['picked several', 3, 0.1]]} />
          </div>
          <div>
            <Label className="mb-3">Most comfortable sitting position</Label>
            <Stack parts={[['on the right thigh, traditional', 71], ['on the left thigh, classical', 21, 0.45], ['both or other', 10, 0.18]]} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-x-6 gap-y-3 sa-rule pt-5">
            <Kind className="md:pt-1">Interpretation</Kind>
            <p className="text-[16px] leading-relaxed">Most of these players sit. A body has to rest well on either leg, not just hang well from a strap.</p>
          </div>
        </div>
      </div>

      {/* Thesis */}
      <div className="h-[22vh] md:h-[30vh]" />
      <div className="sa-wrap">
        <Kind className="mb-10">Design thesis</Kind>
        <div className="font-display font-bold tracking-[-0.05em] leading-[0.86] text-[clamp(56px,10.6vw,200px)]">
          <div className="flex items-baseline gap-[0.12em] flex-wrap">Heritage</div>
          <div className="flex items-baseline gap-[0.18em] flex-wrap"><span style={{ color: 'var(--blue)' }}>+</span>Ergonomics</div>
          <div className="flex items-baseline gap-[0.18em] flex-wrap"><span style={{ color: 'var(--red)' }}>−</span>Strain</div>
        </div>
        <div className="sa-g12 mt-14 md:mt-20 gap-y-8">
          <p className="sa-t-body col-span-12 md:col-span-5">The formula from my concept board. It isn’t a universal truth about guitars. It is the bet this project makes.</p>
          <dl className="col-span-12 md:col-start-7 md:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
            {[['Keep', 'the outline and language players already trust'], ['Add', 'contour, balance and access where the body meets the player'], ['Remove', 'what makes playing a strain']].map(([k, v]) => (
              <div key={k} className="sa-rule pt-3"><dt className="sa-t-label text-mu mb-1.5">{k}</dt><dd className="text-[15px] leading-snug">{v}</dd></div>
            ))}
          </dl>
        </div>
        <div className="mt-14 sa-rule pt-5 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-x-8 gap-y-3 max-w-[900px]">
          <Kind className="md:pt-1">Design intent</Kind>
          <p className="text-[16px] leading-relaxed">Functional goals from the same board: a guitar that works as an extension of mind and body; play without limitation; better balance and posture. Keywords: playability, freedom, balance.</p>
        </div>
      </div>
      <div className="sa-pause" />
    </Act>
  )
}
