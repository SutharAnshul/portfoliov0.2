'use client'

import { CrtScreen } from '@/components/CrtScreen'

/**
 * Four ways for a tube to be blown.
 *
 * A scratch page: pick one and it goes to CH01, then this directory goes away.
 *
 * All three are the same shader. What separates them is which part of the set
 * has given out, because a television does not fail generically — the supply
 * goes, or the sync goes, or the signal goes, and each of those looks like
 * something different. "Everything at once" was the previous version and it
 * read as a filter rather than as a fault.
 *
 * Nothing here loops. The drifting positions are sums of sines at rates with
 * no common multiple, and the events are drawn from a hash that keeps its
 * footing however long the page has been open — the old one lost precision
 * after a couple of minutes and settled into a handful of repeating values,
 * which is what made the first pass feel like a two-second animation.
 */

const SHOT = {
  src: '/images/anshul-left.jpg',
  frames: ['/images/anshul-front.jpg', '/images/anshul-right.jpg'],
  alt: 'Anshul Suthar',
}

const OPTIONS = [
  {
    id: 'E',
    name: 'Flyback going',
    note:
      'The supply cannot hold. The raster swells as the beam weakens, so the picture grows and dims in the same breath and then snaps back — wider than it is taller, because the horizontal scan gives out first. Sync is intact, so the frame stays where it is put. This is the one that still looks like a photograph of someone, taken on a set that is dying.',
    props: { instability: 0.5, roll: 0.18, tear: 0.25, sag: 0.85, snow: 0.12, lines: 150, mask: 0.62, bloomAmount: 0.42, shift: 2.0, warp: 0.2 },
  },
  {
    id: 'F',
    name: 'Sync collapsed',
    note:
      'Nothing is held. The frame drifts constantly and every few seconds loses its grip entirely and runs, each slip at its own speed and length and sometimes upward. Blocks of lines shove sideways over the top of it. The picture is all there — you just cannot keep your eye on it.',
    props: { instability: 0.8, roll: 1, tear: 0.9, sag: 0.2, snow: 0.1, lines: 165, mask: 0.5, bloomAmount: 0.24, shift: 2.6, warp: 0.14 },
  },
  {
    id: 'G',
    name: 'Signal gone',
    note:
      'The set is fine; there is nothing coming in. Static washes through in bursts with long quiet between them, the picture surfacing and going under, and now and then the signal drops out altogether and there is nothing but snow. The face is genuinely lost some of the time — which is either the point or the problem, depending on what CH01 is for.',
    props: { instability: 0.9, roll: 0.55, tear: 0.75, sag: 0.45, snow: 0.95, lines: 190, mask: 0.55, bloomAmount: 0.3, shift: 2.2, warp: 0.18 },
  },
  {
    id: 'H',
    name: 'Out of phase',
    note:
      'The timebase will not lock, and the set spends the whole time hunting for it. The three guns swing apart and cross over — the fringe on an edge goes from warm to cool and back, which is the only colour on a black-and-white picture and so reads as a fault rather than a filter. The line start slides sideways with it, and the raster crawls up through the image as the scanlines beat against the picture. Slower and stranger than the other three: nothing bangs, it just never settles.',
    props: { instability: 0.55, roll: 0.3, tear: 0.4, sag: 0.35, snow: 0.15, phase: 0.9, lines: 175, mask: 0.6, bloomAmount: 0.32, shift: 1.6, warp: 0.16 },
  },
]

export default function Page() {
  return (
    <div className="crtlab">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <p className="crtlab-head">
        Four blown tubes · same picture, same shader, different part of the set gone · backdrop
        keyed and replaced with noise in all four · watch each for ten seconds, the faults are
        intermittent by design
      </p>
      <div className="crtlab-grid">
        {OPTIONS.map((o) => (
          <figure className="crtlab-cell" key={o.id}>
            <div className="crtlab-screen">
              <CrtScreen
                {...SHOT}
                {...o.props}
                frameMs={900}
                focusY={0.36}
                keyStrength={1}
                keyBand={[0.08, 0.34]}
                glow={false}
              />
            </div>
            <figcaption>
              <b>
                {o.id} — {o.name}
              </b>
              <span>{o.note}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}

const CSS = `
.crtlab {
  position: fixed; inset: 0; z-index: 500; overflow: auto;
  background: #000; padding: 28px 32px 40px;
  font-family: var(--family-ui);
}
.crtlab-head {
  font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
  color: #6c6c74; margin: 0 0 22px; max-width: 78ch; line-height: 1.7;
}
.crtlab-grid {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 26px 22px;
}
.crtlab-cell { margin: 0; display: grid; gap: 12px; }
.crtlab-screen { aspect-ratio: 4 / 3; }
.crtlab-cell figcaption { display: grid; gap: 6px; }
.crtlab-cell b {
  font-size: 12px; font-weight: 400; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--brand);
}
.crtlab-cell span {
  font-family: var(--family-read); font-size: 12.5px; line-height: 1.6;
  color: color-mix(in srgb, #fff 62%, transparent);
}
@media (max-width: 1100px) {
  .crtlab-grid { grid-template-columns: minmax(0, 1fr); max-width: 640px; }
}
`
