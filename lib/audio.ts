'use client'

/**
 * The room's sound.
 *
 * Everything here is synthesised with the Web Audio API — no files. That keeps
 * the payload at zero, avoids licensing entirely, and lets the ambiences run
 * indefinitely without a loop point you can hear. It also means the interaction
 * sounds can be tuned to the room rather than sourced approximately.
 *
 * Two buses:
 *   ambient  six generative museum rooms — what is playing while he works
 *   sfx      short transients tied to interactions
 *
 * Levels are deliberately low. The brief was that you feel it rather than
 * notice it, so nothing here peaks above roughly -22 dBFS and the ambient bed
 * sits far below that.
 *
 * Never autoplays. Browsers block audio before a gesture anyway, but the
 * stronger reason is that sound on a portfolio must be opted into, never
 * sprung on someone in an open-plan office.
 */

export type PresetId = 'piano' | 'strings' | 'glass' | 'choir' | 'nocturne' | 'room'

export interface Preset {
  id: PresetId
  name: string
  note: string
}

export const PRESETS: Preset[] = [
  { id: 'piano', name: 'Piano', note: 'Sparse keys in a long hall' },
  { id: 'strings', name: 'Strings', note: 'A bowed chord, turning slowly' },
  { id: 'glass', name: 'Glass', note: 'Struck bowls, a long way off' },
  { id: 'choir', name: 'Choir', note: 'Wordless voices, far back' },
  { id: 'nocturne', name: 'Nocturne', note: 'A low chord, breathing' },
  { id: 'room', name: 'Room Tone', note: 'Almost silence' },
]

const STORE_ON = 'sound-on'
const STORE_PRESET = 'sound-preset'

const AMBIENT_LEVEL = 0.075
const SFX_LEVEL = 0.09

let ctx: AudioContext | null = null
let master: GainNode | null = null
let ambientBus: GainNode | null = null
let sfxBus: GainNode | null = null
let noiseBuffer: AudioBuffer | null = null

let current: PresetId | null = null
let stopCurrent: (() => void) | null = null
let enabled = false

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function subscribe(fn: () => void) {
  listeners.add(fn)
  // Braced deliberately: Set.delete returns a boolean, and React requires an
  // effect cleanup to return void.
  return () => {
    listeners.delete(fn)
  }
}

export function isOn() {
  return enabled
}

/**
 * Whether sound should be on, before any gesture has happened.
 *
 * Default is on. It cannot actually *sound* until the visitor interacts —
 * every browser blocks that, and rightly — so this is what the control reads
 * and what the first gesture acts on, not a promise that audio is playing.
 */
export function wantsOn(): boolean {
  if (typeof window === 'undefined') return true
  return window.localStorage.getItem(STORE_ON) !== '0'
}

export function activePreset(): PresetId {
  if (current) return current
  if (typeof window === 'undefined') return 'piano'
  const stored = window.localStorage.getItem(STORE_PRESET) as PresetId | null
  return stored && PRESETS.some((p) => p.id === stored) ? stored : 'piano'
}

function ensureContext() {
  if (ctx) return ctx
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  ctx = new Ctor()

  master = ctx.createGain()
  master.gain.value = 0
  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -24
  comp.ratio.value = 6
  master.connect(comp).connect(ctx.destination)

  ambientBus = ctx.createGain()
  ambientBus.gain.value = AMBIENT_LEVEL
  ambientBus.connect(master)

  sfxBus = ctx.createGain()
  sfxBus.gain.value = SFX_LEVEL
  sfxBus.connect(master)

  // Two seconds of white noise, reused by every generator that needs it.
  const len = ctx.sampleRate * 2
  noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = noiseBuffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1

  return ctx
}

function noiseSource(loop = true) {
  const src = ctx!.createBufferSource()
  src.buffer = noiseBuffer
  src.loop = loop
  return src
}

/** Slow random drift, used to keep drones from sitting perfectly still. */
function drift(param: AudioParam, base: number, spread: number, seconds: number) {
  const step = () => {
    if (!ctx) return
    const target = base + (Math.random() * 2 - 1) * spread
    param.linearRampToValueAtTime(target, ctx.currentTime + seconds)
  }
  step()
  return window.setInterval(step, seconds * 1000)
}

// ── Ambient generators ──────────────────────────────────────────────────
// Each returns a teardown function.


function buildNocturne(): () => void {
  const c = ctx!
  const out = c.createGain()
  out.gain.value = 0
  out.connect(ambientBus!)
  out.gain.linearRampToValueAtTime(1, c.currentTime + 4)

  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 900
  lp.connect(out)

  // A minor ninth, voiced wide. Each voice breathes on its own slow LFO so
  // the chord never arrives at a fixed shape.
  const voices = [110, 130.8, 164.8, 196, 246.9]
  const nodes = voices.map((f) => {
    const o = c.createOscillator()
    o.type = 'sine'
    o.frequency.value = f
    o.detune.value = (Math.random() * 2 - 1) * 6

    const g = c.createGain()
    g.gain.value = 0.06

    const lfo = c.createOscillator()
    lfo.frequency.value = 0.03 + Math.random() * 0.05
    const lfoGain = c.createGain()
    lfoGain.gain.value = 0.045
    lfo.connect(lfoGain).connect(g.gain)
    lfo.start()

    o.connect(g).connect(lp)
    o.start()
    return { o, lfo }
  })

  const d = drift(lp.frequency, 900, 260, 11)

  return () => {
    window.clearInterval(d)
    out.gain.linearRampToValueAtTime(0, c.currentTime + 1.5)
    window.setTimeout(() => {
      nodes.forEach(({ o, lfo }) => {
        o.stop()
        lfo.stop()
      })
      out.disconnect()
    }, 1700)
  }
}



function buildRoom(): () => void {
  const c = ctx!
  const out = c.createGain()
  out.gain.value = 0
  out.connect(ambientBus!)
  out.gain.linearRampToValueAtTime(0.55, c.currentTime + 4)

  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 190
  lp.connect(out)

  const n = noiseSource()
  const g = c.createGain()
  g.gain.value = 0.5
  n.connect(g).connect(lp)
  n.start()

  const hum = c.createOscillator()
  hum.type = 'sine'
  hum.frequency.value = 50
  const humGain = c.createGain()
  humGain.gain.value = 0.05
  hum.connect(humGain).connect(out)
  hum.start()

  const d = drift(lp.frequency, 190, 50, 13)

  return () => {
    window.clearInterval(d)
    out.gain.linearRampToValueAtTime(0, c.currentTime + 1.2)
    window.setTimeout(() => {
      n.stop()
      hum.stop()
      out.disconnect()
    }, 1400)
  }
}

const BUILDERS: Record<PresetId, () => () => void> = {
  piano: buildPiano,
  strings: buildStrings,
  glass: buildGlass,
  choir: buildChoir,
  nocturne: buildNocturne,
  room: buildRoom,
}

// ── Interaction sounds ──────────────────────────────────────────────────

/** Very short filtered transient. The building block for every cue below. */
function transient(freq: number, decay: number, gain: number, type: OscillatorType = 'sine') {
  if (!ctx || !enabled) return
  const t = ctx.currentTime
  const o = ctx.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  o.frequency.exponentialRampToValueAtTime(Math.max(freq * 0.4, 40), t + decay)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay)
  o.connect(g).connect(sfxBus!)
  o.start(t)
  o.stop(t + decay + 0.02)
}

function noiseTick(hp: number, decay: number, gain: number) {
  if (!ctx || !enabled) return
  const t = ctx.currentTime
  const n = noiseSource(false)
  const f = ctx.createBiquadFilter()
  f.type = 'highpass'
  f.frequency.value = hp
  const g = ctx.createGain()
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay)
  n.connect(f).connect(g).connect(sfxBus!)
  n.start(t)
  n.stop(t + decay + 0.02)
}

export const sfx = {
  /** Pointer crossing something interactive. Barely there by design. */
  tick() {
    noiseTick(5200, 0.014, 0.05)
  },
  /** Shutter: a noise transient with a little body under it. */
  shutter() {
    noiseTick(2600, 0.03, 0.16)
    transient(220, 0.05, 0.1, 'triangle')
  },
  /** Film advance: a short ratchet of ticks. */
  advance() {
    if (!ctx || !enabled) return
    for (let i = 0; i < 5; i++) {
      window.setTimeout(() => noiseTick(3800 - i * 220, 0.02, 0.09), i * 42)
    }
    window.setTimeout(() => transient(150, 0.09, 0.12, 'square'), 230)
  },
  /** Relay click for the theme toggle. */
  relay() {
    noiseTick(4200, 0.012, 0.09)
    window.setTimeout(() => noiseTick(3000, 0.016, 0.06), 55)
  },
}

// ── Control ─────────────────────────────────────────────────────────────

function startPreset(id: PresetId) {
  if (!ctx) return
  stopCurrent?.()
  stopCurrent = BUILDERS[id]()
  current = id
}

export async function setOn(on: boolean) {
  if (on) {
    ensureContext()
    // Required by autoplay policy, and only ever reached from a click.
    if (ctx!.state === 'suspended') await ctx!.resume()
    enabled = true
    master!.gain.cancelScheduledValues(ctx!.currentTime)
    master!.gain.linearRampToValueAtTime(1, ctx!.currentTime + 1.2)
    startPreset(activePreset())
  } else {
    enabled = false
    if (ctx && master) {
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6)
    }
    window.setTimeout(() => {
      stopCurrent?.()
      stopCurrent = null
      current = null
    }, 700)
  }
  try {
    window.localStorage.setItem(STORE_ON, on ? '1' : '0')
  } catch {
    /* private mode */
  }
  emit()
}

export function setPreset(id: PresetId) {
  try {
    window.localStorage.setItem(STORE_PRESET, id)
  } catch {
    /* private mode */
  }
  if (enabled) startPreset(id)
  else current = id
  emit()
}

/**
 * Delegated cue for anything marked data-sfx. Attached once; cheap, because it
 * returns immediately when sound is off.
 */
let delegated = false
export function attachCues() {
  if (delegated || typeof window === 'undefined') return
  delegated = true
  document.addEventListener(
    'pointerover',
    (e) => {
      if (!enabled) return
      const el = (e.target as Element | null)?.closest?.('[data-sfx="tick"]')
      if (el) sfx.tick()
    },
    { passive: true },
  )
}

// ── Piano ───────────────────────────────────────────────────────────────

/**
 * A hall, built rather than sampled.
 *
 * Exponentially decaying noise is the standard way to fake an impulse
 * response, and for a soft, diffuse tail it is genuinely indistinguishable
 * from a recorded one — what gives cheap reverb away is a short or metallic
 * tail, not the lack of a real room. The high end decays faster than the low,
 * because air and soft furnishings absorb treble first, and that alone is most
 * of the difference between "reverb" and "a room".
 */
function buildHall(seconds: number, decay: number): AudioBuffer {
  const c = ctx!
  const len = Math.floor(c.sampleRate * seconds)
  const buf = c.createBuffer(2, len, c.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    let lp = 0
    for (let i = 0; i < len; i++) {
      const t = i / len
      const env = Math.pow(1 - t, decay)
      // A one-pole lowpass that closes as the tail dies, so the room darkens.
      lp += ((Math.random() * 2 - 1) - lp) * (0.35 - 0.28 * t)
      d[i] = lp * env
    }
  }
  return buf
}

/**
 * One piano note.
 *
 * A struck string is a stack of harmonics that decay at different rates — the
 * upper ones die first, which is why a piano note gets darker as it rings and
 * why a plain sine sounds like an organ instead. Real strings are also very
 * slightly inharmonic: their overtones sit a touch sharp of exact multiples,
 * and that tiny stretch is a large part of what the ear hears as "piano". Both
 * are cheap to model and neither is optional if it is to sound struck.
 *
 * The noise burst at the onset is the hammer felt hitting the string. It lasts
 * a few milliseconds and is inaudible on its own, but without it the note
 * begins from nowhere.
 */
function pianoNote(freq: number, when: number, velocity: number, into: AudioNode) {
  const c = ctx!
  const out = c.createGain()
  out.gain.value = 0
  out.connect(into)

  const PARTIALS = [
    { mult: 1, gain: 1.0, decay: 1.0 },
    { mult: 2, gain: 0.34, decay: 0.62 },
    { mult: 3, gain: 0.16, decay: 0.44 },
    { mult: 4, gain: 0.08, decay: 0.32 },
    { mult: 5.02, gain: 0.04, decay: 0.24 },
  ]

  // Longer in the bass, shorter up top — as on the instrument.
  const base = 5.2 * Math.pow(220 / freq, 0.42)

  for (const p of PARTIALS) {
    const osc = c.createOscillator()
    // Inharmonicity: overtones ride progressively sharp.
    const stretch = 1 + 0.00042 * p.mult * p.mult
    osc.type = 'sine'
    osc.frequency.value = freq * p.mult * stretch

    const g = c.createGain()
    const peak = velocity * p.gain * 0.28
    const life = base * p.decay

    g.gain.setValueAtTime(0, when)
    g.gain.linearRampToValueAtTime(peak, when + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, when + life)

    osc.connect(g).connect(out)
    osc.start(when)
    osc.stop(when + life + 0.05)
  }

  // Hammer felt.
  const hit = noiseSource(false)
  const hg = c.createGain()
  const hf = c.createBiquadFilter()
  hf.type = 'bandpass'
  hf.frequency.value = freq * 2.5
  hf.Q.value = 0.7
  hg.gain.setValueAtTime(velocity * 0.05, when)
  hg.gain.exponentialRampToValueAtTime(0.0001, when + 0.035)
  hit.connect(hf).connect(hg).connect(out)
  hit.start(when)
  hit.stop(when + 0.06)

  out.gain.value = 1
}

/**
 * Soft piano, with a bit of ambience.
 *
 * Generative rather than looped: pitches are drawn from one mode and the gaps
 * between them vary, so it never arrives at a bar line and there is no loop
 * point to notice. Notes are sparse and mostly land in the middle of the
 * keyboard, with an occasional low root underneath to give the phrase a floor.
 *
 * Everything sits inside a long, dark hall, and a very quiet string pad holds
 * the mode underneath so that the silences between notes are not empty.
 */
function buildPiano(): () => void {
  const c = ctx!

  const hall = c.createConvolver()
  hall.buffer = buildHall(5.5, 2.6)
  const wet = c.createGain()
  wet.gain.value = 0.85
  hall.connect(wet).connect(ambientBus!)

  const dry = c.createGain()
  dry.gain.value = 0.5
  dry.connect(ambientBus!)

  // A shelf off the top keeps it soft rather than bright.
  const tone = c.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = 2600
  tone.Q.value = 0.4
  tone.connect(hall)
  tone.connect(dry)

  // A minor, natural — the mode most of NieR's quieter cues live in.
  const SCALE = [220.0, 246.94, 261.63, 293.66, 329.63, 349.23, 392.0]
  const pitches: number[] = []
  for (const f of SCALE) pitches.push(f, f * 2)
  const ROOTS = [110.0, 130.81, 146.83]

  // The pad: two detuned saws per scale degree of the triad, filtered right
  // down so it reads as air rather than as a synth.
  const pad = c.createGain()
  pad.gain.value = 0
  const padFilter = c.createBiquadFilter()
  padFilter.type = 'lowpass'
  padFilter.frequency.value = 480
  padFilter.Q.value = 0.6
  pad.connect(padFilter).connect(hall)

  const padOscs: OscillatorNode[] = []
  for (const f of [110.0, 130.81, 164.81]) {
    for (const det of [-4, 4]) {
      const o = c.createOscillator()
      o.type = 'sawtooth'
      o.frequency.value = f
      o.detune.value = det
      const g = c.createGain()
      g.gain.value = 0.03
      o.connect(g).connect(pad)
      o.start()
      padOscs.push(o)
    }
  }
  pad.gain.setValueAtTime(0, c.currentTime)
  pad.gain.linearRampToValueAtTime(0.5, c.currentTime + 8)

  const padDrift = drift(padFilter.frequency, 480, 130, 11)

  // Notes. Mostly single, sometimes a soft second a third or fifth away.
  let timer = 0
  let last = -1
  const play = () => {
    if (!ctx) return
    const now = ctx.currentTime

    let i = Math.floor(Math.random() * pitches.length)
    // Avoid repeating a pitch immediately; melodies do not stutter.
    if (i === last) i = (i + 1 + Math.floor(Math.random() * 3)) % pitches.length
    last = i

    const vel = 0.5 + Math.random() * 0.4
    pianoNote(pitches[i], now + 0.02, vel, tone)

    // A companion note, occasionally, slightly behind the first.
    if (Math.random() < 0.32) {
      const step = Math.random() < 0.5 ? 2 : 4
      const j = (i + step) % pitches.length
      pianoNote(pitches[j], now + 0.06 + Math.random() * 0.09, vel * 0.7, tone)
    }

    // A low root under the phrase now and then, to give it a floor.
    if (Math.random() < 0.16) {
      pianoNote(ROOTS[Math.floor(Math.random() * ROOTS.length)], now + 0.01, 0.4, tone)
    }

    timer = window.setTimeout(play, 1700 + Math.random() * 2600)
  }
  timer = window.setTimeout(play, 700)

  return () => {
    window.clearTimeout(timer)
    window.clearInterval(padDrift)
    padOscs.forEach((o) => {
      try {
        o.stop()
      } catch {}
    })
    pad.disconnect()
    padFilter.disconnect()
    tone.disconnect()
    hall.disconnect()
    wet.disconnect()
    dry.disconnect()
  }
}

// ── Museum ambiences ────────────────────────────────────────────────────
//
// All three share the piano's constructed hall, because what makes a room feel
// like a gallery is mostly its reverberation: long, dark, and diffuse. They
// differ in what is sounding into it, not in the space itself.

/** Wires a generator into a long hall and returns the node to play into. */
function intoHall(seconds: number, decay: number, wet: number, dry: number) {
  const c = ctx!
  const hall = c.createConvolver()
  hall.buffer = buildHall(seconds, decay)
  const w = c.createGain()
  w.gain.value = wet
  hall.connect(w).connect(ambientBus!)

  const d = c.createGain()
  d.gain.value = dry
  d.connect(ambientBus!)

  const input = c.createGain()
  input.connect(hall)
  input.connect(d)

  return {
    input,
    teardown: () => {
      input.disconnect()
      hall.disconnect()
      w.disconnect()
      d.disconnect()
    },
  }
}

/**
 * Strings. A slow bowed chord that changes about once a minute.
 *
 * Sawtooths through a low filter get most of the way to a section; what sells
 * the rest is that no two voices start together and none of them hold a steady
 * level. Each has its own slow tremolo at a frequency that shares no factor
 * with the others, so the chord never settles into a pattern.
 */
function buildStrings(): () => void {
  const c = ctx!
  const { input, teardown } = intoHall(6, 2.8, 0.9, 0.35)

  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 620
  lp.Q.value = 0.5
  lp.connect(input)

  // A minor, spread across three octaves.
  const CHORDS = [
    [110, 130.81, 164.81, 220],
    [98, 130.81, 146.83, 196],
    [116.54, 146.83, 174.61, 233.08],
  ]

  const voices: { o: OscillatorNode; lfo: OscillatorNode; g: GainNode }[] = []
  for (let i = 0; i < 4; i++) {
    const o = c.createOscillator()
    o.type = 'sawtooth'
    o.frequency.value = CHORDS[0][i]
    o.detune.value = (Math.random() * 2 - 1) * 7

    const g = c.createGain()
    g.gain.value = 0.05

    const lfo = c.createOscillator()
    lfo.frequency.value = 0.031 + i * 0.017
    const la = c.createGain()
    la.gain.value = 0.022
    lfo.connect(la).connect(g.gain)
    lfo.start()

    o.connect(g).connect(lp)
    o.start()
    voices.push({ o, lfo, g })
  }

  let n = 0
  const change = window.setInterval(() => {
    if (!ctx) return
    n = (n + 1) % CHORDS.length
    // Voices arrive at the new chord at slightly different times, the way a
    // section does.
    voices.forEach((v, i) => {
      v.o.frequency.linearRampToValueAtTime(CHORDS[n][i], ctx!.currentTime + 7 + i * 1.3)
    })
  }, 52000)

  const d = drift(lp.frequency, 620, 150, 14)

  return () => {
    window.clearInterval(change)
    window.clearInterval(d)
    voices.forEach(({ o, lfo }) => {
      try {
        o.stop()
        lfo.stop()
      } catch {}
    })
    lp.disconnect()
    teardown()
  }
}

/**
 * Glass. Struck bowls, a long way off.
 *
 * Almost pure sines with a very long decay and a touch of inharmonicity, which
 * is what separates glass and metal from a synth bell. They land rarely — a
 * gallery is mostly silence with something happening in it occasionally.
 */
function buildGlass(): () => void {
  const c = ctx!
  const { input, teardown } = intoHall(7, 3.2, 1, 0.22)

  const SCALE = [261.63, 293.66, 349.23, 392.0, 466.16, 523.25, 587.33]

  let timer = 0
  const strike = () => {
    if (!ctx) return
    const f = SCALE[Math.floor(Math.random() * SCALE.length)]
    const t = ctx.currentTime + 0.02
    const life = 6 + Math.random() * 3

    for (const [mult, amp] of [
      [1, 1],
      [2.76, 0.22],
      [5.4, 0.07],
    ]) {
      const o = c.createOscillator()
      o.type = 'sine'
      o.frequency.value = f * mult
      const g = c.createGain()
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.09 * amp, t + 0.012)
      g.gain.exponentialRampToValueAtTime(0.0001, t + life * (mult === 1 ? 1 : 0.4))
      o.connect(g).connect(input)
      o.start(t)
      o.stop(t + life + 0.1)
    }

    timer = window.setTimeout(strike, 4200 + Math.random() * 7000)
  }
  timer = window.setTimeout(strike, 1200)

  return () => {
    window.clearTimeout(timer)
    teardown()
  }
}

/**
 * Choir. Wordless voices, very far back.
 *
 * A voice is mostly its formants — the two resonant peaks that make a vowel a
 * vowel. Two bandpass filters at roughly 500 Hz and 1100 Hz over a sawtooth is
 * an "oh", and that is enough at this distance and this volume. A slow vibrato
 * keeps it from reading as an organ.
 */
function buildChoir(): () => void {
  const c = ctx!
  const { input, teardown } = intoHall(7, 3, 1, 0.12)

  const mix = c.createGain()
  mix.gain.value = 0
  mix.connect(input)
  mix.gain.linearRampToValueAtTime(1, c.currentTime + 9)

  const voices: { o: OscillatorNode; vib: OscillatorNode }[] = []
  for (const f of [164.81, 196.0, 246.94]) {
    const o = c.createOscillator()
    o.type = 'sawtooth'
    o.frequency.value = f

    // Vibrato — small, slow, and different per voice.
    const vib = c.createOscillator()
    vib.frequency.value = 4.1 + Math.random() * 1.2
    const vibAmt = c.createGain()
    vibAmt.gain.value = 2.4
    vib.connect(vibAmt).connect(o.detune)
    vib.start()

    const f1 = c.createBiquadFilter()
    f1.type = 'bandpass'
    f1.frequency.value = 500
    f1.Q.value = 5

    const f2 = c.createBiquadFilter()
    f2.type = 'bandpass'
    f2.frequency.value = 1100
    f2.Q.value = 7

    const g = c.createGain()
    g.gain.value = 0.05

    const split = c.createGain()
    o.connect(split)
    split.connect(f1).connect(g)
    split.connect(f2).connect(g)
    g.connect(mix)

    o.start()
    voices.push({ o, vib })
  }

  return () => {
    mix.gain.linearRampToValueAtTime(0, c.currentTime + 1.6)
    window.setTimeout(() => {
      voices.forEach(({ o, vib }) => {
        try {
          o.stop()
          vib.stop()
        } catch {}
      })
      mix.disconnect()
      teardown()
    }, 1800)
  }
}
