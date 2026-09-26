import { Act, Label } from '../components/ui'

export default function Coda() {
  return (
    <Act i={7} id="coda">
      <div className="sa-wrap">
        <div className="sa-t-label text-mu mb-8">Coda</div>
        <p className="sa-t-act max-w-[15ch]">Adding curves was the easy part.</p>
        <p className="sa-t-sec mt-10 md:mt-14 max-w-[26ch] text-mu">The work was changing how a player meets the guitar while keeping what made them want to pick one up.</p>
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
          <div><Label className="mb-1.5">Survey</Label><div><a href="https://docs.google.com/spreadsheets/d/1Jmmf73yHNHhqS87HgiYPhIn3pBl-K_4dYjHfxSl7f50/edit?usp=sharing" target="_blank" rel="noreferrer">102 responses, guitar ergonomics survey</a></div></div>
          <div><Label className="mb-1.5">Players</Label><div>Octaves, the music club of IIT Guwahati</div></div>
        </div>
      </footer>
    </Act>
  )
}
