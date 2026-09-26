import { Act, Opener, Kind, Cap, Reveal, NC } from '../components/ui'

const P = (name, cls, alt, aspect) => ({ name, cls, alt, aspect })
const MOSAIC = [
  P('player_4', 'col-span-12 sm:col-span-7 md:col-span-5', 'Close-up of hands on Solic Arc in warm lamplight.', 'aspect-[695/1240]'),
  P('player_2', 'col-span-6 sm:col-span-5 md:col-span-3 md:mt-[22vh]', 'A player looks down at the fretboard while playing seated.', 'aspect-[696/1240]'),
  P('player_3', 'col-span-6 sm:col-span-6 md:col-span-4 md:mt-[8vh]', 'A player stands with Solic Arc on a strap.', 'aspect-[695/927]'),
]
const MOSAIC2 = [
  P('player_7', 'col-span-6 md:col-start-5 md:col-span-4', 'A smiling player in red light plays Solic Arc on a stool.', 'aspect-[695/1240]'),
  P('player_1', 'col-span-6 md:col-span-4 md:mt-[16vh]', 'A player in a cap plays Solic Arc seated.', 'aspect-[695/1240]'),
]
const MOSAIC3 = [
  P('player_5', 'col-span-6 md:col-start-2 md:col-span-3', 'A player seated on a chair, guitar across his leg.', 'aspect-[698/1240]'),
  P('player_6', 'col-span-6 md:col-span-4 md:mt-[10vh]', 'A player seated with the guitar while a friend watches.', 'aspect-[699/924]'),
  P('player_8', 'col-span-12 sm:col-span-6 md:col-span-3 md:mt-[4vh]', 'A player in a patterned shirt plays seated.', 'aspect-[695/1240]'),
]
const Tile = ({ p, i }) => (
  <figure className={p.cls}>
    <Reveal name={p.name} alt={p.alt} className={`w-full ${p.aspect}`} from={i % 2 ? 'right' : 'bottom'} />
  </figure>
)

const SPEC = [
  ['Body', 'Swamp ash, quartersawn'],
  ['Neck', 'Maple, quartersawn · flat, angled profile'],
  ['Fretboard', 'Rosewood, quartersawn'],
  ['Scale length', '25.5 in'],
  ['Frets', '24 · stainless-steel jumbo'],
  ['Pickups', 'Two custom-wound humbuckers'],
  ['Bridge', 'Wilkinson vintage-style'],
  ['Pickguard', 'Carbon fibre'],
  ['Headstock', 'Strat-style'],
]

export default function Act07() {
  return (
    <Act i={6} id="players">
      <Opener i={6} lede="Octaves is IIT Guwahati’s music club. Its guitarists sat down with Solic Arc, stood up with it, and played." />

      <div className="sa-wrap mt-20 md:mt-28">
        <div className="sa-g12 gap-y-4 md:gap-y-0 items-start">
          {MOSAIC.map((p, i) => <Tile key={p.name} p={p} i={i} />)}
        </div>
        <div className="sa-g12 gap-y-4 mt-4 md:mt-10 items-start">
          <div className="col-span-12 md:col-span-4 md:pt-[10vh] order-last md:order-none mt-6 md:mt-0">
            <Kind className="mb-6">Real-world use · informal</Kind>
            <p className="sa-t-sub">What players talked about: the shape, and how it felt sitting and in other positions.</p>
            <p className="sa-t-body mt-6 text-mu">The sessions were informal. Nothing was recorded or measured, and a handful of players don’t speak for every guitarist. I read it as a first reaction, not as validation.</p>
          </div>
          {MOSAIC2.map((p, i) => <Tile key={p.name} p={p} i={i + 1} />)}
        </div>
        <div className="sa-g12 gap-y-4 mt-4 md:mt-10 items-start">
          {MOSAIC3.map((p, i) => <Tile key={p.name} p={p} i={i} />)}
        </div>
      </div>

      {/* Reveal */}
      <div className="h-[36vh] md:h-[50vh]" />
      <div className="sa-wrap">
        <p className="sa-t-label text-mu mb-6">The instrument</p>
        <h2 className="font-serif leading-[0.8] tracking-[-0.02em] text-[clamp(96px,17vw,330px)]">
          Solic <span className="italic" style={{ color: 'var(--acc)' }}>Arc</span>
        </h2>
        <p className="font-serif italic text-[clamp(24px,2.6vw,44px)] leading-tight mt-6 md:mt-8 text-mu">An extension of the player’s body.</p>
      </div>

      <figure className="mt-16 md:mt-24">
        <Reveal
          name="body_studio" parallax={2}
          alt="Render of the Solic Arc body: natural swamp ash, carbon-fibre pickguard, two cream humbuckers, a vintage-style tremolo bridge and a rosewood fretboard."
          className="w-full h-[70vh] md:h-[100vh] max-h-[1300px]" imgClass="object-cover object-[45%_50%]"
        />
        <div className="sa-wrap sa-g12 mt-6 gap-y-3">
          <Kind className="col-span-12 md:col-span-3">Render</Kind>
          <p className="col-span-12 md:col-span-8 sa-t-cap mt-0">A render of the final design. The built guitar has the same carbon-fibre pickguard.</p>
        </div>
      </figure>

      <div className="sa-wrap sa-g12 mt-24 md:mt-36 gap-y-14">
        <div className="col-span-12 md:col-span-5">
          <p className="sa-t-sec">An ergonomic electric guitar, built around the player without abandoning the language of the guitar.</p>
        </div>
        <dl className="col-span-12 md:col-start-7 md:col-span-6">
          {SPEC.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[9rem_1fr] sm:grid-cols-[11rem_1fr] gap-4 sa-rule py-3">
              <dt className="sa-t-label text-mu pt-[3px]">{k}</dt>
              <dd className="text-[16px] leading-snug">{v}</dd>
            </div>
          ))}
          <div className="grid grid-cols-[9rem_1fr] sm:grid-cols-[11rem_1fr] gap-4 sa-rule py-3">
            <dt className="sa-t-label text-mu pt-[3px]">Weight</dt>
            <dd className="text-[16px] leading-snug"><NC>final weight</NC></dd>
          </div>
        </dl>
      </div>

      <div className="sa-wrap sa-g12 mt-24 md:mt-36 gap-y-4 items-end">
        <figure className="col-span-6 md:col-start-2 md:col-span-4">
          <Reveal name="wall" alt="Solic Arc hanging on a white wall beside an acoustic guitar." className="aspect-[843/1128]" />
        </figure>
        <figure className="col-span-6 md:col-span-5">
          <Reveal name="room_night" alt="Solic Arc resting on a stool at night in a room with a keyboard and desk." className="aspect-[843/1128]" from="right" />
        </figure>
        <Cap className="col-span-12 md:col-start-2 md:col-span-9">The real one, at home.</Cap>
      </div>
      <div className="sa-pause" />
    </Act>
  )
}
