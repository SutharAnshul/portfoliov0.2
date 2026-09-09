'use client'

import { useEffect, useState } from 'react'
import { CrtScreen } from '@/components/CrtScreen'
import { PixelIcon } from '@/components/PixelIcon'
import { caseStudies } from '@/lib/case-studies'

/**
 * The card direction.
 *
 * The reference cards are built on a cell grid and every edge lands on it —
 * the corners step rather than curve, the rails are runs of whole cells, the
 * badge is a rasterised disc. So the frame here is *computed* on that grid
 * rather than drawn with CSS borders and a border-radius: a radius would put
 * an antialiased curve on a card whose whole argument is that it has none.
 *
 * One cell is the unit for everything, text included. Nothing is positioned in
 * pixels; it is positioned in cells, so the card can be re-rendered at any cell
 * size and stay exactly itself.
 *
 * The same rule as the last round holds: a number on this card has to be a
 * number the site already knows. A card with an HP stat is inviting me to
 * invent one, and the moment a portfolio prints a made-up 20 next to a heart it
 * has stopped being a portfolio. So the reference's HP badge carries years
 * active, its secondary stat carries the count of case studies, and the two
 * rails of gem slots are those same two counts drawn instead of written — four
 * slots in the studies' own colours down one edge, six years down the other.
 */

const PHOTO = '/images/anshul-pixel.png'

/* ── Frame ────────────────────────────────────────────────────────────────
   The card is 60 cells wide and 84 tall. Everything below is in cells. */
const W = 60
const H = 84
/* Full bleed, not a window.
   My first pass framed the art in its own well with a band of card above and
   below it. Looking again at the references, there is no window: the picture
   runs edge to edge inside the border and every other part — the badge, the
   name, the rule, the rails, the mark — floats on top of it. That single
   difference is most of why mine read as a UI panel and theirs read as a card.
   So the art is laid down first and the frame is drawn over it. */
const ART = { x: 3, y: 3, w: W - 6, h: H - 6 }

type Rect = { x: number; y: number; w: number; h: number; f: string }

/**
 * A ring with stepped corners: the straight runs stop short by `r` and the
 * corner is filled by the steps between them. At r = 2 this is the reference's
 * corner exactly — two cells of stair, no curve.
 */
function ring(x: number, y: number, w: number, h: number, r: number, f: string): Rect[] {
  const out: Rect[] = [
    { x: x + r, y, w: w - r * 2, h: 1, f },
    { x: x + r, y: y + h - 1, w: w - r * 2, h: 1, f },
    { x, y: y + r, w: 1, h: h - r * 2, f },
    { x: x + w - 1, y: y + r, w: 1, h: h - r * 2, f },
  ]
  for (let i = 0; i < r; i++) {
    const d = r - 1 - i
    out.push(
      { x: x + d, y: y + i, w: 1, h: 1, f },
      { x: x + w - 1 - d, y: y + i, w: 1, h: 1, f },
      { x: x + d, y: y + h - 1 - i, w: 1, h: 1, f },
      { x: x + w - 1 - d, y: y + h - 1 - i, w: 1, h: 1, f },
    )
  }
  return out
}

/** A rasterised disc — the badge behind the headline number. */
function disc(cx: number, cy: number, r: number, f: string): Rect[] {
  const out: Rect[] = []
  for (let y = -r; y <= r; y++) {
    const half = Math.floor(Math.sqrt(Math.max(r * r - y * y, 0)))
    if (half <= 0 && Math.abs(y) === r) continue
    out.push({ x: cx - half, y: cy + y, w: half * 2 + 1, h: 1, f })
  }
  return out
}

/** Six by six, hand-set: the mark in the card's bottom corner. */
const SHIELD = ['WWWWWW', 'W....W', 'W....W', '.W..W.', '..WW..', '......']

type Skin = { deep: string; ground: string; mid: string; gold: string; name: string }

const SKINS: Record<string, Skin> = {
  anshul: { deep: '#150d14', ground: '#2e1d2a', mid: '#40283a', gold: '#e0b055', name: 'var(--brand)' },
  study: { deep: '#0e1418', ground: '#16242b', mid: '#1e333d', gold: '#cfd8dd', name: '#cfd8dd' },
}

/**
 * The frame, as one SVG of flat rects.
 *
 * It sits behind the art and the type rather than around them, which is why
 * the art window is a hole cut in the fill and not a element stacked on top:
 * the tube has to sit *in* the card, with the frame's own edge over it.
 */
function Frame({ skin, pips }: { skin: Skin; pips: { left: string[]; right: string[] } }) {
  const r: Rect[] = []

  /* Two strokes with the card's own dark between them, which is the border on
     both references: a pale outer hairline, a cell of shadow, then the gold. */
  r.push(...ring(0, 0, W, H, 3, skin.gold))
  r.push(...ring(1, 1, W - 2, H - 2, 3, skin.deep))
  r.push(...ring(2, 2, W - 4, H - 4, 3, skin.gold))

  // The corners themselves get a cell of shadow inside the gold, which is what
  // makes the stair read as bevelled rather than as a staircase.
  r.push(...ring(3, 3, W - 6, H - 6, 2, skin.deep))

  /* The rule under the name, and the small hook turning up off its right end —
     the one flourish on an otherwise square frame, and the detail that most
     says "card" rather than "panel". */
  r.push({ x: 21, y: 13, w: W - 27, h: 1, f: skin.gold })
  r.push({ x: W - 7, y: 11, w: 1, h: 3, f: skin.gold })

  /* The badge, overlapping the top-left corner the way the references do:
     a gold disc with a dark face, so the number reads out of a hole. */
  r.push(...disc(10, 9, 8, skin.gold))
  r.push(...disc(10, 9, 7, skin.deep))

  /* Gem rails, set in a groove: a dark slot with the stone inside it. Four down
     one edge and six down the other — the two counts, drawn instead of typed. */
  const rail = (x: number, list: string[]) => {
    const h = list.length * 4 + 1
    r.push({ x: x - 1, y: 25, w: 4, h, f: skin.deep })
    list.forEach((f, i) => r.push({ x, y: 26 + i * 4, w: 2, h: 2, f }))
  }
  rail(5, pips.left)
  rail(W - 7, pips.right)

  // The mark, bottom right, and the two dots opposite it.
  SHIELD.forEach((row, y) =>
    [...row].forEach((c, x) => {
      if (c === 'W') r.push({ x: W - 11 + x, y: H - 11 + y, w: 1, h: 1, f: skin.gold })
    }),
  )
  r.push({ x: 6, y: H - 8, w: 2, h: 2, f: skin.gold }, { x: 10, y: H - 8, w: 2, h: 2, f: skin.gold })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} shapeRendering="crispEdges" className="card-frame" aria-hidden="true">
      {r.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} fill={c.f} />
      ))}
    </svg>
  )
}

function Card({
  skin,
  cell,
  name,
  stat,
  statSub,
  sub,
  foot,
  pips,
  children,
}: {
  skin: Skin
  cell: number
  name: string
  stat: string
  statSub: string
  sub: string
  foot: string
  pips: { left: string[]; right: string[] }
  children: React.ReactNode
}) {
  const at = (x: number, y: number, w?: number, h?: number) => ({
    left: x * cell,
    top: y * cell,
    ...(w ? { width: w * cell } : null),
    ...(h ? { height: h * cell } : null),
  })
  return (
    <div className="card" style={{ width: W * cell, height: H * cell, ['--c' as string]: `${cell}px` }}>
      {/* Art first: everything after it is chrome laid over the picture. */}
      <div className="card-art" style={{ ...at(ART.x, ART.y, ART.w, ART.h), background: skin.ground }}>
        {children}
        {/* The references darken the head and foot of the picture so the type
            has something to sit on. It is part of the card, not a fix for a
            particular photograph. */}
        <span
          className="card-shade"
          style={{
            background: `linear-gradient(${skin.deep} 0%, transparent 26%, transparent 74%, ${skin.deep} 100%)`,
          }}
        />
      </div>
      <Frame skin={skin} pips={pips} />
      <div className="card-stat" style={{ ...at(3, 4, 14, 11), color: skin.gold }}>
        <b>{stat}</b>
        <i>{statSub}</i>
      </div>
      <div className="card-name" style={{ ...at(21, 5), color: skin.name }}>
        {name}
      </div>
      <div className="card-sub" style={{ ...at(21, 9.4), color: skin.gold, opacity: 0.55 }}>
        {sub}
      </div>
      <div className="card-foot" style={{ ...at(16, H - 8, W - 28), color: skin.gold }}>
        {foot}
      </div>
    </div>
  )
}

/* Counts, read off the work rather than typed beside it. */
const HUES: Record<string, string> = {
  'Product Design': 'var(--brand)',
  'Design System': '#1fa8c4',
  'Industrial Design': '#2fa85c',
}
const STUDY_PIPS = caseStudies.map((s) => HUES[s.category] ?? '#e09420')
const YEAR_PIPS = Array.from({ length: 6 }, () => '#e0b055')

function Hero({ cell }: { cell: number }) {
  return (
    <Card
      skin={SKINS.anshul}
      cell={cell}
      name="ANSHUL SUTHAR"
      stat="06"
      statSub="04"
      sub="PRODUCT DESIGNER"
      foot="INDIA — OPEN TO WORK"
      pips={{ left: STUDY_PIPS, right: YEAR_PIPS }}
    >
      <CrtScreen src={PHOTO} alt="Anshul Suthar" lines={120} warp={0.16} pixelated glow={false} />
    </Card>
  )
}

/* ── C1. The card alone ───────────────────────────────────────────────────
   The reference, transcribed onto this site's material: the badge carries
   years rather than hit points, the rails carry the two counts, and the art
   well holds the tube. */
function Solo() {
  return (
    <div className="hud hud-solo">
      <Hero cell={6} />
    </div>
  )
}

/* ── C2. Card and record ──────────────────────────────────────────────────
   The card doing the job the portrait does today — the object on the left of
   the About band — with the timeline beside it. This is the one that could
   ship without the page being redrawn around it. */
function WithRecord() {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    const d = new Date()
    setNow((d.getFullYear() - 2021) * 12 + d.getMonth())
  }, [])
  const RECORD = [
    { label: 'B.Des.', place: 'IIT Guwahati', a: 0, b: 59, hue: '#7c4dff', open: false },
    { label: 'Co-Founder', place: 'Herbal Mitra', a: 30, b: now ?? 71, hue: 'var(--brand)', open: true },
    { label: 'Growth', place: 'Impact Acq.', a: 39, b: 54, hue: '#e09420', open: false },
    { label: 'Designer', place: 'CNVRT Labs', a: 44, b: 61, hue: '#1fa8c4', open: false },
    { label: 'Designer', place: 'SuperHealth', a: 64, b: 66, hue: '#2fa85c', open: false },
  ]
  return (
    <div className="hud hud-pair">
      <Hero cell={5} />
      <div className="pair-side">
        <div className="gantt">
          {RECORD.map((s) => (
            <div className="gantt-row" key={s.place}>
              <span className="gantt-lab">
                {s.label}
                <em>{s.place}</em>
              </span>
              <span className="gantt-track">
                <i
                  className="gantt-bar"
                  data-open={s.open ? 'true' : undefined}
                  style={{
                    left: `calc(${s.a} * var(--cell))`,
                    width: `calc(${s.b - s.a + 1} * var(--cell) - 1px)`,
                    background: s.hue,
                  }}
                />
              </span>
            </div>
          ))}
          <div className="gantt-row gantt-axis">
            <span className="gantt-lab" />
            <span className="gantt-track">
              {[2021, 2022, 2023, 2024, 2025, 2026].map((y, i) => (
                <b key={y} style={{ left: `calc(${i * 12} * var(--cell))` }}>
                  {y}
                </b>
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── C3. The rack ─────────────────────────────────────────────────────────
   The frame is a system, not a one-off: the same generator produces a card per
   case study, in that study's own colour, carrying its numeral tile. This is
   the version that replaces the sidebar's list rather than the About photo. */
function Rack() {
  return (
    <div className="hud hud-rack">
      <Hero cell={4} />
      {caseStudies.map((s, i) => {
        const hue = HUES[s.category] ?? '#e09420'
        return (
          <Card
            key={s.slug}
            skin={{ ...SKINS.study, gold: hue, name: hue }}
            cell={4}
            name={s.title.toUpperCase()}
            stat={String(i + 1).padStart(2, '0')}
            statSub={String(s.year).slice(2)}
            sub={s.category.toUpperCase()}
            foot={String(s.year)}
            pips={{ left: [hue], right: [hue] }}
          >
            <span className="rack-tile">
              <PixelIcon name={`no${i + 1}`} size={52} />
            </span>
          </Card>
        )
      })}
    </div>
  )
}

export default function Page() {
  return (
    <div className="hud-page">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="hud-lab">
        <p className="hud-tag">C1 — The card</p>
        <Solo />
        <p className="hud-tag">C2 — Card and record</p>
        <WithRecord />
        <p className="hud-tag">C3 — The rack · one frame, five cards</p>
        <Rack />
      </div>
    </div>
  )
}

const CSS = `
.hud-page {
  position: fixed; inset: 0; z-index: 500; overflow: auto;
  background: #000; padding: 40px;
}
.hud-lab { max-width: 860px; margin: 0 auto; display: grid; gap: 14px; }
.hud-tag {
  font-family: var(--family-ui); font-size: 11px; letter-spacing: 0.16em;
  text-transform: uppercase; color: #6c6c74; margin: 30px 0 0;
}
.hud { font-family: var(--family-ui); background: #000; padding: 26px; }
.hud-solo { display: flex; justify-content: center; }
.hud-pair { display: grid; grid-template-columns: auto 1fr; gap: 30px; align-items: center; }
.hud-rack { display: flex; gap: 14px; flex-wrap: wrap; align-items: flex-start; }

/* The card. Everything inside is placed in cells, never in pixels. */
.card { position: relative; flex: none; }
.card-frame { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.card-art { position: absolute; overflow: hidden; }
.card-shade { position: absolute; inset: 0; pointer-events: none; }
.rack-tile { position: absolute; inset: 0; display: grid; place-items: center; }

.card-stat, .card-name, .card-sub, .card-foot { position: absolute; }
/* The badge's number, set on the disc: a big figure and a small one, the way
   the reference stacks a total against a secondary count. */
.card-stat { display: flex; align-items: baseline; justify-content: center; gap: calc(var(--c) * 0.5); }
.card-stat b { font-size: calc(var(--c) * 4.6); font-weight: 400; line-height: 1; letter-spacing: 0; }
.card-stat i { font-size: calc(var(--c) * 2); font-style: normal; opacity: 0.75; }
.card-name { font-size: calc(var(--c) * 2.2); letter-spacing: 0.1em; white-space: nowrap; }
.card-sub { font-size: calc(var(--c) * 1.5); letter-spacing: 0.16em; white-space: nowrap; }
.card-foot { font-size: calc(var(--c) * 1.5); letter-spacing: 0.1em; white-space: nowrap; opacity: 0.8; }

/* ── Gantt (unchanged from A2) ─────────────────────────────────────────── */
.gantt { --cell: 6px; display: grid; gap: 5px; }
.gantt-row { display: grid; grid-template-columns: 118px calc(72 * var(--cell)); gap: 12px; align-items: center; }
.gantt-lab { font-size: 11px; color: #e6e5e5; letter-spacing: 0.06em; display: grid; }
.gantt-lab em { font-style: normal; color: #6c6c74; }
.gantt-track { position: relative; height: 13px; background: repeating-linear-gradient(90deg, #17171b 0 calc(var(--cell) - 1px), #000 calc(var(--cell) - 1px) var(--cell)); }
.gantt-bar { position: absolute; top: 0; height: 13px; display: block; }
.gantt-bar[data-open] { -webkit-mask-image: linear-gradient(90deg, #000 88%, transparent); mask-image: linear-gradient(90deg, #000 88%, transparent); }
.gantt-axis .gantt-track { background: none; height: 14px; }
.gantt-axis b { position: absolute; top: 2px; font-size: 10px; font-weight: 400; color: #55555e; letter-spacing: 0.06em; }
`
