import { Act, Opener, Label, Kind, Cap, Img } from '../components/ui'
import { AxisGuitar } from '../components/Axis'

const HERITAGE = [
  ['strat', 'Fender Stratocaster'],
  ['tele', 'Fender Telecaster'],
  ['lp', 'Gibson Les Paul'],
  ['redspecial', 'Red Special'],
]
const ERGO = [
  ['parker', 'Parker Fly Deluxe'],
  ['strandberg', 'Headless ergonomic design'],
  ['hyper', 'Headless ergonomic design'],
]

const Column = ({ word, items, gives, costs }) => (
  <div>
    <div className="font-display font-bold tracking-[-0.045em] leading-[0.9] text-[clamp(44px,6.4vw,118px)]">{word}</div>
    <div className="mt-10 md:mt-14 flex flex-col gap-8 md:gap-10">
      {items.map(([k, n]) => <AxisGuitar key={k} k={k} name={n} />)}
    </div>
    <dl className="mt-12 grid grid-cols-1 xs:grid-cols-2 gap-x-6 gap-y-6">
      <div className="sa-rule pt-3">
        <dt className="sa-t-label text-mu mb-2">Gives</dt>
        <dd className="text-[15px] leading-relaxed">{gives}</dd>
      </div>
      <div className="sa-rule pt-3">
        <dt className="sa-t-label text-mu mb-2">Costs</dt>
        <dd className="text-[15px] leading-relaxed">{costs}</dd>
      </div>
    </dl>
  </div>
)

export default function Act02() {
  return (
    <Act i={1} id="contradiction">
      <Opener i={1} lede="Traditional shapes carry decades of familiarity. Ergonomic guitars are shaped around the body instead. Each gives up something the other keeps." />

      <div className="sa-wrap mt-24 md:mt-36">
        <Label className="mb-10 max-w-[60ch]">
          My research board. Each body reduced to a silhouette, with three axes drawn across it: at the tail, the waist and the horns.
        </Label>
        {/* Both columns start at the top. The right one used to be pushed down
            by a padding of up to 260px, which set the two words at different
            heights and, because the drop was a fraction of the width, at a
            different offset on every screen — the pair are a comparison and
            they have to be read side by side. Wider gutter with them level, so
            the two sets of silhouettes do not run together. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[clamp(24px,5vw,96px)] gap-y-24 items-start" style={{ columnGap: 'clamp(40px, 7cqw, 140px)' }}>
          <Column
            word="Heritage" items={HERITAGE}
            gives="Familiarity, a visual language people recognise, proven proportions, a musical and cultural history."
            costs="Compromises in weight, balance, posture, body contact and fret access, sitting or standing."
          />
          <Column
            word="Ergonomic" items={ERGO}
            gives="Lighter bodies, deep contours, balance, shapes built around the player."
            costs="Often the familiar outline, and with it much of the identity of a guitar."
          />
        </div>
      </div>

      {/* Measured observation */}
      <div className="sa-wrap sa-g12 mt-28 md:mt-40 gap-y-10">
        <div className="col-span-12 md:col-span-5">
          <Kind className="mb-6">Observation</Kind>
          <p className="sa-t-sub">Heritage bodies stand upright on their axes. Ergonomic bodies tilt them and fan them out.</p>
        </div>
        <div className="col-span-12 md:col-start-7 md:col-span-6">
          <table className="w-full sa-t-num text-[15px]">
            <thead>
              <tr className="sa-t-label text-mu text-left">
                <th className="font-normal pb-3">Tilt from vertical</th>
                <th className="font-normal pb-3 text-right">Tail</th>
                <th className="font-normal pb-3 text-right">Waist</th>
                <th className="font-normal pb-3 text-right">Horns</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Telecaster', '0.0°', '0.0°', '−2.6°'],
                ['Stratocaster', '−2.0°', '0.0°', '−17.1°'],
                ['Les Paul', '0.0°', '0.0°', '−11.9°'],
                ['Parker Fly Deluxe', '−7.5°', '−15.2°', '−26.1°'],
                ['Headless design', '+28.7°', '−11.8°', '−19.4°'],
              ].map((r, i) => (
                <tr key={r[0]} className="sa-rule" style={i === 3 ? { borderTopColor: 'var(--mu)' } : undefined}>
                  {r.map((c, j) => <td key={j} className={`py-2.5 ${j ? 'text-right sa-t-mono text-[14px]' : ''}`}>{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <Cap>Measured from the axes on my research board. Positive values lean the top of the axis toward the tail.</Cap>
        </div>
      </div>

      {/* In between */}
      <div className="sa-wrap sa-g12 mt-28 md:mt-36 gap-y-8 items-end">
        <div className="col-span-12 md:col-span-4">
          <Label className="mb-4">In between</Label>
          <p className="sa-t-body">Modern super-Strats sit between the two. I grouped them separately: familiar outlines, pushed a little further.</p>
        </div>
        <AxisGuitar k="prs" name="PRS" className="col-span-12 sm:col-span-6 md:col-span-4" />
        <AxisGuitar k="suhr" name="Suhr" className="col-span-12 sm:col-span-6 md:col-span-4" />
      </div>

      {/* Diego Fabián bridge */}
      <div className="sa-wrap sa-g12 mt-32 md:mt-48 gap-y-10 items-start">
        {/* A column wider than it was, and much less mount around the print.
            The plate is six guitars with their axes drawn on, and the axes are
            the whole reason it is here — at seven columns inside 36px of
            padding the lines were a few pixels long and you took them on
            trust. The image itself was cropped to its content as well; it used
            to carry a band of white and a credit line, which the caption
            already gives. Inline because the padding is an arbitrary value and
            the piece's CSS is precompiled. */}
        <figure className="col-span-12 md:col-span-8 order-2 md:order-1">
          <div
            className="bg-[#F4F1EA] rounded-[3px]"
            style={{ padding: 'clamp(6px, 0.7vw, 12px)' }}
          >
            <Img name="diego" alt="Diego Fabián's classification of electric guitar bodies: static, tilted forward, tilted back, irregular, inverted fan and fan, each shown on an example guitar with its axes drawn." />
          </div>
          <Cap>Six body families, sorted by how their axes lean. Classification by <a href="https://diegofabianguitars.blogspot.com/" target="_blank" rel="noreferrer">Diego Fabián Guitars</a>, collected on my research board.</Cap>
        </figure>
        {/* alignSelf inline: .self-center is not in the piece's compiled CSS,
            and a className the build never saw is a class that does nothing. */}
        <div
          className="col-span-12 md:col-start-9 md:col-span-4 order-1 md:order-2"
          style={{ alignSelf: 'center' }}
        >
          <Kind className="mb-6">Borrowed method</Kind>
          <p className="sa-t-body">
            The axes come from <a href="https://diegofabianguitars.blogspot.com/" target="_blank" rel="noreferrer">Diego Fabián Guitars</a>. His guide to designing electric guitars draws lines across the body, perpendicular to the strings, and sorts bodies by how those lines lean: static, tilted forward, tilted back, irregular, inverted fan, fan.
          </p>
          <p className="sa-t-body">He then measures the body’s widths to judge its balance. I didn’t invent this framework. I borrowed it, and later used it to generate my own shapes.</p>
        </div>
      </div>

      <div className="h-[30vh] md:h-[42vh]" />
      <div className="sa-wrap">
        <p className="font-display font-bold tracking-[-0.05em] leading-[0.84] text-[clamp(64px,12.5vw,240px)]">
          Can we<br />have both?
        </p>
      </div>
      <div className="h-[48vh] md:h-[62vh]" />
    </Act>
  )
}
