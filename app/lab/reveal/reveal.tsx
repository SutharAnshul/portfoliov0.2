'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Four ways a picture can arrive, all of them WebGL.
 *
 * The one the site ships today is a CSS bloom: two marks on a centre line,
 * and the plate grows out from between them. It is good, and it is about the
 * *frame* — it says a panel opened. None of these are about the frame. They
 * are about the picture, and each one asks a different question about why it
 * was not there a moment ago:
 *
 *   A  raster      it is being painted, and the beam has not got there yet
 *   B  converge    it is there and wrong, and the set is pulling it straight
 *   C  resolve     it is there and coarse, and there is more of it coming
 *   D  transmit    it is arriving in pieces, out of order, down a wire
 *
 * Those are four different fictions, not four decorations. A is a display
 * drawing; B is a display correcting itself; C is data getting denser; D is
 * data getting *there*. Which one is right depends on what a case study screen
 * is meant to be — a thing being shown to you, or a thing being received.
 *
 * All four run on the same clock and the same plumbing, so what differs
 * between them in this lab is only the shader.
 */

export type Mode = 'raster' | 'converge' | 'resolve' | 'transmit'

/* Shared prelude. Every mode gets the picture, the progress, the resolution
   and a hash — the differences start below it. */
const HEAD = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform vec2 uRes;
  uniform vec2 uTexSize;
  uniform float uP;
  uniform float uTime;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  /* Contain, not cover: a case study screen is a document, and cropping one
     to fit a panel loses the part someone put there. */
  vec2 fit(vec2 uv) {
    float a = uRes.x / uRes.y;
    float b = uTexSize.x / uTexSize.y;
    vec2 s = a > b ? vec2(b / a, 1.0) : vec2(1.0, a / b);
    return (uv - 0.5) / s + 0.5;
  }

  bool outside(vec2 uv) {
    return uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0;
  }
`

/* ═══════════════════════════════════════════════════════════════════════════
   A · RASTER — the beam paints it
   ═══════════════════════════════════════════════════════════════════════════
   A cathode ray tube does not display a frame, it draws one, one line at a
   time, and the only reason a television looks like a still picture is that
   the phosphor holds long enough to cover the gap. This slows that down until
   you can see it happen.

   Two details are the whole thing. The beam has to leave heat behind it — the
   lines just painted are brighter than the ones painted a moment ago, decaying
   back to correct — because a hard edge between "drawn" and "not drawn" is a
   wipe, and a wipe is a mask sliding, not a tube working. And the picture has
   to be unstable *while* it is being laid down and settle as it finishes: the
   horizontal jitter is on a decaying envelope, so the raster locks up as the
   frame completes.
   ─────────────────────────────────────────────────────────────────────────── */
const RASTER = `${HEAD}
  void main() {
    /* The beam sweeps top to bottom. vUv.y is 0 at the bottom in GL, so the
       line is at 1 - p and everything above it is already painted. */
    float beam = 1.0 - uP;
    float painted = step(beam, vUv.y);

    /* How long ago this line was drawn, as a fraction of the sweep. Zero at
       the beam, one at the top. */
    float age = clamp((vUv.y - beam) / max(uP, 0.0001), 0.0, 1.0);

    /* The raster is not locked until the frame is done. Jitter per line, on a
       decaying envelope, so the picture stops shivering as it completes. */
    float lock = 1.0 - smoothstep(0.55, 1.0, uP);
    float line = floor(vUv.y * uRes.y);
    float jitter = (hash(vec2(line, floor(uTime * 40.0))) - 0.5) * 0.02 * lock;

    vec2 uv = fit(vUv + vec2(jitter, 0.0));
    vec3 col = outside(uv) ? vec3(0.0) : texture2D(uTex, uv).rgb;

    /* Phosphor heat: hot at the beam, back to correct within about a fifth of
       a screen behind it. Weighted toward green, which is what a white
       phosphor actually over-emits when it is struck hard. */
    float heat = exp(-age * 14.0);
    col += vec3(0.55, 0.75, 0.6) * heat * 0.5 * painted;

    /* The beam itself, and the glow it throws ahead of and behind itself. */
    float d = abs(vUv.y - beam) * uRes.y;
    float core = exp(-d * d * 0.06);
    float halo = exp(-d * 0.06) * 0.25;
    col += vec3(0.8, 1.0, 0.85) * (core + halo) * step(0.001, uP) * step(uP, 0.999);

    /* Ahead of the beam there is no picture — only what an unmodulated tube
       shows, which is not black. */
    float snow = hash(vec2(floor(vUv.x * uRes.x * 0.5), floor(vUv.y * uRes.y * 0.5)) + uTime * 60.0);
    col = mix(vec3(0.02) + snow * 0.05, col, painted);

    /* The grille belongs to the glass, so it is on gl_FragCoord and does not
       move when the picture does. */
    col *= 0.86 + 0.14 * sin(gl_FragCoord.y * 3.14159);

    gl_FragColor = vec4(col, 1.0);
  }
`

/* ═══════════════════════════════════════════════════════════════════════════
   B · CONVERGE — the set pulls it straight
   ═══════════════════════════════════════════════════════════════════════════
   Nothing is hidden here. The picture is fully present from the first frame
   and it is simply *wrong*: the three guns are firing out of register, the
   geometry is pincushioned, and the whole thing is ringing. Then it settles.

   This is what switching on an old set actually looks like, and it is the only
   one of the four that reveals nothing — it corrects. The ring is a damped
   oscillation rather than a tween, because a degauss coil is an LC circuit and
   it rings at a fixed frequency with a falling amplitude. A linear ease would
   be the one thing that gives it away.

   It also pairs with the tubes elsewhere on the site: it is the same
   convergence error the portrait's shader already models, run once and
   resolved instead of held.
   ─────────────────────────────────────────────────────────────────────────── */
const CONVERGE = `${HEAD}
  void main() {
    /* A damped ring: constant frequency, amplitude falling away. The envelope
       and the sine are separate on purpose — tying them together is what makes
       an animation read as eased rather than as physical. */
    float env = exp(-uP * 5.0);
    float ring = sin(uP * 44.0) * env;

    vec2 p = vUv * 2.0 - 1.0;
    float r = dot(p, p);

    /* Geometry: the yoke over- and under-deflects while the field settles. */
    p *= 1.0 + r * ring * 0.09;

    /* Convergence: the three beams land apart and walk into register. Radial,
       because the error grows with deflection — a uniform offset would be a
       chromatic aberration filter, which is a photographic idea, not a tube
       one. */
    vec2 dir = normalize(p + 1e-6);
    float split = (env * 0.055 + abs(ring) * 0.02) * length(p);

    vec2 rUv = fit((p - dir * split) * 0.5 + 0.5);
    vec2 gUv = fit(p * 0.5 + 0.5);
    vec2 bUv = fit((p + dir * split) * 0.5 + 0.5);

    vec3 col = vec3(
      outside(rUv) ? 0.0 : texture2D(uTex, rUv).r,
      outside(gUv) ? 0.0 : texture2D(uTex, gUv).g,
      outside(bUv) ? 0.0 : texture2D(uTex, bUv).b
    );

    /* The HV supply sags and recovers, so the whole frame breathes brighter
       and dimmer as it settles. */
    col *= 1.0 + ring * 0.35;

    /* One shudder as the degauss coil fires, over almost before it is seen. */
    float thump = exp(-uP * 40.0);
    col += vec3(0.5, 0.55, 0.5) * thump * 0.25;

    col *= 0.9 + 0.1 * sin(gl_FragCoord.y * 3.14159);
    gl_FragColor = vec4(col, 1.0);
  }
`

/* ═══════════════════════════════════════════════════════════════════════════
   C · RESOLVE — there is more of it coming
   ═══════════════════════════════════════════════════════════════════════════
   The only one of the four that is not about a display at all. It belongs to
   the icons: the picture arrives as a handful of big cells in two colours and
   gets denser, more levels and smaller cells, until it is a photograph.

   Both axes step in powers of two, and they step rather than slide. That is
   what separates it from a blur clearing: a blur is a continuous thing losing
   its radius, and this is a discrete thing gaining resolution — you should be
   able to count the stages.

   The dither is an ordered Bayer matrix and not noise, because at two levels
   noise is a mess and a Bayer matrix is a *pattern* — the crosshatch it makes
   is the same visual idea as a 13×13 icon built out of cells.
   ─────────────────────────────────────────────────────────────────────────── */
const RESOLVE = `${HEAD}
  /* Ordered dither, built by recursion rather than by a lookup table — GLSL ES
     has no bitwise operators, and this is the compact construction of the same
     matrix. */
  float bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2.0 + a.y * a.y * 0.75);
  }
  float bayer4(vec2 a) { return bayer2(a * 0.5) * 0.25 + bayer2(a); }
  float bayer8(vec2 a) { return bayer4(a * 0.5) * 0.25 + bayer2(a); }

  void main() {
    /* Five stages, held then stepped. Cells 16px to 1px, levels 2 to 32. */
    float stage = floor(uP * 5.0);
    float cell = pow(2.0, 4.0 - stage);
    float levels = pow(2.0, stage + 1.0);

    /* Snap the sample to the cell so the whole block takes one colour. Sampled
       at the cell's centre, not its corner — the corner biases every block up
       and left by half a cell, which shifts the picture as it resolves. */
    vec2 px = gl_FragCoord.xy;
    vec2 snapped = (floor(px / cell) + 0.5) * cell;
    vec2 uv = fit(snapped / uRes);
    vec3 src = outside(uv) ? vec3(0.0) : texture2D(uTex, uv).rgb;

    /* Quantise, with the dither threshold added before the floor. That is what
       makes two levels legible instead of a silhouette. */
    float t = bayer8(px / cell);
    vec3 col = floor(src * levels + t) / levels;

    /* The cell edges are visible while cells are big, and gone once they are
       pixels — the grid is part of the picture at that size, the way it is in
       an icon. */
    vec2 inCell = fract(px / cell);
    float grid = min(min(inCell.x, inCell.y), min(1.0 - inCell.x, 1.0 - inCell.y));
    float showGrid = smoothstep(1.5, 4.0, cell);
    col *= 1.0 - smoothstep(0.10, 0.0, grid) * 0.35 * showGrid;

    gl_FragColor = vec4(col, 1.0);
  }
`

/* ═══════════════════════════════════════════════════════════════════════════
   D · TRANSMIT — it is arriving down a wire
   ═══════════════════════════════════════════════════════════════════════════
   Bands land out of order on an interlaced schedule — every eighth line first,
   then the fours between them, then the twos, then the rest — which is exactly
   how an interlaced GIF or a progressive JPEG comes in over a slow connection.
   Anyone who used the web before broadband has watched this happen.

   Out of order is the entire point, and it is what makes this a different idea
   from A rather than a variation on it. A is one beam moving steadily down a
   screen: a machine drawing. This is a picture assembling itself from the
   middle outward in four passes: a machine receiving. The bands that have not
   landed hold snow, and each one tears sideways as it arrives and snaps
   straight — a line that has just been latched, not a line being painted.
   ─────────────────────────────────────────────────────────────────────────── */
const TRANSMIT = `${HEAD}
  void main() {
    float bands = 32.0;
    float band = floor(vUv.y * bands);

    /* The interlaced schedule. Bands whose index divides by 8 come first, then
       by 4, then by 2, then everything else — four passes, each finer than the
       last, which is the shape of the thing being imitated. */
    float pass = 3.0;
    if (mod(band, 8.0) < 0.5) pass = 0.0;
    else if (mod(band, 4.0) < 0.5) pass = 1.0;
    else if (mod(band, 2.0) < 0.5) pass = 2.0;

    /* Within a pass the order is scattered rather than sequential, so it reads
       as arrival rather than as a second sweep. */
    float jitter = hash(vec2(band, 7.0)) * 0.14;
    float due = pass * 0.24 + jitter;
    float since = uP - due;
    float landed = step(0.0, since);

    /* A band tears sideways as it lands and pulls straight within about a
       tenth of the run. */
    float settle = 1.0 - clamp(since / 0.10, 0.0, 1.0);
    float tear = (hash(vec2(band, 3.0)) - 0.5) * 0.22 * settle * settle;

    vec2 uv = fit(vUv + vec2(tear, 0.0));
    vec3 col = outside(uv) ? vec3(0.0) : texture2D(uTex, uv).rgb;

    /* Fresh bands come in hot and cool off — the latch, not a fade. */
    col += vec3(0.45, 0.6, 0.5) * settle * 0.4;

    /* Nothing has been received here yet. */
    float snow = hash(vec2(floor(vUv.x * uRes.x * 0.4), band) + uTime * 50.0);
    vec3 dead = vec3(0.03) + snow * 0.07;

    col = mix(dead, col, landed);

    /* The seam between a landed band and a dead one is a real edge — it is
       where the data stops — so it gets a line rather than a gradient. */
    float seam = smoothstep(0.02, 0.0, abs(fract(vUv.y * bands) - 0.5) - 0.48);
    col += vec3(0.25) * seam * landed * settle;

    col *= 0.88 + 0.12 * sin(gl_FragCoord.y * 3.14159);
    gl_FragColor = vec4(col, 1.0);
  }
`

const SHADERS: Record<Mode, string> = {
  raster: RASTER,
  converge: CONVERGE,
  resolve: RESOLVE,
  transmit: TRANSMIT,
}

/** How long each takes. Not all the same: they are doing different amounts. */
export const DURATION: Record<Mode, number> = {
  raster: 1100,
  converge: 1400,
  resolve: 1300,
  transmit: 1600,
}

export function Reveal({
  mode,
  src,
  alt,
  playKey,
}: {
  mode: Mode
  src: string
  alt: string
  /** Change this to run it again. */
  playKey: number
}) {
  const host = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const started = useRef<number>(0)
  const [done, setDone] = useState(false)

  const run = useCallback(() => {
    started.current = performance.now()
    setDone(false)
  }, [])

  useEffect(() => {
    if (playKey > 0) run()
  }, [playKey, run])

  useEffect(() => {
    const cv = canvas.current
    if (!cv) return
    const gl = cv.getContext('webgl', { alpha: false, antialias: false })
    if (!gl) return

    const vs = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(
      vs,
      `attribute vec2 aPos; varying vec2 vUv;
       void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`,
    )
    gl.compileShader(vs)

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fs, SHADERS[mode])
    gl.compileShader(fs)
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error(mode, gl.getShaderInfoLog(fs))
      return
    }

    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const u = {
      tex: gl.getUniformLocation(prog, 'uTex'),
      res: gl.getUniformLocation(prog, 'uRes'),
      texSize: gl.getUniformLocation(prog, 'uTexSize'),
      p: gl.getUniformLocation(prog, 'uP'),
      time: gl.getUniformLocation(prog, 'uTime'),
    }

    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    gl.uniform1i(u.tex, 0)

    let ready = false
    let frame = 0

    const im = new Image()
    im.crossOrigin = 'anonymous'
    im.src = src
    const upload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im)
      gl.uniform2f(u.texSize, im.naturalWidth, im.naturalHeight)
      ready = true
      run()
    }
    im.decode().then(upload, () => {
      if (im.complete && im.naturalWidth) upload()
    })

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw)
      if (!ready) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.max(1, Math.round(cv.clientWidth * dpr))
      const h = Math.max(1, Math.round(cv.clientHeight * dpr))
      if (cv.width !== w || cv.height !== h) {
        cv.width = w
        cv.height = h
      }
      gl.viewport(0, 0, w, h)

      const p = Math.min(1, (now - started.current) / DURATION[mode])
      gl.uniform1f(u.p, p)
      gl.uniform1f(u.time, now / 1000)
      gl.uniform2f(u.res, w, h)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      if (p >= 1) setDone((d) => (d ? d : true))
    }
    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      gl.deleteProgram(prog)
      gl.deleteTexture(tex)
      gl.deleteBuffer(buf)
    }
  }, [mode, src, run])

  return (
    <div className="rv" ref={host} data-done={done}>
      <canvas className="rv-canvas" ref={canvas} />
      {/* The real picture, for anyone the canvas never reaches. It is what the
          shader is drawing, so it is not a placeholder — it is the content,
          and the canvas is the effect laid over it. */}
      <img className="rv-fallback" src={src} alt={alt} />
    </div>
  )
}
