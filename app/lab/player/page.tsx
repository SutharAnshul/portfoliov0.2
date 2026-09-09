'use client'

import './player.css'

import { useEffect, useState } from 'react'
import {
  PRESETS,
  activePreset,
  isOn,
  setOn,
  setPreset,
  subscribe,
  type PresetId,
} from '@/lib/audio'
import { DirectionDeck, DirectionPath, DirectionShelf, DirectionTube } from './directions'

/**
 * Four music players, side by side, all driving the same engine.
 *
 * These are prototypes to choose between, not four things to ship. Each one
 * is wired to the real `lib/audio.ts` — the transport under each panel starts
 * and stops the actual room tone, and every visual is drawn from an analyser
 * on the master bus. Nothing here is animated on a timer pretending to be
 * sound.
 *
 * The one thing to keep in mind while looking: the audio is synthesised, so
 * there is no file, no duration and no position. Any player that shows a
 * scrubber, a remaining time or a waveform-of-the-whole-track is inventing it.
 * That constraint is why the four directions differ in the way they do.
 */

const NOTES: Record<string, { title: string; blurb: string; cost: string; risk: string }> = {
  tube: {
    title: 'A · The Tube',
    blurb:
      'The player is another CRT. What is on it is an oscilloscope trace of the master bus, with real phosphor persistence — the history is decayed in a framebuffer rather than cleared, so what you see is the last several sweeps at once. Changing preset is changing channel.',
    cost: 'Cheapest: reuses the shader work already done for the portrait and the work tiles.',
    risk: 'Saturation. There is already a tube on About and one on every thumbnail. A fourth stops being a motif and becomes a filter.',
  },
  deck: {
    title: 'B · The Deck',
    blurb:
      'Transport hardware. The craft is in the ballistics, not the shader: the meter has a needle’s mass — fast attack, slow release, about 300ms to settle — and it is that lag that makes it read as a mechanism rather than as a graph. Peak hold falls on its own, slower clock.',
    cost: 'Moderate. Meter is simple; the reels and faceplate are pixel-art production work.',
    risk: 'A deck implies a tape, and a tape implies a position that does not exist. It has to be an endless-loop cartridge, or it is lying.',
  },
  path: {
    title: 'C · The Signal Path',
    blurb:
      'Studio equipment, not a consumer device. The display is the synthesis graph itself: oscillators, LFO, filter, reverb, bus, compressor — the chain `audio.ts` actually builds. The pulse travelling each wire is the signal moving through it.',
    cost: 'Moderate. Topology is free; honest per-node levels mean instrumenting every generator.',
    risk: 'It has to still work as a play button for the people who do not care about the graph.',
  },
  shelf: {
    title: 'D · The Cartridge Shelf',
    blurb:
      'The six presets as six objects, on the icons’ own 12-cell grid. Each label is a spectrogram of its own preset, so the shelf is six visibly different things and the one playing is the one moving. Click a cartridge to insert it.',
    cost: 'Highest. Six pieces of art, plus the insert mechanics.',
    risk: 'Most decorative of the four, and the one most likely to read as skeuomorphic pastiche.',
  },
}

function Transport({
  on,
  onToggle,
  preset,
  onPreset,
}: {
  on: boolean
  onToggle: () => void
  preset: PresetId
  onPreset: (id: PresetId) => void
}) {
  return (
    <div className="pl-transport">
      <button className="pl-btn" onClick={onToggle} type="button" data-on={on}>
        {on ? '■ STOP' : '▶ PLAY'}
      </button>
      <select
        className="pl-select"
        value={preset}
        onChange={(e) => onPreset(e.target.value as PresetId)}
        aria-label="Preset"
      >
        {PRESETS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  )
}

function Panel({
  id,
  children,
  transport,
}: {
  id: keyof typeof NOTES
  children: React.ReactNode
  transport?: React.ReactNode
}) {
  const n = NOTES[id]
  return (
    <section className="pl-panel">
      <h2 className="pl-title">{n.title}</h2>
      <div className="pl-stage">{children}</div>
      {transport}
      <p className="pl-blurb">{n.blurb}</p>
      <dl className="pl-meta">
        <dt>Cost</dt>
        <dd>{n.cost}</dd>
        <dt>Risk</dt>
        <dd>{n.risk}</dd>
      </dl>
    </section>
  )
}

export default function PlayerLab() {
  const [on, setOnState] = useState(false)
  const [preset, setPresetState] = useState<PresetId>('piano')

  useEffect(() => {
    setOnState(isOn())
    setPresetState(activePreset())
    return subscribe(() => {
      setOnState(isOn())
      setPresetState(activePreset())
    })
  }, [])

  const toggle = () => void setOn(!on)
  const pick = (id: PresetId) => {
    setPreset(id)
    setPresetState(id)
    if (!isOn()) void setOn(true)
  }

  return (
    <div className="pl-page">
      <header className="pl-head">
        <h1>Music player · four directions</h1>
        <p>
          All four drive the real engine and draw from an analyser on the master bus — nothing here
          is on a timer pretending to be sound. Press play on any panel; they share one transport,
          so they all show the same signal at once, which is the point.
        </p>
        <p className="pl-warn">
          The audio is synthesised, so there is no file, no duration and no position. Any player
          that shows a scrubber or a remaining time would be inventing it. That is the constraint
          the four directions are answering in different ways.
        </p>
        <Transport on={on} onToggle={toggle} preset={preset} onPreset={pick} />
      </header>

      <div className="pl-grid">
        <Panel id="tube">
          <DirectionTube on={on} />
        </Panel>

        <Panel id="deck">
          <DirectionDeck on={on} />
        </Panel>

        <Panel id="path">
          <DirectionPath on={on} />
        </Panel>

        <Panel id="shelf">
          <DirectionShelf on={on} preset={preset} onPick={pick} />
        </Panel>
      </div>
    </div>
  )
}
