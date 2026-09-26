import { Act, Kind, Label, NC } from '../components/ui'

const OPEN = [
  ['Weight', 'Heavy weight was the most reported problem in the survey, named by 35 of 102 players. The finished guitar’s weight still has to be measured and compared.', true],
  ['Scallops', 'They split the players who have tried them. The next version needs a clear answer, from players rather than from me.'],
  ['Evidence', 'Everything players said about comfort was informal. Next: structured sessions, sitting and standing, against the guitars they already own.'],
  ['Making', 'One guitar, built by hand on a repaired CNC. Whether the design holds up in repeatable production is untested.'],
]

export default function Coda() {
  return (
    <Act i={7} id="coda">
      <div className="sa-wrap">
        <div className="sa-t-label text-mu mb-8">Coda</div>
        <p className="sa-t-act max-w-[15ch]">Adding curves was the easy part.</p>
        <p className="sa-t-sec mt-10 md:mt-14 max-w-[26ch] text-mu">The work was changing how a player meets the guitar while keeping what made them want to pick one up.</p>
      </div>

      <div className="sa-wrap mt-28 md:mt-40">
        <div className="sa-g12 gap-y-6 items-end">
          <div className="col-span-12 md:col-span-6">
            <Kind className="mb-6">Open questions</Kind>
            <p className="sa-t-sec">What Solic Arc hasn’t answered yet.</p>
          </div>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-[clamp(16px,2.4vw,40px)] gap-y-10 mt-14">
          {OPEN.map(([t, d, nc], i) => (
            <li key={t} className="sa-rule pt-5">
              <div className="flex items-baseline gap-3"><span className="sa-t-mono text-[12px] text-mu sa-t-num">{String(i + 1).padStart(2, '0')}</span><span className="sa-t-label">{t}</span></div>
              <p className="text-[16px] leading-relaxed mt-3">{d} {nc && <NC>final weight</NC>}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="h-[26vh] md:h-[36vh]" />
      <div className="sa-wrap">
        <p className="font-display font-bold tracking-[-0.055em] leading-[0.84] text-[clamp(64px,11.6vw,220px)]">
          People<br /><span className="text-mu">×</span> Products
        </p>
        <div className="sa-g12 mt-12 md:mt-16 gap-y-6">
          <p className="sa-t-body col-span-12 md:col-span-6">Players shaped the question. The guitar is the answer I could build. Systems still ran underneath: a borrowed framework for shape, and a loop for testing it against the body.</p>
        </div>
      </div>

      <footer className="sa-wrap mt-28 md:mt-40 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6 sa-rule pt-6 text-[14px] leading-relaxed">
          <div><Label className="mb-1.5">Design, research, prototyping, build</Label><div>Anshul Suthar · 2025</div></div>
          <div><Label className="mb-1.5">Body-shape framework</Label><div><a href="https://diegofabianguitars.blogspot.com/" target="_blank" rel="noreferrer">Diego Fabián Guitars</a></div></div>
          <div><Label className="mb-1.5">Survey</Label><div>102 responses, guitar ergonomics survey</div></div>
          <div><Label className="mb-1.5">Players</Label><div>Octaves, the music club of IIT Guwahati</div></div>
        </div>
      </footer>
    </Act>
  )
}
