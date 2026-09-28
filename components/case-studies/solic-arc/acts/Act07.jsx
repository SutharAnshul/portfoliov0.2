import { Act, Opener, Kind, Cap, Reveal, NC, SHOW_NC } from '../components/ui'

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
  ['Body', 'Ash, quartersawn'],
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
      {/* Three words, at the size the wordmark used to be given.
          ──────────────────────────────────────────────────────────────
          What stood here was the logo drawn for the instrument, set as large
          as the column allowed, with "An extension of the player's body."
          under it. Both have gone. The brand line is the cover's job and it
          does it there; repeating it here made the reveal a title card for a
          product rather than the moment the act hands you the object.

          So the label that used to introduce the mark is the heading now, and
          it carries the h2 the mark was carrying — the outline is unchanged,
          and what is read aloud is a phrase rather than an alt text. */}
      <div className="sa-wrap">
        <h2 className="sa-t-sec">The instrument</h2>
      </div>

      {/* The built guitar, where a render of it used to be.
          ──────────────────────────────────────────────────────────────
          The render was the only picture of the finished instrument that was
          not the finished instrument — a model of it on a white sweep, with a
          caption underneath explaining which parts of it were true of the real
          one. The guitar exists and has been photographed. The act can show it.

          These two were the act's closing pair. Moving them up costs that
          ending nothing: the two photographs that replace them there are the
          instrument being played and the instrument standing beside the ones
          it was measured against, which is the better close anyway.

          Wider than the pair was at the foot of the act, because this is the
          slot a full-bleed render used to hold and a reveal wants the room.
          Not full-bleed though: these files are 843px across, and a picture
          painted wider than about 420 CSS px is being enlarged on any screen
          with two device pixels to the one. Upscaling a photograph to make a
          hero of it is the other way of failing to show the thing. */}
      <div className="sa-wrap sa-g12 mt-20 md:mt-28 gap-y-4 items-end">
        <figure className="col-span-6 md:col-start-1 md:col-span-5">
          <Reveal name="wall" alt="Solic Arc hanging on a white wall beside an acoustic guitar." className="aspect-[843/1128]" />
        </figure>
        <figure className="col-span-6 md:col-start-7 md:col-span-6">
          <Reveal name="room_night" alt="Solic Arc resting on a stool at night in a room with a keyboard and desk." className="aspect-[843/1128]" from="right" />
        </figure>
      </div>

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
          {/* The whole row, not just the tag. Weight's only value here is the
              tag, so hiding the tag on its own would leave a spec line with a
              label and nothing beside it — which reads as a bug rather than as
              a number nobody has taken yet. It is still named as an open
              question in the Coda. */}
          {SHOW_NC && (
          <div className="grid grid-cols-[9rem_1fr] sm:grid-cols-[11rem_1fr] gap-4 sa-rule py-3">
            <dt className="sa-t-label text-mu pt-[3px]">Weight</dt>
            <dd className="text-[16px] leading-snug"><NC>final weight</NC></dd>
          </div>
          )}
        </dl>
      </div>

      {/* The same two facts the act has been making, made once more without
          argument: it gets played, and it stands next to instruments somebody
          bought. Act 07 until here is other people's hands, in a club, on an
          afternoon — the guitarists of Octaves, who were handed it and asked.
          These are the room it was built in, at night, with nobody watching,
          which is the only test that carries on after the sessions end.

          Offset and staggered rather than squared up, the way the player
          mosaics at the head of this act are. */}
      <div className="sa-wrap sa-g12 mt-24 md:mt-36 gap-y-4 items-start">
        <figure className="col-span-6 md:col-start-3 md:col-span-4 md:mt-[10vh]">
          <Reveal name="room_play" alt="Solic Arc being played seated at night in the same room, lit by a single lamp." className="aspect-[843/1265]" />
        </figure>
        <figure className="col-span-6 md:col-span-5">
          <Reveal name="sofa_three" alt="Solic Arc standing on a sofa beside a red bass and a black Jackson." className="aspect-[843/1124]" from="right" />
        </figure>
        <Cap className="col-span-12 md:col-start-3 md:col-span-9">The real one, at home.</Cap>
      </div>
      <div className="sa-pause" />
    </Act>
  )
}
