import { notFound } from 'next/navigation'
import { Fraunces, Newsreader, Inter, JetBrains_Mono } from 'next/font/google'

/**
 * Side-by-side comparison of two styling directions, using the site's real
 * copy so the decision is made on actual content rather than lorem ipsum.
 *
 * Dev-only: this route 404s in production, and the fonts are imported here
 * rather than in the root layout so only this page pays for loading four
 * families. Delete the route once a direction is chosen; the winning pair
 * then moves into layout.tsx.
 */

const fraunces = Fraunces({ subsets: ['latin'], weight: ['400', '600'], display: 'swap' })
const newsreader = Newsreader({ subsets: ['latin'], weight: ['300', '400', '500'], display: 'swap' })
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], display: 'swap' })

const BODY =
  "I see design as solving real problems and building systems that scale. I work across product, UX, systems design, and even industrial design — I've designed and built an electric guitar. The best outcomes come from questioning, validating, and building with intent."

const CSS = `
.cmp { --ink: #17150F; --paper: #FFFFFF; --rule: rgba(0,0,0,.14); --muted: rgba(0,0,0,.55); }
.cmp * { box-sizing: border-box; }

/* ── MONOGRAPH ─────────────────────────────────────────────────────────
   Editorial print. Serif does the talking, mono is demoted to apparatus.
   Warm paper, no accent colour at all — the picture is the only colour.
   Sentence case, not uppercase: the current site shouts at every size. */
.dir-monograph {
  --paper: #F6F2E9;
  --ink: #1B1712;
  --rule: rgba(27,23,18,.18);
  --muted: rgba(27,23,18,.6);
  background: var(--paper);
  color: var(--ink);
  padding: 3rem 2.75rem 3.5rem;
}
.dir-monograph .display {
  font-family: var(--f-display);
  font-weight: 400;
  font-size: 3.4rem;
  line-height: 1.02;
  letter-spacing: -0.015em;
  margin: 0 0 .9rem;
}
.dir-monograph .tagline {
  font-family: var(--f-body);
  font-weight: 300;
  font-style: italic;
  font-size: 1.2rem;
  line-height: 1.4;
  color: var(--muted);
  margin: 0 0 2.2rem;
}
.dir-monograph .body {
  font-family: var(--f-body);
  font-weight: 400;
  font-size: 1.0625rem;
  line-height: 1.68;
  max-width: 60ch;
  margin: 0 0 2.4rem;
}
.dir-monograph .label {
  font-family: var(--f-mono);
  font-size: .625rem;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: var(--muted);
  display: block;
  padding-bottom: .55rem;
  border-bottom: 1px solid var(--rule);
  margin-bottom: 1rem;
}
.dir-monograph .list { font-family: var(--f-body); font-size: 1rem; line-height: 2; margin: 0; }
.dir-monograph .card-title { font-family: var(--f-display); font-size: 1.5rem; font-weight: 400; margin: .7rem 0 .2rem; }
.dir-monograph .card-meta { font-family: var(--f-mono); font-size: .625rem; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
.dir-monograph .card-body { font-family: var(--f-body); font-size: .95rem; line-height: 1.6; color: var(--muted); margin-top: .5rem; }
.dir-monograph .readout { font-family: var(--f-mono); font-size: .625rem; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
.dir-monograph .swatch { border: 1px solid var(--rule); }

/* ── SWISS TECHNICAL ───────────────────────────────────────────────────
   Neo-grotesque on a visible grid. Left-ranged, tight, one signal colour.
   Mono only as numeric counterpoint. Nothing centred, nothing warm. */
.dir-swiss {
  --paper: #FFFFFF;
  --ink: #0B0B0C;
  --rule: rgba(0,0,0,.13);
  --muted: rgba(0,0,0,.52);
  --signal: #E5342A;
  background: var(--paper);
  color: var(--ink);
  padding: 3rem 2.75rem 3.5rem;
  font-family: var(--f-grotesk);
  position: relative;
}
/* the grid is part of the design, not a guide */
.dir-swiss::before {
  content: '';
  position: absolute; inset: 0;
  pointer-events: none;
  background-image: repeating-linear-gradient(to right, var(--rule) 0 1px, transparent 1px calc(100% / 6));
  opacity: .5;
}
.dir-swiss > * { position: relative; }
.dir-swiss .display {
  font-weight: 600;
  font-size: 2.7rem;
  line-height: 1.04;
  letter-spacing: -0.03em;
  margin: 0 0 .7rem;
}
.dir-swiss .tagline {
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.45;
  letter-spacing: -0.01em;
  color: var(--muted);
  margin: 0 0 2.2rem;
  max-width: 42ch;
}
.dir-swiss .body {
  font-weight: 400;
  font-size: .9375rem;
  line-height: 1.58;
  letter-spacing: -0.005em;
  max-width: 66ch;
  margin: 0 0 2.4rem;
}
.dir-swiss .label {
  font-family: var(--f-mono);
  font-size: .625rem;
  font-weight: 500;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--signal);
  display: flex;
  justify-content: space-between;
  padding-bottom: .5rem;
  border-bottom: 1px solid var(--ink);
  margin-bottom: 1rem;
}
.dir-swiss .list { font-size: .9375rem; line-height: 1.9; margin: 0; }
.dir-swiss .card-title { font-size: 1.0625rem; font-weight: 600; letter-spacing: -0.015em; margin: .7rem 0 .15rem; }
.dir-swiss .card-meta { font-family: var(--f-mono); font-size: .625rem; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
.dir-swiss .card-body { font-size: .875rem; line-height: 1.55; color: var(--muted); margin-top: .5rem; }
.dir-swiss .readout { font-family: var(--f-mono); font-size: .625rem; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); font-variant-numeric: tabular-nums; }
.dir-swiss .swatch { border: 1px solid var(--rule); }

/* shared scaffolding */
.cmp-grid { display: grid; grid-template-columns: 1fr; }
@media (min-width: 1100px) { .cmp-grid { grid-template-columns: 1fr 1fr; } }
.cmp-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2.4rem; }
.cmp-name { font-size: .6875rem; letter-spacing: .18em; text-transform: uppercase; }
.cmp-sec { margin-bottom: 2.4rem; }
.cmp-well { aspect-ratio: 4/3; overflow: hidden; background: rgba(0,0,0,.06); }
.cmp-well img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cmp-scale > div { display: flex; align-items: baseline; gap: 1rem; margin-bottom: .35rem; }
.cmp-swatches { display: flex; gap: .5rem; }
.cmp-swatches span { width: 2.4rem; height: 2.4rem; display: block; }
.cmp-banner { padding: .9rem 2.75rem; font: 500 11px/1.4 var(--f-mono); letter-spacing: .12em; text-transform: uppercase; display: flex; justify-content: space-between; }
`

function Specimen({ dir }: { dir: 'monograph' | 'swiss' }) {
  const swiss = dir === 'swiss'
  return (
    <div className={`dir-${dir}`}>
      <div className="cmp-head">
        <span className="cmp-name" style={{ fontFamily: swiss ? 'var(--f-mono)' : 'var(--f-mono)' }}>
          Anshul Suthar
        </span>
        <span className="readout">{swiss ? 'Index 01 / 03' : '01A · HP5'}</span>
      </div>

      <h1 className="display">{swiss ? 'Product designer, India' : 'A curious designer from India'}</h1>
      <p className="tagline">
        {swiss
          ? 'Design as problem-solving and systems that scale.'
          : 'Design as solving real problems, and building systems that scale.'}
      </p>
      <p className="body">{BODY}</p>

      <div className="cmp-sec">
        <span className="label">
          <span>Selected work</span>
          {swiss && <span>02</span>}
        </span>
        <div className="cmp-well">
          <img src="/images/Solic%20Arc/Thumbnail.png" alt="" />
        </div>
        <div className="card-meta">{swiss ? 'Industrial design — 2025' : 'Industrial design, 2025'}</div>
        <h3 className="card-title">Solic Arc</h3>
        <p className="card-body">
          An ergonomic electric guitar built from surveys with 150+ players and 20 interviews with
          luthiers.
        </p>
      </div>

      <div className="cmp-sec">
        <span className="label">
          <span>Skills</span>
          {swiss && <span>03</span>}
        </span>
        <div className="list">
          User research
          <br />
          Design systems
          <br />
          Industrial design
        </div>
      </div>

      <div className="cmp-sec">
        <span className="label">
          <span>Type scale</span>
          {swiss && <span>04</span>}
        </span>
        <div className="cmp-scale">
          <div>
            <span className="readout">44</span>
            <span className="display" style={{ fontSize: '2rem', margin: 0 }}>
              Display
            </span>
          </div>
          <div>
            <span className="readout">18</span>
            <span className="tagline" style={{ fontSize: '1.125rem', margin: 0 }}>
              Subhead
            </span>
          </div>
          <div>
            <span className="readout">16</span>
            <span className="body" style={{ margin: 0 }}>
              Body copy
            </span>
          </div>
          <div>
            <span className="readout">10</span>
            <span className="readout">Label / readout</span>
          </div>
        </div>
      </div>

      <div className="cmp-sec">
        <span className="label">
          <span>Palette</span>
          {swiss && <span>05</span>}
        </span>
        <div className="cmp-swatches">
          <span className="swatch" style={{ background: 'var(--paper)' }} />
          <span className="swatch" style={{ background: 'var(--muted)' }} />
          <span className="swatch" style={{ background: 'var(--ink)' }} />
          {swiss && <span className="swatch" style={{ background: 'var(--signal)' }} />}
        </div>
        <p className="readout" style={{ marginTop: '.6rem' }}>
          {swiss ? 'Mono + one signal (red)' : 'Ink and paper — no accent'}
        </p>
      </div>
    </div>
  )
}

export default function ComparePage() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <div
      className="cmp"
      style={
        {
          '--f-display': fraunces.style.fontFamily,
          '--f-body': newsreader.style.fontFamily,
          '--f-grotesk': inter.style.fontFamily,
          '--f-mono': mono.style.fontFamily,
          minHeight: '100vh',
          background: '#111',
        } as React.CSSProperties
      }
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="cmp-banner" style={{ background: '#111', color: '#fff' }}>
        <span>Direction comparison — same copy, same photo</span>
        <span>Left: Monograph · Right: Swiss Technical</span>
      </div>

      <div className="cmp-grid">
        <Specimen dir="monograph" />
        <Specimen dir="swiss" />
      </div>

      <div className="cmp-banner" style={{ background: '#111', color: 'rgba(255,255,255,.6)' }}>
        <span>Fraunces + Newsreader + JetBrains Mono</span>
        <span>Inter + JetBrains Mono</span>
      </div>
    </div>
  )
}
