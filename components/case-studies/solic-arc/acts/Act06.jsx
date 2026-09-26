import { Act, Opener, Label, Kind, Cap, Img, Reveal, NC } from '../components/ui'

const REFINE = [
  ['sk_neck', 'Neck profile', 'A flat, angled neck profile. Meant to give the thumb a more restful grip and keep the wrist straighter.', 'aspect-[1741/671]'],
  ['sk_scallop', 'Scalloped fretboard', 'Scallops 3 mm deep between stainless-steel jumbo frets. Meant to reduce fingertip contact with the board and encourage a lighter fretting touch.', 'aspect-[1740/1004]'],
  ['sk_cutaway', 'Bevelled neck joint and cutaways', 'Meant to take away the physical barriers between the hand and the upper frets.', 'aspect-[1741/1189]'],
]

const PICKUP = [
  ['pickup_1', 'Wire', '43 AWG enamelled copper, as labelled on the spool.'],
  ['pickup_2', 'Winding', 'The bobbin on the winder.'],
  ['pickup_3', 'Leads', 'Soldering the coil ends.'],
  ['pickup_4', 'Coil', 'A wound bobbin.'],
  ['pickup_5', 'Assembly', 'Two coils, one humbucker.'],
  ['pickup_6', 'Potting', 'Into melted wax.'],
]

const VARS = ['Number of turns', 'Wire thickness', 'Density of turns', 'Distribution of turns', 'Magnet strength', 'Magnet type', 'Slug material', 'Slug thickness', 'Bobbin type', 'Pickup type', 'Gap to the strings', 'Position']

export default function Act06() {
  return (
    <Act i={5} id="making">
      <Opener i={5} align="center" lede="The design had to survive contact with wood, steel, wire and a machine that didn’t work when I found it." />

      {/* CAD */}
      <div className="sa-wrap sa-g12 mt-24 md:mt-36 gap-y-8 items-end">
        <div className="col-span-12 md:col-span-5">
          <Kind className="mb-6">CAD · Fusion 360</Kind>
          <p className="sa-t-sec">From outline to a build-ready instrument.</p>
        </div>
        <p className="sa-t-body col-span-12 md:col-start-7 md:col-span-6">In Fusion 360 the chosen study, the sketches and the prototypes became one precise design. Fretboard scallop depth, hardware placement, body contours and neck balance were each set to a measured value.</p>
      </div>
      <figure className="sa-wrap mt-12 md:mt-16">
        <Reveal name="blueprint" alt="Technical drawing of Solic Arc in white lines on blue: front and rear views with dimensions, and a side section of the neck showing the scalloped fretboard." className="w-full aspect-[1743/1242] rounded-[3px]" imgClass="object-cover" />
        <Cap>Drawing set: front, rear, and a side section through the neck. The scallops are visible along the top of the fretboard.</Cap>
      </figure>

      <div className="mt-16 md:mt-24 py-12 md:py-16" style={{ background: '#E6E1D4', color: '#17221D' }}>
        <div className="sa-wrap">
          <div className="sa-t-label mb-8" style={{ color: 'rgba(23,34,29,.6)' }}>Model · outline, surfaces, solid body</div>
          {/* Two by two. Four across put each model in a quarter of the column,
              which at this scale is a guitar the width of a thumb — and the point
              of the row is to watch one become the next. */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 items-center">
            {['cad_2', 'cad_4', 'cad_6', 'cad_7'].map((n, i) => (
              <Img key={n} name={n} alt={['Outline drawing of body and neck.', 'Surfaced model, body and neck, seen from above at an angle.', 'Solid body and neck with pickup cavities, in perspective.', 'Close perspective of the body edge and contours.'][i]} imgClass="object-contain" className="aspect-[1.5]" />
            ))}
          </div>
        </div>
      </div>

      {/* Refining the instrument */}
      <div className="sa-wrap mt-28 md:mt-40">
        <div className="sa-g12 gap-y-6 items-end">
          <div className="col-span-12 md:col-span-7">
            <Kind className="mb-6">Beyond the body</Kind>
            <p className="sa-t-sec">The neck is where the technical work happens.</p>
          </div>
          <p className="sa-t-body col-span-12 md:col-start-9 md:col-span-4">It has to hold pitch as close to perfect as possible, and still be as comfortable as the body around it.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[clamp(16px,2.4vw,40px)] gap-y-14 mt-14">
          {REFINE.map(([n, t, d, a]) => (
            <figure key={n}>
              <div className="bg-[#E6E1D4] rounded-[3px] overflow-hidden">
                <Img name={n} alt={`Pencil sketch: ${t.toLowerCase()}.`} className={a} imgClass="object-cover mix-blend-multiply" />
              </div>
              <figcaption className="mt-5">
                <div className="sa-t-label">{t}</div>
                <p className="text-[15px] leading-relaxed mt-2 text-mu">{d}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="sa-g12 mt-12 gap-y-6">
          <Kind className="col-span-12 md:col-span-3">Design intent · not measured</Kind>
          <p className="col-span-12 md:col-span-9 text-[16px] leading-relaxed">These are the intentions behind each detail. None of them has been measured on players yet.</p>
        </div>
        <div className="sa-g12 mt-10 gap-y-6 sa-rule pt-6">
          <Kind className="col-span-12 md:col-span-3">Evidence · the scallop split</Kind>
          <div className="col-span-12 md:col-span-9">
            <p className="text-[16px] leading-relaxed">The survey was divided on scalloped frets. Among players describing their experience, 7 said they don’t like them at all and 4 found them too demanding or uncomfortable. 4 said bending and vibrato got easier, and 3 felt less finger fatigue.</p>
            <p className="text-[16px] leading-relaxed mt-3 text-mu">It is the most divisive decision in the design. <NC>scalloped fretboard on the finished guitar</NC></p>
          </div>
        </div>
      </div>

      {/* Materials */}
      <div className="sa-wrap mt-28 md:mt-40">
        <Label className="mb-8">Materials · all quartersawn</Label>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-[clamp(16px,3vw,48px)] gap-y-8">
          {[['Body', 'Swamp ash'], ['Neck', 'Maple'], ['Fretboard', 'Rosewood']].map(([k, v]) => (
            <div key={k} className="sa-rule pt-4">
              <dt className="sa-t-label text-mu">{k}</dt>
              <dd className="font-display font-semibold tracking-[-0.035em] leading-none text-[clamp(40px,5vw,84px)] mt-3">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="sa-t-body mt-10">Finding suitable wood took many calls and a lot of shipping. Then came the blank, the neck and the fretboard.</p>
      </div>

      {/* CNC */}
      <figure className="mt-20 md:mt-28">
        <Reveal name="cnc" parallax={3} alt="A CNC router cutting the Solic Arc body outline and pickup cavities from a swamp ash blank, with sawdust around it." className="w-full aspect-[1743/984] max-h-[92vh]" imgClass="object-cover" />
        <div className="sa-wrap sa-g12 mt-6 gap-y-3">
          <Kind className="col-span-12 md:col-span-3">Fabrication</Kind>
          <p className="col-span-12 md:col-span-7 text-[16px] leading-relaxed">I had access to a broken CNC. I fixed it, loaded the toolpath and pushed the right buttons.</p>
        </div>
      </figure>

      {/* Workshop */}
      <div className="sa-wrap sa-g12 mt-28 md:mt-40">
        <blockquote className="col-span-12 md:col-start-2 md:col-span-11">
          {/* A joined hand rather than the serif italic, which sets this as a
              row of separate letters and reads as type pretending to be
              handwriting. Wider column and a smaller size so it lands in four
              lines instead of six. See --font-hand in app/layout.tsx. */}
          <p
            className="text-[clamp(28px,3.2cqw,56px)] leading-[1.28]"
            style={{ fontFamily: 'var(--font-hand), cursive' }}
          >
            “I spent the next month in a workshop. Coils of wood shavings covered the floor. Tiny particles of ash hung in the sunlight shining through the little window.”
          </p>
          <footer className="sa-t-label text-mu mt-6">From my project notes</footer>
        </blockquote>
      </div>

      {/* Pickups */}
      <div className="sa-wrap mt-28 md:mt-40">
        <div className="sa-g12 gap-y-8">
          <div className="col-span-12 md:col-span-6">
            <Kind className="mb-6">Electronics · custom-wound pickups</Kind>
            <p className="sa-t-sec">The part you never see.</p>
            <p className="sa-t-body mt-8">Tone depends on a long list of variables. I wound the pickups myself.</p>
          </div>
          <ul className="col-span-12 md:col-start-8 md:col-span-5 grid grid-cols-2 gap-x-6 sa-t-mono text-[13px] leading-[2.1] md:pt-4">
            {VARS.map((v, i) => (
              <li key={v} className="sa-rule flex gap-3"><span className="text-mu sa-t-num">{String(i + 1).padStart(2, '0')}</span>{v}</li>
            ))}
          </ul>
        </div>
        <div className="mt-14 -mx-[var(--sa-gutter)] px-[var(--sa-gutter)] overflow-x-auto snap-x snap-mandatory [scrollbar-width:thin]">
          <ol className="flex md:grid md:grid-cols-6 gap-3 md:gap-4 min-w-max md:min-w-0">
            {PICKUP.map(([n, t, d], i) => (
              <li key={n} className="snap-start w-[58vw] sm:w-[34vw] md:w-auto">
                <Reveal name={n} alt={`${t}: ${d}`} className="aspect-[559/777]" imgClass="object-cover" />
                <div className="mt-3 flex gap-2 items-baseline">
                  <span className="sa-t-mono text-[12px] text-mu sa-t-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="sa-t-label">{t}</span>
                </div>
                <p className="text-[13.5px] leading-snug text-mu mt-1">{d}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="sa-g12 mt-12 gap-y-4">
          <p className="col-span-12 md:col-start-5 md:col-span-8 sa-t-body">
            After winding, each pickup is wax potted: dipped in melted wax that fills the empty spaces, locks the wire in place and keeps moisture out. Loose coils vibrate at high volume and squeal. Potting stops that microphonic feedback.
          </p>
        </div>
      </div>
      <div className="sa-pause" />
    </Act>
  )
}
