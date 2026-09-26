import { Act, Reveal, Label, Kind, Cap, useSrc } from '../components/ui'

const META = [
  ['Project', 'Solic Arc, an ergonomic electric guitar'],
  ['Work', 'Research · Product design · Physical prototyping · Fabrication'],
  ['Role', 'Solo project, designed and built by Anshul Suthar'],
  ['Time', '3 months · 2025'],
]

export default function Act01() {
  const src = useSrc()
  return (
    <Act i={0} id="origin">
      {/* Cover */}
      <header className="sa-wrap pt-[88px] md:pt-[120px]">
        <div className="sa-g12 items-end">
          <h1 className="sa-t-hero col-span-12 lg:col-span-10">
            The guitar<br />I couldn’t find.
          </h1>
        </div>
        {/* The standfirst gets the page to itself, and the four facts run
            underneath it as one row of rules. They used to sit beside it in a
            two by two block starting at column 8, which put a second column of
            reading matter level with the first and left the four rules broken
            across two rows at two different heights. */}
        <div className="mt-10 md:mt-14">
          <p className="sa-t-body">
            Solic Arc is an electric guitar I designed and built around the player’s body. This page follows how it got its shape: from other players, a system for drawing bodies, foam prototypes and a workshop.
          </p>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 mt-16 md:mt-24">
            {META.map(([k, v]) => (
              <div key={k} className="sa-rule pt-3">
                <dt className="sa-t-label text-mu">{k}</dt>
                <dd className="text-[15px] leading-snug mt-1.5">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="mt-14 md:mt-20">
        <Reveal
          name="headstock" eager parallax={4}
          alt="Black and white close-up of the Solic Arc headstock and tuners, shot with a shallow depth of field."
          /* The photograph's own proportion, 1743x1213, rather than a box a
             fraction of the window tall with object-cover trimming whatever
             did not fit. At 86vh it was very nearly a square and the headstock
             was being cut on both sides to make one. The only crop left is the
             8% the parallax scales it by so it has somewhere to travel. */
          className="w-full" wrapStyle={{ aspectRatio: '1743 / 1213' }}
          imgClass="object-cover object-[60%_40%]"
        />
        <div className="sa-wrap"><Cap>The headstock of the finished guitar. The rest of it waits until the end of the page.</Cap></div>
      </div>

      {/* The question */}
      <div className="sa-wrap sa-g12 mt-32 md:mt-48">
        <Label className="col-span-12 md:col-span-3 mb-6 md:mb-0 md:pt-3">The question</Label>
        <p className="sa-t-sec col-span-12 md:col-span-9">
          How do you make an ergonomic guitar without losing the heritage, familiarity and character that make people want a traditional one?
        </p>
      </div>

      {/* Origin: Red Special */}
      <div className="sa-wrap sa-g12 mt-32 md:mt-52 gap-y-10 items-center">
        <div className="col-span-12 md:col-span-5">
          <Kind className="mb-6">Origin</Kind>
          <p className="sa-t-body">
            When I was young I heard how Brian May built the Red Special with his father while still a teenager. A guitar made at home became one of the most recognisable instruments in rock, with a sound and an identity of its own.
          </p>
          <p className="sa-t-body text-mu">That stayed with me. A guitar someone makes for themselves can end up with an identity nobody else could have given it.</p>
        </div>
        <figure className="col-span-12 md:col-start-7 md:col-span-6">
          {/* The whole instrument. This used to be framed to 1.18 with the
              photograph blown up to 197% and pinned right, which showed the
              neck and the headstock and cut the body off — the part of the
              Red Special anyone would recognise it by. */}
          <img
            src={src('ref_redspecial')} alt="The Red Special, whole, from a reference photo."
            width="1200" height="431" loading="lazy"
            className="w-full h-auto"
          />
          <Cap>The Red Special. Reference image from my research board.</Cap>
        </figure>
      </div>

      {/* Three guitars */}
      {/* Two cells that size themselves: the numeral takes the width of the
          numeral and the sentence takes the rest, with a gap set between them
          rather than left over. It was a four and an eight of the twelve-column
          grid, which gave the glyph a third of the page whatever size it was
          drawn at, and cast the difference as empty space — against the right
          of that column the 3 then stood a head and shoulders above the two
          sentences beside it. See .solic-three in app/globals.css for the size,
          which is set to the height of those sentences. */}
      <div className="sa-wrap mt-32 md:mt-52">
        <div className="solic-three">
          <div className="solic-three-n font-display font-bold sa-t-num" aria-hidden="true">3</div>
          <div>
            <p className="sa-t-sec">Three guitars. None of them felt like mine.</p>
            <p className="sa-t-body mt-8">I had owned three guitars and never felt properly connected to any of them. They didn’t feel right in my hands.</p>
          </div>
        </div>
      </div>

      {/* The idea, then the turn */}
      <div className="sa-wrap sa-g12 mt-32 md:mt-48">
        {/* The whole column, so the question sets in three lines rather than
            four — it was given eleven of twelve, and the twelfth is the line
            the fourth was breaking for. */}
        <p className="sa-t-act col-span-12">What if I designed a guitar around the way I actually play?</p>
      </div>
      {/* Under the question and on its own left edge, rather than indented to
          the middle of the page behind a rule. The rule was drawing a line
          between a question and its own answer. */}
      <div className="sa-wrap sa-g12 mt-12 md:mt-16">
        <div className="col-span-12 md:col-span-7">
          <p className="sa-t-body">
            A guitar that fits one person is a custom order. I wanted something that could work for other guitarists too, and maybe become a product one day.
          </p>
          <p className="sa-t-body">So the project couldn’t start with my hands. It had to start with other players, and with the guitars they already love.</p>
        </div>
      </div>
      <div className="sa-pause" />
    </Act>
  )
}
