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
      {/* Two words, at the size this record gives a thing it has been building
          towards for six acts.
          ──────────────────────────────────────────────────────────────
          What stood here was the logo drawn for the instrument, set as large
          as the column allowed, with "An extension of the player's body."
          under it. Both have gone. The brand line is the cover's job and it
          does it there; repeating it here made the reveal a title card for a
          product rather than the moment the act hands you the object.

          The first replacement was worse. It kept the words and set them at
          the section size — which is the size of a subheading, below the act
          titles, and after half a screen of nothing it read as a label on a
          gallery rather than as an arrival. A reveal is not a smaller version
          of a reveal.

          So: the display register the record already keeps for its biggest
          moments. The Coda's "People × Products" is this face at this leading
          and this tracking, and Act 03 sets a single number at 380px. Sized so
          it holds one line across the column here and folds to two on a phone,
          which is the only place a lone "The" is worth the break.

          The gold is --acc, which every act declares and nothing has ever
          used. Acts 06 and 07 — making it, and having made it — are the two
          that set it to a gold rather than to their own text colour, so the
          token was always meant for about here. It is also the wordmark's own
          second colour, which is the one thing worth keeping from the mark
          that used to stand in this spot.

          Still the h2 the mark was carrying: the outline is unchanged, and
          what is read aloud is a phrase rather than an alt text.

          The size is the Coda's, to the character — this record ships a
          compiled stylesheet, so an arbitrary Tailwind value that is not
          already in it generates nothing and the element quietly falls back to
          18px. Which is worth more than a workaround: the two moments this
          record raises its voice for are now the same size by construction
          rather than by two numbers that happen to be near each other. */}
      <div className="sa-wrap">
        <h2 className="font-display font-bold tracking-[-0.055em] leading-[0.84] text-[clamp(64px,11.6vw,220px)]">
          The <span style={{ color: 'var(--acc)' }}>instrument</span>
        </h2>
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
      <div className="sa-wrap sa-g12 mt-10 md:mt-16 gap-y-4 items-end">
        <figure className="col-span-6 md:col-span-5">
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
          {/* Proportion inline, not as aspect-[843/1265]: the compiled
              stylesheet only carries the arbitrary values the export was built
              with, and 843/1128 is the only one of these it has. The class
              would resolve to nothing and leave the box to the image's own
              width and height attributes — right by luck, since they are the
              numbers the ratio came from, and wrong the moment either moves. */}
          <Reveal name="room_play" alt="Solic Arc being played seated at night in the same room, lit by a single lamp." wrapStyle={{ aspectRatio: '843 / 1265' }} />
        </figure>
        <figure className="col-span-6 md:col-span-5">
          <Reveal name="sofa_three" alt="Solic Arc standing on a sofa beside a red bass and a black Jackson." wrapStyle={{ aspectRatio: '843 / 1124' }} from="right" />
        </figure>
        <Cap className="col-span-12 md:col-start-3 md:col-span-9">The real one, at home.</Cap>
      </div>
      <div className="sa-pause" />
    </Act>
  )
}
