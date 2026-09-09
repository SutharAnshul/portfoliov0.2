'use client'

import { useEffect, useRef, useState } from 'react'
import { makeGl, uploadData, useSignal, type Signal } from './signal'
import { PRESETS, type PresetId } from '@/lib/audio'

/* ═══════════════════════════════════════════════════════════════════════════
   A · THE TUBE
   ═══════════════════════════════════════════════════════════════════════════
   The player is another CRT, and what is on it is an oscilloscope trace of the
   master bus.

   The defining detail is persistence, and it is the reason this one does not
   use the shared single-pass helper. A real scope's phosphor holds: the beam
   excites it and it decays over tens of milliseconds, so what you see is the
   last several sweeps at once, brightest where the trace has been sitting
   still. Every visualiser that clears its canvas every frame gets this wrong,
   and it is exactly the difference between a scope and a squiggle.

   So there are two buffers. Each frame draws the previous one back at 0.90
   brightness with the new trace added over it, into an offscreen target; then
   a present pass warps and grilles that for the screen. Keeping the warp in
   the present pass matters — accumulating through it would re-warp the history
   every frame and pull the whole picture into the centre.
   ─────────────────────────────────────────────────────────────────────────── */

const TRACE_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uPrev;
  uniform sampler2D uWave;
  uniform float uDecay;
  uniform float uLevel;
  uniform vec2 uRes;

  void main() {
    /* The history, dimmed. Nothing else fades it — a phosphor decays, it does
       not get cleared, and this multiply is the entire mechanism. */
    vec3 col = texture2D(uPrev, vUv).rgb * uDecay;

    /* Distance from this pixel to the trace. Sampled at several x offsets
       rather than one: where the signal is steep the trace is nearly vertical,
       and a single sample per column leaves it as a dotted line with gaps at
       every zero crossing. Taking the nearest of a neighbourhood closes them
       without thickening the flat parts. */
    float d = 1e9;
    for (int i = -4; i <= 4; i++) {
      float x = vUv.x + float(i) / uRes.x;
      float v = texture2D(uWave, vec2(clamp(x, 0.0, 1.0), 0.5)).r * 2.0 - 1.0;
      float y = 0.5 + v * 0.42;
      d = min(d, abs(vUv.y - y) * uRes.y);
    }

    /* Two terms: a hard core and a wide halo. A single falloff gives either a
       thin line with no presence or a smear with no line. */
    float core = exp(-d * d * 0.55);
    float halo = exp(-d * 0.28) * 0.30;

    /* Slightly green, the way a scope phosphor is, but only slightly — this
       site is monochrome and a full P31 green would arrive as a new colour in
       a palette that has exactly one. */
    vec3 beam = vec3(0.86, 1.0, 0.90) * (core + halo) * (0.35 + uLevel * 0.9);

    gl_FragColor = vec4(min(col + beam, vec3(1.6)), 1.0);
  }
`

const PRESENT_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uSrc;
  uniform vec2 uRes;
  uniform float uTime;
  uniform float uOn;

  void main() {
    /* Barrel, applied here and only here. Warping the accumulation buffer
       instead would compound every frame and suck the picture into a point. */
    vec2 p = vUv * 2.0 - 1.0;
    float r = dot(p, p);
    p *= 1.0 + r * 0.055;
    vec2 uv = p * 0.5 + 0.5;

    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      gl_FragColor = vec4(0.0);
      return;
    }

    vec3 col = texture2D(uSrc, uv).rgb;

    /* The grille runs on gl_FragCoord, not on uv — it belongs to the glass,
       which does not move when the picture does. */
    float line = 0.72 + 0.28 * sin(gl_FragCoord.y * 3.14159);
    col *= line;
    float grille = 0.86 + 0.14 * sin(gl_FragCoord.x * 2.09);
    col *= grille;

    /* Powered but idle still glows: a tube with no signal is not a black
       rectangle, it is a faintly lit one. */
    col += vec3(0.012, 0.015, 0.013) * uOn;

    /* Vignette, and the corner falloff a curved tube has. */
    float vig = 1.0 - r * 0.20;
    col *= vig;

    gl_FragColor = vec4(col * uOn, uOn);
  }
`

export function DirectionTube({ on }: { on: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const state = useRef<{
    gl: WebGLRenderingContext
    trace: WebGLProgram
    present: WebGLProgram
    fbo: WebGLFramebuffer[]
    tex: WebGLTexture[]
    wave: WebGLTexture
    buf: WebGLBuffer
    at: number
    size: [number, number]
  } | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true })
    if (!gl) return

    const vert = `attribute vec2 aPos; varying vec2 vUv;
      void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`

    const build = (fsrc: string) => {
      const vs = gl.createShader(gl.VERTEX_SHADER)!
      gl.shaderSource(vs, vert)
      gl.compileShader(vs)
      const fs = gl.createShader(gl.FRAGMENT_SHADER)!
      gl.shaderSource(fs, fsrc)
      gl.compileShader(fs)
      if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        console.error('tube:', gl.getShaderInfoLog(fs))
      }
      const p = gl.createProgram()!
      gl.attachShader(p, vs)
      gl.attachShader(p, fs)
      gl.linkProgram(p)
      return p
    }

    const buf = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

    const wave = gl.createTexture()!
    const tex: WebGLTexture[] = []
    const fbo: WebGLFramebuffer[] = []

    state.current = {
      gl,
      trace: build(TRACE_FRAG),
      present: build(PRESENT_FRAG),
      fbo,
      tex,
      wave,
      buf,
      at: 0,
      size: [0, 0],
    }

    return () => {
      for (const f of fbo) gl.deleteFramebuffer(f)
      for (const t of tex) gl.deleteTexture(t)
      gl.deleteTexture(wave)
      gl.deleteBuffer(buf)
      state.current = null
    }
  }, [])

  useSignal((s: Signal) => {
    const st = state.current
    const canvas = ref.current
    if (!st || !canvas) return
    const { gl } = st

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }

    /* (Re)build the pair of accumulation targets when the size changes. The
       history is lost on a resize, which is correct — it was a picture of a
       different screen. */
    if (st.size[0] !== w || st.size[1] !== h) {
      for (const f of st.fbo) gl.deleteFramebuffer(f)
      for (const t of st.tex) gl.deleteTexture(t)
      st.fbo.length = 0
      st.tex.length = 0
      for (let i = 0; i < 2; i++) {
        const t = gl.createTexture()!
        gl.bindTexture(gl.TEXTURE_2D, t)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        const f = gl.createFramebuffer()!
        gl.bindFramebuffer(gl.FRAMEBUFFER, f)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        st.tex.push(t)
        st.fbo.push(f)
      }
      st.size = [w, h]
    }

    const src = st.at
    const dst = 1 - st.at
    st.at = dst

    gl.bindBuffer(gl.ARRAY_BUFFER, st.buf)

    /* ── Pass 1: history × decay + new trace, into the spare target ─────── */
    gl.useProgram(st.trace)
    const aTrace = gl.getAttribLocation(st.trace, 'aPos')
    gl.enableVertexAttribArray(aTrace)
    gl.vertexAttribPointer(aTrace, 2, gl.FLOAT, false, 0, 0)
    gl.bindFramebuffer(gl.FRAMEBUFFER, st.fbo[dst])
    gl.viewport(0, 0, w, h)

    if (s.live && s.wave.length) {
      /* The trace is 1024 wide however wide the canvas is. Sampling the full
         2048 into a narrow panel would draw several cycles per pixel column
         and alias into noise. */
      const step = Math.max(1, Math.floor(s.wave.length / 1024))
      const thin = new Float32Array(Math.floor(s.wave.length / step))
      for (let i = 0; i < thin.length; i++) thin[i] = s.wave[i * step]
      gl.activeTexture(gl.TEXTURE1)
      uploadData(gl, st.wave, thin, true)
    }

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, st.tex[src])
    gl.uniform1i(gl.getUniformLocation(st.trace, 'uPrev'), 0)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, st.wave)
    gl.uniform1i(gl.getUniformLocation(st.trace, 'uWave'), 1)
    gl.uniform2f(gl.getUniformLocation(st.trace, 'uRes'), w, h)
    /* Off, the history is allowed to fade rather than being blanked — a tube
       losing its signal keeps glowing for a moment, and cutting to black is
       the one thing that would say "a div was hidden". */
    gl.uniform1f(gl.getUniformLocation(st.trace, 'uDecay'), on ? 0.9 : 0.82)
    gl.uniform1f(gl.getUniformLocation(st.trace, 'uLevel'), on ? s.level : 0)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    /* ── Pass 2: present it, warped and grilled ─────────────────────────── */
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, w, h)
    gl.useProgram(st.present)
    const aPres = gl.getAttribLocation(st.present, 'aPos')
    gl.enableVertexAttribArray(aPres)
    gl.vertexAttribPointer(aPres, 2, gl.FLOAT, false, 0, 0)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, st.tex[dst])
    gl.uniform1i(gl.getUniformLocation(st.present, 'uSrc'), 0)
    gl.uniform2f(gl.getUniformLocation(st.present, 'uRes'), w, h)
    gl.uniform1f(gl.getUniformLocation(st.present, 'uTime'), performance.now() / 1000)
    gl.uniform1f(gl.getUniformLocation(st.present, 'uOn'), on ? 1 : 0.25)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  })

  return <canvas className="pl-canvas" ref={ref} />
}

/* ═══════════════════════════════════════════════════════════════════════════
   B · THE DECK
   ═══════════════════════════════════════════════════════════════════════════
   A piece of transport hardware. The visual is a meter, and the whole craft of
   it is in the ballistics rather than in the shader.

   A meter that follows the signal instantly is the thing that reads as a
   screensaver. A real VU has a needle with mass: about 300ms to settle, and a
   fall slower than the rise. That lag is what makes it read as a mechanism
   being pushed by the sound rather than as a graph of it. The integration is
   done in `useSignal` and arrives here as one number.

   Note the honesty problem this direction has: a deck implies a tape, and a
   tape implies a position. There is no position — the audio is generated and
   runs forever. So the reels here are an endless-loop cartridge, which really
   does have no beginning, and there is deliberately no counter.
   ─────────────────────────────────────────────────────────────────────────── */

const DECK_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 uRes;
  uniform float uLevel;
  uniform float uPeak;
  uniform float uOn;
  uniform float uTime;

  void main() {
    /* Cells, not a bar. The pitch is the point: this is the same pixel logic
       as the icons, and a smooth gradient here would be a different language
       on the same page. */
    float cols = 24.0;
    float rows = 3.0;
    vec2 cell = vec2(floor(vUv.x * cols), floor(vUv.y * rows));
    vec2 inCell = fract(vUv * vec2(cols, rows));

    /* The gap is cut out of the cell rather than laid between cells, so the
       lit blocks tile on an exact pitch. */
    float gap = step(0.12, inCell.x) * step(inCell.x, 0.88) *
                step(0.16, inCell.y) * step(inCell.y, 0.84);

    float pos = (cell.x + 0.5) / cols;
    float lit = step(pos, uLevel);

    /* ── The backlight ──────────────────────────────────────────────────
       An LCD does not emit. It is a sheet of segments that go dark in front
       of a lamp, so the ground is the brightest thing on the panel and a lit
       segment is the absence of light rather than the presence of it. That is
       the whole reason this reads as an LCD and not as an LED bargraph, and
       it is why the backlight is added before anything else here.

       The colour is the yellow-green of the electroluminescent panels these
       decks used — around 100° in hue, low saturation, never a pure green. A
       saturated green would be a phosphor, which is the CRT next door.

       Uneven on purpose. An EL panel is lit from a lamp along one edge, so it
       is brighter near that edge and falls off across the sheet, and the
       corners are the dimmest part of it. A perfectly flat wash is the tell
       that a screen is a rectangle of CSS. */
    vec2 q = vUv - 0.5;
    float lamp = 1.0 - smoothstep(0.0, 0.62, length(q * vec2(0.75, 1.25)));
    float edge = 1.0 - smoothstep(0.10, 0.85, vUv.y);
    vec3 back = vec3(0.44, 0.62, 0.30) * (0.30 + lamp * 0.55 + edge * 0.22);

    /* The last few cells are the accent: a meter needs somewhere it is not
       supposed to reach, or its top end means nothing. */
    vec3 hot = vec3(0.95, 0.34, 0.62);

    /* Peak hold: one cell left behind at the highest recent level, falling
       slowly on its own. It is the only part of a meter that tells you what
       you missed. */
    float peakCell = step(abs(pos - uPeak), 0.5 / cols);

    /* Segments darken the backlight rather than adding to it. The lit run is
       the darkest part of the panel — which is backwards from an LED meter and
       exactly right for a liquid crystal one. */
    float ink = lit * (0.72 + uLevel * 0.16);
    vec3 col = back * (1.0 - ink * gap);

    /* Except the overload cells, which on real equipment are a separate lamp
       behind the same glass rather than another segment. */
    col = mix(col, hot * 0.85, peakCell * gap * 0.75);
    col = mix(col, hot * 0.55, lit * gap * smoothstep(0.80, 0.96, pos) * 0.7);

    /* The glass sits a hair in front of the segments, so the lit run casts a
       little of itself sideways. */
    float bleed = smoothstep(uLevel + 0.05, uLevel - 0.16, vUv.x) * 0.10;
    col += vec3(0.40, 0.58, 0.28) * bleed * uLevel;

    /* No scanlines. A liquid crystal panel has no raster to have lines from,
       and borrowing the tube's texture here would put a CRT artefact on a
       screen that is deliberately not one. What it does have is the faint
       grid between cells, which the gap above already draws. */
    gl_FragColor = vec4(col * uOn, uOn);
  }
`

export function DirectionDeck({ on }: { on: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reelRef = useRef<HTMLDivElement>(null)
  const gl = useRef<ReturnType<typeof makeGl>>(null)
  const peak = useRef(0)
  const spin = useRef(0)

  useEffect(() => {
    if (!ref.current) return
    gl.current = makeGl(ref.current, DECK_FRAG, ['uRes', 'uLevel', 'uPeak', 'uOn', 'uTime'])
    return () => gl.current?.dispose()
  }, [])

  useSignal((s, dt) => {
    const lvl = on ? s.level : 0

    /* Peak hold, with its own much slower fall. Not a second copy of the
       level — the whole value of a peak marker is that it decays on a
       different clock from the thing it is marking. */
    peak.current = lvl > peak.current ? lvl : Math.max(0, peak.current - dt * 0.28)

    /* The reels turn at a real rate. Constant while running, because a loop
       cartridge runs at one speed — tying it to the level would be the reels
       pretending to be a meter, which is the second meter this panel does not
       need. */
    if (on) spin.current = (spin.current + dt * 62) % 360
    if (reelRef.current) {
      reelRef.current.style.setProperty('--spin', `${spin.current}deg`)
    }

    gl.current?.draw((u, g) => {
      g.uniform1f(u.uLevel, lvl)
      g.uniform1f(u.uPeak, peak.current)
      g.uniform1f(u.uOn, on ? 1 : 0.4)
      g.uniform1f(u.uTime, performance.now() / 1000)
    })
  })

  return (
    <div className="pl-deck" ref={reelRef} data-on={on}>
      <div className="pl-reels">
        <span className="pl-reel" />
        <span className="pl-tape" />
        <span className="pl-reel" />
      </div>
      <canvas className="pl-canvas pl-window" ref={ref} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   C · THE SIGNAL PATH
   ═══════════════════════════════════════════════════════════════════════════
   Not a consumer device. The display is the synthesis graph itself.

   `lib/audio.ts` really is a chain of oscillators, filters, a reverb send, two
   buses and a compressor, so a picture of that chain is a readout rather than
   a metaphor — the one direction of the four where nothing on the screen is
   invented for the look of it.

   One caveat, stated rather than hidden: the per-node brightness here is
   driven by band energy off the master tap, not by reading each node's gain.
   Real per-node introspection means instrumenting every generator in
   `audio.ts`, which is a day's work and belongs in the build, not the sketch.
   The topology is exact; the levels are inferred.
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * The chain as it is actually built, left to right.
 *
 * `band` says which third of the spectrum stands in for that node's activity;
 * -1 means the node carries the whole mix, which is true of the bus and the
 * compressor — everything passes through them, so a band would be a narrower
 * claim than the node makes.
 */
const NODES: { id: string; label: string; band: number }[] = [
  { id: 'osc', label: 'OSC', band: 0 },
  { id: 'lfo', label: 'LFO', band: 1 },
  { id: 'flt', label: 'FLT', band: 1 },
  { id: 'vrb', label: 'VRB', band: 2 },
  { id: 'bus', label: 'BUS', band: -1 },
  { id: 'cmp', label: 'CMP', band: -1 },
]

const PATH_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 uRes;
  uniform float uOn;
  uniform float uNodes[6];
  uniform float uTime;

  /* Distance from p to the segment ab, in uv. */
  float seg(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
  }

  float box(vec2 p, vec2 c, vec2 r) {
    vec2 d = abs(p - c) - r;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
  }

  void main() {
    /* Square the space so boxes are boxes and not lozenges. */
    float ar = uRes.x / uRes.y;
    vec2 p = vec2(vUv.x * ar, vUv.y);

    vec3 col = vec3(0.0);
    float y = 0.5;

    for (int i = 0; i < 6; i++) {
      float t = (float(i) + 0.5) / 6.0;
      vec2 c = vec2(t * ar, y);
      float lvl = uNodes[i];

      /* The wire into the next node, drawn first so the boxes sit on top. */
      if (i < 5) {
        vec2 n = vec2((float(i) + 1.5) / 6.0 * ar, y);
        float d = seg(p, c + vec2(0.055 * ar, 0.0), n - vec2(0.055 * ar, 0.0));
        /* A pulse running along the wire at the rate that node is moving.
           This is the part that says signal is flowing rather than that six
           lamps are lit. */
        float along = clamp((p.x - c.x) / max(n.x - c.x, 0.0001), 0.0, 1.0);
        float pulse = smoothstep(0.35, 0.0, abs(fract(along - uTime * 0.35) - 0.5));
        /* The wire is legible before anything is playing. A schematic that
           only appears once there is signal is not a schematic — the topology
           is a fact about the instrument, true whether or not it is running,
           and only the brightness is news. */
        col += vec3(0.82, 0.86, 0.84) * exp(-d * 260.0) * (0.34 + lvl * 0.6);
        col += vec3(0.95, 0.34, 0.62) * exp(-d * 300.0) * pulse * lvl * 0.7;
      }

      /* The node. Etched outline always; the fill is the level. */
      float d = box(p, c, vec2(0.052 * ar, 0.075));
      float edge = exp(-abs(d) * 320.0);
      float fill = smoothstep(0.004, -0.004, d);
      col += vec3(0.80, 0.84, 0.82) * edge * (0.46 + lvl * 0.6);
      col += vec3(0.95, 0.34, 0.62) * fill * lvl * 0.30;
    }

    float line = 0.80 + 0.20 * sin(gl_FragCoord.y * 3.14159);
    col *= line;
    col += vec3(0.010, 0.013, 0.011) * uOn;

    gl_FragColor = vec4(col * uOn, uOn);
  }
`

export function DirectionPath({ on }: { on: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const gl = useRef<ReturnType<typeof makeGl>>(null)

  useEffect(() => {
    if (!ref.current) return
    gl.current = makeGl(ref.current, PATH_FRAG, ['uRes', 'uOn', 'uNodes[0]', 'uTime'])
    return () => gl.current?.dispose()
  }, [])

  useSignal((s) => {
    const vals = new Float32Array(6)
    for (let i = 0; i < NODES.length; i++) {
      const b = NODES[i].band
      vals[i] = on ? (b < 0 ? s.level : s.bands[b]) : 0
    }
    gl.current?.draw((u, g) => {
      if (u['uNodes[0]']) g.uniform1fv(u['uNodes[0]'], vals)
      g.uniform1f(u.uOn, on ? 1 : 0.35)
      g.uniform1f(u.uTime, performance.now() / 1000)
    })
  })

  return (
    <div className="pl-path">
      <canvas className="pl-canvas" ref={ref} />
      <div className="pl-path-labels" aria-hidden="true">
        {NODES.map((n) => (
          <span key={n.id}>{n.label}</span>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   D · THE CARTRIDGE SHELF
   ═══════════════════════════════════════════════════════════════════════════
   The six presets as six objects, in the icon language. Choosing one is
   inserting it.

   What this direction is really for is that the six presets currently have no
   identity at all — they are six names in a list, and nothing distinguishes
   Glass from Choir until you have heard both. Here each gets a label that is
   generated from its own audio, so the shelf is a set of six different things
   before you touch it and the one that is playing is visibly the one moving.

   The field is 12×12 on a 13-wide tile, which is the icons' own geometry
   scaled up rather than a new grid invented for this.
   ─────────────────────────────────────────────────────────────────────────── */

/* Deliberately 2D canvas and not WebGL, unlike the other three.
 *
 * A cartridge label is twelve columns of stacked squares. There is no
 * curvature, no bloom, no per-pixel anything — everything a fragment shader is
 * for is absent, and `fillRect` says what this is more plainly than a shader
 * would. Six shelves' worth of contexts also runs a browser out of them:
 * WebGL is capped somewhere around sixteen per page and this route already
 * renders twice inside the shell, so six cartridges plus three panels plus the
 * site's own tubes exhausts it and the oldest context is silently killed.
 *
 * The rule this follows: WebGL where it earns its place — the tube's
 * accumulation buffer, the meter's glass, the schematic's signed distance
 * fields — and 2D where the picture is rectangles.
 */
const TINTS: Record<PresetId, [number, number, number]> = {
  piano: [235, 230, 219],
  strings: [219, 209, 242],
  glass: [199, 240, 242],
  choir: [242, 219, 235],
  nocturne: [204, 217, 245],
  room: [224, 224, 224],
}

/** Stable per-cartridge noise, so a label is its own and does not reshuffle. */
function grain(x: number, y: number, seed: number) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.19) * 43758.5453
  return n - Math.floor(n)
}

function Cartridge({
  preset,
  active,
  on,
  onPick,
}: {
  preset: (typeof PRESETS)[number]
  active: boolean
  on: boolean
  onPick: () => void
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useSignal((s) => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
    if (canvas.width !== w || canvas.height !== w) {
      canvas.width = w
      canvas.height = w
    }

    const N = 12
    const cell = w / N
    const [r, g, b] = TINTS[preset.id]
    const seed = PRESETS.findIndex((p) => p.id === preset.id)

    /* Only the cartridge that is in gets the live spectrum. The rest hold a
       still label: a shelf where all six are dancing says all six are playing,
       and telling them apart is the one job the shelf has. */
    const live = active && on && s.spectrum.length > 0

    ctx.clearRect(0, 0, w, w)

    for (let cx = 0; cx < N; cx++) {
      /* Each column reads one band, each row is a threshold on it — so the
         label is a spectrogram in blocks and the picture really is the sound.
         Squared, because a linear spectrum puts everything audible in the
         leftmost two columns. */
      const f = Math.pow((cx + 0.5) / N, 2)
      const energy = live
        ? s.spectrum[Math.min(s.spectrum.length - 1, Math.floor(f * s.spectrum.length))]
        : 0.16 + grain(cx, 0, seed) * 0.18

      for (let cy = 0; cy < N; cy++) {
        const level = (N - cy - 0.5) / N
        const lit = level < energy * 1.5 && grain(cx, cy, seed) > 0.12

        const a = lit ? (active ? 0.45 + energy * 0.9 : 0.34) : 0.055
        ctx.fillStyle = lit
          ? `rgba(${r}, ${g}, ${b}, ${Math.min(a, 1)})`
          : `rgba(235, 235, 235, ${a})`
        /* The gap is cut out of the cell, not laid between cells, so the lit
           blocks tile on an exact pitch — the same reasoning as the icons. */
        const pad = cell * 0.1
        ctx.fillRect(cx * cell + pad, cy * cell + pad, cell - pad * 2, cell - pad * 2)
      }
    }
  })

  return (
    <button className="pl-cart" data-active={active} onClick={onPick} type="button">
      <canvas className="pl-canvas pl-cart-label" ref={ref} />
      <span className="pl-cart-name">{preset.name}</span>
      <span className="pl-cart-note">{preset.note}</span>
    </button>
  )
}

export function DirectionShelf({
  on,
  preset,
  onPick,
}: {
  on: boolean
  preset: PresetId
  onPick: (id: PresetId) => void
}) {
  return (
    <div className="pl-shelf">
      {PRESETS.map((p) => (
        <Cartridge
          key={p.id}
          preset={p}
          active={p.id === preset}
          on={on}
          onPick={() => onPick(p.id)}
        />
      ))}
    </div>
  )
}
