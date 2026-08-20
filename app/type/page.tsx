'use client'

import { useState } from 'react'
import {
  Archivo,
  Martian_Mono,
  Space_Grotesk,
  Space_Mono,
  Instrument_Serif,
  Chivo,
  IBM_Plex_Mono,
  VT323,
  Manrope,
  JetBrains_Mono,
  Newsreader,
} from 'next/font/google'

/**
 * Dark-ground and typeface tester.
 *
 * Dev-only scratch surface: real copy, real photo, real fonts, so the choice is
 * made on the actual thing rather than on descriptions. Delete once decided —
 * only the winning families then move into the root layout.
 */

const archivo = Archivo({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap' })
const martian = Martian_Mono({ subsets: ['latin'], weight: ['400', '500'], display: 'swap' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '700'], display: 'swap' })
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], display: 'swap' })
const instrument = Instrument_Serif({ subsets: ['latin'], weight: ['400'], display: 'swap' })
const chivo = Chivo({ subsets: ['latin'], weight: ['400', '500', '700'], display: 'swap' })
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], display: 'swap' })
const vt = VT323({ subsets: ['latin'], weight: ['400'], display: 'swap' })
const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '700'], display: 'swap' })
const jet = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], display: 'swap' })
const newsreader = Newsreader({ subsets: ['latin'], weight: ['300', '400'], display: 'swap' })

interface FontSystem {
  id: string
  name: string
  note: string
  display: string
  body: string
  mono: string
  /** Display tracking; serifs and grotesques want different values. */
  tracking: string
  displayWeight: number
  caseLabel: 'upper' | 'normal'
}

const SYSTEMS: FontSystem[] = [
  {
    id: 'archivo-martian',
    name: 'Archivo + Martian Mono',
    note: 'Sturdy grotesque, unmistakably technical readouts',
    display: archivo.style.fontFamily,
    body: archivo.style.fontFamily,
    mono: martian.style.fontFamily,
    tracking: '-0.025em',
    displayWeight: 600,
    caseLabel: 'upper',
  },
  {
    id: 'space',
    name: 'Space Grotesk + Space Mono',
    note: 'One design origin, so they cohere. Engineered, not neutral',
    display: spaceGrotesk.style.fontFamily,
    body: spaceGrotesk.style.fontFamily,
    mono: spaceMono.style.fontFamily,
    tracking: '-0.02em',
    displayWeight: 700,
    caseLabel: 'upper',
  },
  {
    id: 'instrument',
    name: 'Instrument Serif + Chivo + Plex Mono',
    note: 'Dramatic display serif over a workhorse grotesque',
    display: instrument.style.fontFamily,
    body: chivo.style.fontFamily,
    mono: plexMono.style.fontFamily,
    tracking: '0em',
    displayWeight: 400,
    caseLabel: 'normal',
  },
  {
    id: 'bitmap',
    name: 'Archivo + VT323',
    note: 'Bitmap readouts — stand-in for Departure Mono, which needs self-hosting',
    display: archivo.style.fontFamily,
    body: archivo.style.fontFamily,
    mono: vt.style.fontFamily,
    tracking: '-0.025em',
    displayWeight: 600,
    caseLabel: 'upper',
  },
  {
    id: 'manrope',
    name: 'Manrope + JetBrains Mono',
    note: 'Warmer neo-grotesque — stand-in for Switzer',
    display: manrope.style.fontFamily,
    body: manrope.style.fontFamily,
    mono: jet.style.fontFamily,
    tracking: '-0.03em',
    displayWeight: 700,
    caseLabel: 'upper',
  },
  {
    id: 'newsreader',
    name: 'Newsreader + Space Grotesk + Space Mono',
    note: 'Serif body for long case studies, grotesque headings',
    display: spaceGrotesk.style.fontFamily,
    body: newsreader.style.fontFamily,
    mono: spaceMono.style.fontFamily,
    tracking: '-0.02em',
    displayWeight: 500,
    caseLabel: 'upper',
  },
]

interface Ground {
  id: string
  name: string
  note: string
  bg: string
  fg: string
  muted: string
  rule: string
  accent: string
  /** Gallery removes the frame so images are the only lit object. */
  framed: boolean
}

const GROUNDS: Ground[] = [
  {
    id: 'safelight',
    name: 'Safelight',
    note: 'The dark mode is the darkroom. Warm, almost no pure white.',
    bg: '#0F0D0B',
    fg: '#EDE6DA',
    muted: '#8C8175',
    rule: 'rgba(237,230,218,.16)',
    accent: '#FF9A4A',
    framed: true,
  },
  {
    id: 'gallery',
    name: 'Gallery',
    note: 'True black. The work is the only bright thing on screen.',
    bg: '#000000',
    fg: '#FFFFFF',
    muted: '#7E7E7E',
    rule: 'rgba(255,255,255,.14)',
    accent: '#FFFFFF',
    framed: false,
  },
  {
    id: 'instrument',
    name: 'Instrument',
    note: 'A machine in a dark room. Cool, hairlines that emit.',
    bg: '#090C11',
    fg: '#DFE5EC',
    muted: '#7C8794',
    rule: '#1D2733',
    accent: '#7C5CFF',
    framed: true,
  },
  {
    id: 'ink',
    name: 'Ink',
    note: 'Night reading, not dark UI. Lower contrast on purpose.',
    bg: '#1A1A18',
    fg: '#C9C4BA',
    muted: '#8A857C',
    rule: 'rgba(201,196,186,.16)',
    accent: '#C9C4BA',
    framed: true,
  },
]

const BODY =
  "I see design as solving real problems and building systems that scale. I work across product, UX, systems design, and even industrial design — I've designed and built an electric guitar. The best outcomes come from questioning, validating, and building with intent."

export default function TypePage() {
  const [sys, setSys] = useState(SYSTEMS[0])
  const [gnd, setGnd] = useState(GROUNDS[0])

  const upper = sys.caseLabel === 'upper'
  const label: React.CSSProperties = {
    fontFamily: sys.mono,
    fontSize: 10,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: gnd.muted,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0b0b0b', color: '#fff' }}>
      {/* Controls */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: '#0b0b0b',
          borderBottom: '1px solid rgba(255,255,255,.16)',
          padding: '0.9rem 1.5rem',
          display: 'flex',
          gap: '2.5rem',
          flexWrap: 'wrap',
          fontFamily: jet.style.fontFamily,
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ opacity: 0.45, marginRight: '.5rem' }}>Type</span>
          {SYSTEMS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSys(s)}
              style={{
                padding: '.32rem .6rem',
                border: '1px solid rgba(255,255,255,.22)',
                background: sys.id === s.id ? '#fff' : 'transparent',
                color: sys.id === s.id ? '#000' : 'rgba(255,255,255,.7)',
                font: 'inherit',
                cursor: 'pointer',
              }}
            >
              {s.name.split(' + ')[0]}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ opacity: 0.45, marginRight: '.5rem' }}>Ground</span>
          {GROUNDS.map((g) => (
            <button
              key={g.id}
              onClick={() => setGnd(g)}
              style={{
                padding: '.32rem .6rem',
                border: '1px solid rgba(255,255,255,.22)',
                background: gnd.id === g.id ? '#fff' : 'transparent',
                color: gnd.id === g.id ? '#000' : 'rgba(255,255,255,.7)',
                font: 'inherit',
                cursor: 'pointer',
              }}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Caption for the current combination */}
      <div
        style={{
          padding: '.7rem 1.5rem',
          background: '#0b0b0b',
          color: 'rgba(255,255,255,.5)',
          fontFamily: jet.style.fontFamily,
          fontSize: 11,
          borderBottom: '1px solid rgba(255,255,255,.1)',
        }}
      >
        {sys.name} — {sys.note} &nbsp;·&nbsp; {gnd.name} — {gnd.note}
      </div>

      {/* Specimen */}
      <div style={{ background: gnd.bg, color: gnd.fg, padding: '3.5rem 3rem 5rem' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          {/* nav row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              paddingBottom: '.75rem',
              borderBottom: `1px solid ${gnd.rule}`,
              marginBottom: '3rem',
            }}
          >
            <span style={{ ...label, color: gnd.fg, fontSize: 11 }}>Anshul Suthar</span>
            <span style={label}>Dev 62% · Zone VI</span>
          </div>

          <h1
            style={{
              fontFamily: sys.display,
              fontWeight: sys.displayWeight,
              fontSize: 'clamp(2.4rem, 5.5vw, 4rem)',
              lineHeight: 1.03,
              letterSpacing: sys.tracking,
              margin: '0 0 1rem',
              textTransform: upper ? 'none' : 'none',
            }}
          >
            {upper ? 'Product designer, India' : 'A curious designer from India'}
          </h1>

          <p
            style={{
              fontFamily: sys.body,
              fontSize: '1.0625rem',
              lineHeight: 1.62,
              color: gnd.muted,
              maxWidth: '62ch',
              margin: '0 0 3rem',
            }}
          >
            {BODY}
          </p>

          {/* section label + work card */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: '.6rem',
              borderBottom: `1px solid ${gnd.rule}`,
              marginBottom: '1.25rem',
            }}
          >
            <span style={{ ...label, color: gnd.accent }}>Selected work</span>
            <span style={label}>01 / 03</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
            <div>
              <div
                style={{
                  aspectRatio: '4/3',
                  overflow: 'hidden',
                  border: gnd.framed ? `1px solid ${gnd.rule}` : 'none',
                }}
              >
                <img
                  src="/images/Solic%20Arc/Thumbnail.png"
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div style={{ ...label, marginTop: '.7rem' }}>Industrial design — 2025</div>
              <h3
                style={{
                  fontFamily: sys.display,
                  fontWeight: sys.displayWeight,
                  fontSize: '1.35rem',
                  letterSpacing: sys.tracking,
                  margin: '.25rem 0 .4rem',
                }}
              >
                Solic Arc
              </h3>
              <p style={{ fontFamily: sys.body, fontSize: '.9rem', lineHeight: 1.55, color: gnd.muted, margin: 0 }}>
                An ergonomic electric guitar built from surveys with 150+ players.
              </p>
            </div>

            {/* readouts — the instrument language in this system */}
            <div>
              <div style={{ ...label, marginBottom: '.9rem' }}>Readouts</div>
              {[
                ['DEV', '62%'],
                ['ZONE', 'VI'],
                ['EXP', '01A · HP5 · 400'],
                ['TRAY', '20°C · Dektol 1:2'],
                ['ADVANCE', '████░░░░ 48%'],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontFamily: sys.mono,
                    fontSize: sys.id === 'bitmap' ? 17 : 12,
                    letterSpacing: sys.id === 'bitmap' ? '0.04em' : '0.08em',
                    padding: '.42rem 0',
                    borderBottom: `1px solid ${gnd.rule}`,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <span style={{ color: gnd.muted }}>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* type ladder */}
          <div style={{ ...label, borderBottom: `1px solid ${gnd.rule}`, paddingBottom: '.6rem', marginBottom: '1.25rem' }}>
            Scale
          </div>
          {[
            [44, 'Display'],
            [28, 'Section head'],
            [17, 'Body copy'],
            [13, 'Caption'],
          ].map(([px, name]) => (
            <div key={String(px)} style={{ display: 'flex', alignItems: 'baseline', gap: '1.25rem', marginBottom: '.4rem' }}>
              <span style={{ ...label, width: 34 }}>{px}</span>
              <span
                style={{
                  fontFamily: Number(px) >= 28 ? sys.display : sys.body,
                  fontWeight: Number(px) >= 28 ? sys.displayWeight : 400,
                  fontSize: Number(px),
                  letterSpacing: Number(px) >= 28 ? sys.tracking : '0',
                  lineHeight: 1.15,
                }}
              >
                {name}
              </span>
            </div>
          ))}

          {/* palette */}
          <div style={{ ...label, borderTop: `1px solid ${gnd.rule}`, paddingTop: '1.25rem', marginTop: '2rem' }}>
            {gnd.bg} · {gnd.fg} · {gnd.muted} · {gnd.accent}
          </div>
        </div>
      </div>
    </div>
  )
}
