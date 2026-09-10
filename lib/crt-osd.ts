/**
 * The diagnostic layer the About tube draws over its own picture.
 *
 * ── What this is ─────────────────────────────────────────────────────────
 *
 * A 2D canvas of text, uploaded to the tube as a second texture and sampled
 * by the shader with the *same* wobbled coordinate as the photograph. That is
 * the whole architectural point: the text tears when the picture tears, rolls
 * when the vertical hold slips, is eaten by dropout, and picks up the beam,
 * the grille and the bloom — because it is part of the signal the tube is
 * displaying rather than HTML sitting cleanly on top of a glitchy image.
 *
 * Rendering it as canvas text rather than as glyphs in the shader is a
 * deliberate trade: a glyph atlas would be a day's work and would buy nothing
 * the shader cannot already do to a texture.
 *
 * ── What it says ─────────────────────────────────────────────────────────
 *
 * Almost nothing, almost all of the time. Idle is two lines — a subject
 * number and a signal state — at an opacity that reads as machine furniture.
 * Every fifteen seconds or so the set runs a scan: a line crosses the picture,
 * and as it passes it detects four characteristics, one at a time, each
 * locking out of noise rather than fading in. They hold briefly, then go.
 *
 * No percentages, scores, levels or bars. Something detected is either
 * detected or not; a number against it would be the machine pretending to a
 * precision it has no way to have, and that is what makes this sort of thing
 * read as a game HUD.
 *
 * ── Why the timing is shaped the way it is ───────────────────────────────
 *
 * The idle stretch is long and randomised so the scan is something you catch
 * rather than something you wait for. The whole sequence is about six seconds
 * against fifteen or more of nothing, which is roughly the 80/20 the design
 * asks for — the portrait is the hero and this is a thing the display does
 * while showing it.
 */

/** Characters the decode cycles through before a letter locks. */
const NOISE = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/#*-+=<>'

/** Seconds. */
const IDLE_MIN = 11
const IDLE_MAX = 19
const SCAN = 3.2
/** How long the detected characteristics stay up once the scan has finished. */
const HOLD = 2.8
/** They do not all leave together; this is the stagger. */
const CLEAR = 1.4

/** How long one characteristic takes to lock, and how fast the noise churns. */
const DECODE = 0.55
const CHURN = 0.055

/** Where down the picture each characteristic is detected, 0 = top. */
const ROWS = [0.315, 0.45, 0.585, 0.72]

type Phase = 'idle' | 'scan' | 'hold' | 'clear'

export interface Osd {
  canvas: HTMLCanvasElement
  /**
   * Advance to `t` seconds and redraw if anything changed.
   *
   * Returns the scan line's position as 0..1 from the top, or -1 when the set
   * is not scanning — the shader draws the line itself, because a line drawn
   * into the texture would be a picture of a scan rather than the beam doing
   * one.
   */
  tick(t: number): { scan: number; changed: boolean }
  resize(w: number, h: number): void
  dispose(): void
}

export function makeOsd(opts: {
  subject: string
  traits: string[]
  /** A fully resolved font-family string — see the note in CrtScreen. */
  font: string
  /** Reduced motion: no scan, no decode, idle furniture only. */
  still: boolean
}): Osd {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  let phase: Phase = 'idle'
  let until = -1
  /** Per-trait lock progress, 0 = unseen, 1 = fully resolved. */
  const lock = opts.traits.map(() => 0)
  /** Redrawn only when this changes — the text is static between decode steps. */
  let sig = ''
  let churnAt = 0
  let churnSeed = 0

  const rand = (a: number, b: number) => a + Math.random() * (b - a)

  const resize = (w: number, h: number) => {
    if (canvas.width === w && canvas.height === h) return
    canvas.width = w
    canvas.height = h
    sig = '' // geometry changed; whatever is on it is stale
  }

  /** A character mid-decode: stable within a churn step, different across. */
  const noiseChar = (i: number, seed: number) =>
    NOISE[(Math.abs(Math.sin((i + 1) * 12.9898 + seed * 78.233)) * 43758.5453) % NOISE.length | 0]

  const textOf = (word: string, progress: number, seed: number) => {
    if (progress >= 1) return word
    if (progress <= 0) return ''
    /* Locks left to right, and the leading character is always noise — a word
       that resolves cleanly from one end reads as a typewriter, and the point
       is that this is being pulled out of a signal. */
    const locked = Math.floor(word.length * progress)
    let out = ''
    for (let i = 0; i < word.length; i++) {
      if (i < locked) out += word[i]
      else if (i < locked + 3) out += word[i] === ' ' ? ' ' : noiseChar(i, seed)
      else out += ' '
    }
    return out
  }

  const draw = () => {
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    /* Sized from the picture's height so the layer holds its proportions at
       any column width — the tube is fluid and this has to be too. */
    let base = Math.max(9, Math.round(h * 0.030))
    const small = Math.max(8, Math.round(h * 0.024))
    const left = Math.round(w * 0.055)

    ctx.textBaseline = 'alphabetic'

    /* How wide a word is with the tracking applied — canvas has no
       letter-spacing, so the tracking is added per character below and has to
       be accounted for here too or the fit is wrong by a fifth. */
    const widthOf = (text: string, size: number, track: number) => {
      ctx.font = `${size}px ${opts.font}`
      let out = 0
      for (const ch of text) out += ctx.measureText(ch).width + size * track
      return out
    }

    /* The characteristics are the longest thing on the layer and the tube is
       fluid, so they are fitted rather than placed: shrink until the longest
       one clears the right margin, then hang the column off that margin.

       Found by overflowing — "PATTERN RECOGNITION" ran off the glass on a
       narrow column, and a word cut in half by the edge of the screen reads as
       a bug rather than as a machine being terse. */
    const margin = Math.round(w * 0.055)
    const widest = opts.traits.reduce((m, t) => Math.max(m, widthOf(t, base, 0.18)), 0)
    const room = w - margin - Math.round(w * 0.40)
    if (widest > room) base = Math.max(7, Math.floor((base * room) / widest))
    const traitW = opts.traits.reduce((m, t) => Math.max(m, widthOf(t, base, 0.18)), 0)
    const right = Math.max(Math.round(w * 0.38), Math.round(w - margin - traitW))

    const line = (
      text: string,
      x: number,
      y: number,
      size: number,
      alpha: number,
      track = 0.14,
    ) => {
      if (!text) return
      ctx.font = `${size}px ${opts.font}`
      ctx.fillStyle = `rgba(255,255,255,${alpha})`
      /* Tracked out by hand: canvas has no letter-spacing, and this face at
         this size closes up into a smear without it. */
      let cx = x
      for (const ch of text) {
        ctx.fillText(ch, cx, y)
        cx += ctx.measureText(ch).width + size * track
      }
    }

    /* ── Furniture. Always there, and always nearly invisible. ─────────── */
    line(`SUBJECT // ${opts.subject}`, left, Math.round(h * 0.085), small, 0.3)
    line(
      phase === 'scan' ? 'SIGNAL // READING' : 'SIGNAL // ACTIVE',
      left,
      Math.round(h * 0.945),
      small,
      0.3,
    )

    /* ── The state of the scan. ────────────────────────────────────────── */
    if (phase === 'scan') line('SCANNING', left, Math.round(h * 0.885), small, 0.42)
    else if (phase === 'hold') line('SCAN // COMPLETE', left, Math.round(h * 0.885), small, 0.42)

    /* ── What it found. ────────────────────────────────────────────────── */
    for (let i = 0; i < opts.traits.length; i++) {
      const p = lock[i]
      if (p <= 0) continue
      const y = Math.round(h * ROWS[i])
      /* Brightest at the moment of locking and quieter once held: the machine
         is interested in what it has just worked out, not in what it already
         knows. */
      const settle = phase === 'hold' || phase === 'clear' ? 0.28 : 0.46
      const alpha = p < 1 ? 0.46 : settle
      line(textOf(opts.traits[i], p, churnSeed), right, y, base, alpha, 0.18)

      /* A tick where the line found it. Two pixels of rule, not a bracket —
         enough to tie the word to a place on the picture. */
      if (p > 0.15) {
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.7})`
        ctx.fillRect(right - Math.round(base * 1.1), y - Math.round(base * 0.3), Math.round(base * 0.55), 1)
      }
    }
  }

  const tick = (t: number) => {
    if (until < 0) until = t + (opts.still ? Infinity : rand(IDLE_MIN, IDLE_MAX))

    let scan = -1

    if (!opts.still && t >= until) {
      if (phase === 'idle') {
        phase = 'scan'
        until = t + SCAN
        for (let i = 0; i < lock.length; i++) lock[i] = 0
      } else if (phase === 'scan') {
        phase = 'hold'
        until = t + HOLD
        for (let i = 0; i < lock.length; i++) lock[i] = 1
      } else if (phase === 'hold') {
        phase = 'clear'
        until = t + CLEAR
      } else {
        phase = 'idle'
        until = t + rand(IDLE_MIN, IDLE_MAX)
        for (let i = 0; i < lock.length; i++) lock[i] = 0
      }
    }

    if (phase === 'scan') {
      const p = 1 - (until - t) / SCAN
      scan = p
      /* Each characteristic starts decoding as the line reaches it, so the
         four do not arrive on a beat — they arrive where they are. */
      for (let i = 0; i < lock.length; i++) {
        const since = (p - ROWS[i]) * SCAN
        lock[i] = since <= 0 ? 0 : Math.min(1, since / DECODE)
      }
    } else if (phase === 'clear') {
      /* Out one at a time, bottom first, so the display empties rather than
         switching off. */
      const p = 1 - (until - t) / CLEAR
      for (let i = 0; i < lock.length; i++) {
        lock[i] = p > (lock.length - i) / (lock.length + 1) ? 0 : 1
      }
    }

    if (t >= churnAt) {
      churnAt = t + CHURN
      churnSeed++
    }

    /* Redraw only when the pixels would differ. Between decode steps this
       layer is static, and re-uploading an unchanged texture sixty times a
       second is the kind of cost that never shows up in a profile as one
       obvious thing. */
    const next =
      phase +
      '|' +
      lock.map((v) => (v >= 1 ? '1' : v <= 0 ? '0' : churnSeed)).join(',') +
      '|' +
      canvas.width
    const changed = next !== sig
    if (changed) {
      sig = next
      draw()
    }

    return { scan, changed }
  }

  return {
    canvas,
    tick,
    resize,
    dispose() {
      canvas.width = 0
      canvas.height = 0
    },
  }
}
