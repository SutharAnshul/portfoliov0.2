'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  PRESETS,
  activePreset,
  attachCues,
  isOn,
  setOn,
  setPreset,
  subscribe,
  wantsOn,
  type PresetId,
} from '@/lib/audio'
import { IconNext, IconPause, IconPlay, IconPrev } from '@/components/Icons'

/**
 * The transport.
 *
 * Five pieces is too few to justify a list, so it behaves like a deck: prev,
 * play/pause, next, and a display that reads the current track. The title pans
 * right-to-left only when it actually overflows, measured rather than assumed.
 *
 * The four corner crosses are structural — they mark the bounding box and read
 * as the screws holding the faceplate on, echoing the crosshair cursor.
 */
export function SoundControl() {
  const [on, setOnState] = useState(false)
  const [preset, setPresetState] = useState<PresetId>('piano')
  const [overflow, setOverflow] = useState(false)

  const trackRef = useRef<HTMLSpanElement>(null)
  const windowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    attachCues()
    setPresetState(activePreset())
    setOnState(wantsOn())
    return subscribe(() => {
      setOnState(isOn())
      setPresetState(activePreset())
    })
  }, [])

  /**
   * The room is on by default — but no browser will let it sound before a
   * gesture, and none should. So it starts at the first thing the visitor does,
   * once. Anyone who turned it off stays off, because this reads the stored
   * preference rather than assuming one.
   */
  useEffect(() => {
    if (!wantsOn() || isOn()) return

    const begin = () => {
      for (const ev of ['pointerdown', 'keydown', 'wheel'] as const) {
        window.removeEventListener(ev, begin)
      }
      if (wantsOn() && !isOn()) void setOn(true)
    }

    window.addEventListener('pointerdown', begin, { once: true })
    window.addEventListener('keydown', begin, { once: true })
    window.addEventListener('wheel', begin, { once: true, passive: true })

    return () => {
      for (const ev of ['pointerdown', 'keydown', 'wheel'] as const) {
        window.removeEventListener(ev, begin)
      }
    }
  }, [])

  const index = PRESETS.findIndex((p) => p.id === preset)
  const active = PRESETS[index >= 0 ? index : 0]

  // Pan only when the title genuinely does not fit. Measured after paint, and
  // re-measured whenever the title or the panel width changes.
  useEffect(() => {
    const el = trackRef.current
    const box = windowRef.current
    if (!el || !box) return
    const check = () => setOverflow(el.scrollWidth > box.clientWidth + 2)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(box)
    return () => ro.disconnect()
  }, [active.id])

  const step = useCallback(
    (dir: 1 | -1) => {
      const next = PRESETS[(index + dir + PRESETS.length) % PRESETS.length]
      setPreset(next.id)
      setPresetState(next.id)
    },
    [index],
  )

  const label = `${active.name} — ${active.note}`

  return (
    <div className="player" data-on={on}>
      {/* Corner screws: bounding box and fixings in one mark */}
      <span className="player-screw player-screw-tl" aria-hidden="true" />
      <span className="player-screw player-screw-tr" aria-hidden="true" />
      <span className="player-screw player-screw-bl" aria-hidden="true" />
      <span className="player-screw player-screw-br" aria-hidden="true" />

      <div className="player-row">
        <div className="player-transport">
          <button
            type="button"
            onClick={() => step(-1)}
            data-sfx="tick"
            aria-label="Previous track"
          >
            <IconPrev size={13} />
          </button>
          <button
            type="button"
            className="player-play"
            onClick={() => setOn(!on)}
            data-sfx="tick"
            aria-label={on ? 'Pause' : 'Play'}
            aria-pressed={on}
          >
            {on ? <IconPause size={13} /> : <IconPlay size={13} />}
          </button>
          <button type="button" onClick={() => step(1)} data-sfx="tick" aria-label="Next track">
            <IconNext size={13} />
          </button>
        </div>

        {/* Level meter — still when paused */}
        <span className="player-meter" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>

      {/* Display */}
      <div ref={windowRef} className="player-window" data-pan={overflow}>
        <span ref={trackRef} className="player-track">
          {label}
        </span>
        {overflow && (
          <span className="player-track" aria-hidden="true">
            {label}
          </span>
        )}
      </div>

      <div className="player-foot">
        <span>
          {String(index + 1).padStart(2, '0')} / {String(PRESETS.length).padStart(2, '0')}
        </span>
        <span>{on ? 'Playing' : 'Paused'}</span>
      </div>
    </div>
  )
}
