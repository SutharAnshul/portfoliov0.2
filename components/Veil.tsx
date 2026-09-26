'use client'

import { useEffect, useRef } from 'react'

/**
 * The veil under the mark: glass in CSS, colour in a shader.
 *
 * The blur has to be CSS. A WebGL canvas cannot see the page behind it —
 * nothing outside the canvas is available to sample — so the only thing that
 * can blur a document is `backdrop-filter`, and that is what the four panes in
 * globals.css are. What the shader does is the colour on top of them, and it
 * does three things a CSS gradient cannot.
 *
 * It warps the boundary. A radial-gradient's iso-lines are arcs, and an arc
 * across the top of a window reads as a dome — an object sitting on the page
 * rather than the page itself thinning out. The shader pushes the boundary
 * around with a little fractal noise, so there is no curve to trace.
 *
 * It dithers. Two hundred pixels of ramp between a solid colour and nothing is
 * about forty steps at 8 bits, and on a flat cream act you can count them. A
 * quarter-step of noise before quantisation turns the staircase into grain.
 *
 * And it has a surface. A faint moving grain, scaled by the veil's own alpha
 * so it only exists where the veil does, which is the difference between
 * something you look through and something you do not notice is there.
 *
 * The shape is a band with a swell, not a dome: full width at the top edge,
 * deepest under the mark, never less than `EDGE` of that depth at the sides.
 * And the solid part reaches past the bottom of the mark — measured from the
 * mark itself, not guessed — because a mark sitting below the colour it is
 * supposed to be standing on is the thing that looked wrong.
 */

/**
 * How much the wash weighs.
 *
 * Much less than it did. It was cut to this when the mark was given a halo of
 * its own and stopped relying on the wash; the halo has since been taken out
 * again — it could not be drawn on WebKit without painting a rectangle, see
 * .site-mark in globals.css — so this is once more the only thing holding a
 * light screen off the name as it scrolls under it on a dark act.
 *
 * It has been left where it is rather than put back up, because the case it
 * has to survive is narrow: the mark always contrasts with the page, since
 * both are mixed from the same pair of tokens, and what can go under it is a
 * picture rather than the page. If the name ever does get lost over one, this
 * is the number to raise — and the only one.
 */
const PEAK = 0.0788
/** Out on the shoulders, where nothing needs holding off anything. The blur
 *  out there can do as it likes; nobody is reading the corner of a window. */
const TOP = 0.04
/** How much of the depth under the mark the far edges keep. */
const EDGE = 0.2
/** Clear of the mark's foot, so it is standing on the veil, not in it. */
const CLEARANCE = 14

/**
 * How much of the page survives each pane, going down.
 *
 * They compose — a pane filters what the pane before it left — so the four of
 * them together leave about a third of the original contrast under the mark,
 * and about two thirds out at the shoulders where only the first two reach.
 */
const KEEP = [0.84, 0.82, 0.78, 0.72]

/**
 * The filter that mixes the backdrop toward a luminance rather than painting
 * over it.
 *
 *   contrast(c) then brightness(b)   maps  v -> v*c*b + b*(1-c)/2
 *   what we want                     is    v -> v*keep + L*(1-keep)
 *
 * so b = keep + 2L(1-keep) and c = keep/b. On an ink act L is near zero, b is
 * near keep, and the whole thing is close to a plain multiply: black stays
 * black, so where the page is already ink the pane does nothing and has no
 * edge to see. On a cream act L is near one, b goes above one, and the same
 * expression lifts dark type toward the paper instead. One formula, both ways
 * round, and neither of them is a colour laid on top.
 */
function toward(L: number, keep: number) {
  const b = keep + 2 * L * (1 - keep)
  const c = keep / b
  return `brightness(${b.toFixed(4)}) contrast(${c.toFixed(4)})`
}

/** Rec. 709, on the sRGB values as stored: this is about what the eye reads
 *  off the screen, not about getting the light transport right. */
function luma(r: number, g: number, b: number) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

/** Half of 60fps. The field drifts; it does not need to race. */
const FRAME = 33

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`

const FRAG = `
precision mediump float;

uniform vec2  uSize;   /* css px */
uniform vec3  uColour;
uniform float uSolid;  /* px from the top: opaque to here, under the mark */
uniform float uFade;   /* px from the top: gone by here, under the mark */
uniform float uMarkX;  /* 0..1 */
uniform float uEdge;
uniform float uPeak;   /* the most it ever weighs, around the mark */
uniform float uTop;    /* what it weighs out on the shoulders */
uniform float uTime;
uniform float uDpr;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * vnoise(p); p *= 2.02; a *= 0.5; }
  return s;
}

void main() {
  vec2 px = gl_FragCoord.xy / uDpr;
  float x = px.x / uSize.x;
  float y = uSize.y - px.y;

  /* Across: a hump, not an arc. smoothstep runs out well before the window
     does, so the curve is level along both shoulders and only dips near the
     mark — which is the difference between a shape laid on the page and the
     page thinning out. An ellipse cannot do this: its tangent is still
     turning when it reaches the edge of the screen, and a turning edge at the
     corner of a window is what reads as a dome. */
  float d = abs(x - uMarkX) / max(max(uMarkX, 1.0 - uMarkX), 0.001);
  float swell = mix(uEdge, 1.0, 1.0 - smoothstep(0.10, 0.78, d));

  /* The boundary, pushed off its curve — by a share of the local depth, so
     the wobble is the same size relative to the veil everywhere. */
  float warp = (fbm(vec2(x * 3.1, uTime * 0.03)) - 0.5) * 34.0 * swell;

  float solid = uSolid * swell + warp;
  float fade = max(uFade * swell + warp * 1.5, solid + 1.0);

  float a = 1.0 - smoothstep(solid, fade, y);

  /* And a ceiling on it, which is the whole difference between a veil and a
     lid. Full weight is spent where the letters are and nowhere else. It is a
     third of what it was, because the glass under it is now pulling the page
     toward the page's own colour rather than waiting to be painted over.
     Opaque everywhere was what made it visible in the first place: 1.0 is not
     air, it is paint. */
  a *= mix(uTop, uPeak, 1.0 - smoothstep(0.08, 0.62, d));

  /* A surface where there is veil, and nothing where there is not. */
  float grain = (fbm(px * 0.7 + vec2(0.0, uTime * 0.04)) - 0.5) * 0.05;
  float dither = (hash(px + fract(uTime) * 64.0) - 0.5) * 0.004;

  a = clamp(a + grain * a + dither, 0.0, 1.0);

  gl_FragColor = vec4(uColour * a, a);
}
`

export function Veil({ active }: { active: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  const shown = useRef<HTMLCanvasElement>(null)
  const live = useRef(active)
  const wake = useRef<(() => void) | null>(null)

  live.current = active

  useEffect(() => {
    const box = host.current
    const cv = shown.current
    if (!box || !cv) return

    const gl = cv.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    })
    /* No context: the gradient in globals.css stays, which is why it is still
       written. It is the same shape without the grain. */
    if (!gl) return

    const build = (type: number, src: string) => {
      const s = gl.createShader(type)
      if (!s) return null
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn('veil:', gl.getShaderInfoLog(s))
        return null
      }
      return s
    }

    const vs = build(gl.VERTEX_SHADER, VERT)
    const fs = build(gl.FRAGMENT_SHADER, FRAG)
    const prog = vs && fs ? gl.createProgram() : null
    if (!vs || !fs || !prog) return

    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    /* One triangle, big enough to cover the clip space. */
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const attr = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(attr)
    gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0)

    const u = (n: string) => gl.getUniformLocation(prog, n)
    const uSize = u('uSize')
    const uColour = u('uColour')
    const uSolid = u('uSolid')
    const uFade = u('uFade')
    const uMarkX = u('uMarkX')
    const uEdge = u('uEdge')
    const uPeak = u('uPeak')
    const uTop = u('uTop')
    const uTime = u('uTime')
    const uDpr = u('uDpr')

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    gl.uniform1f(uEdge, EDGE)
    gl.uniform1f(uPeak, PEAK)
    gl.uniform1f(uTop, TOP)

    box.dataset.gl = 'on'

    /* ── the colour ──────────────────────────────────────────────────────
       --background is a registered colour now, so during an act change its
       computed value is a colour part-way between two acts — in whatever
       space the browser chose to interpolate in, which may be lab or oklab or
       srgb. Rather than write a parser for all of them, it is painted onto a
       1×1 canvas and read back: the browser has already agreed it is a colour,
       so the only thing that can parse it correctly is the browser. */
    const probe = document.createElement('canvas')
    probe.width = probe.height = 1
    const pen = probe.getContext('2d', { willReadFrequently: true })
    let said = ''
    const colour = new Float32Array([0, 0, 0])

    const readColour = () => {
      const now = getComputedStyle(document.documentElement)
        .getPropertyValue('--background')
        .trim()
      if (!now || now === said || !pen) return
      said = now
      pen.clearRect(0, 0, 1, 1)
      pen.fillStyle = '#000'
      pen.fillStyle = now
      pen.fillRect(0, 0, 1, 1)
      const [r, g, b] = pen.getImageData(0, 0, 1, 1).data
      colour[0] = r / 255
      colour[1] = g / 255
      colour[2] = b / 255
      gl.uniform3fv(uColour, colour)

      /* The glass is aimed at the same colour the shader is painting, so the
         two never disagree about which act it is. */
      const L = luma(r, g, b)
      KEEP.forEach((keep, i) => {
        box.style.setProperty(`--veil-f${i + 1}`, toward(L, keep))
      })
    }

    /* ── the measurements ────────────────────────────────────────────────
       Where the mark actually is, so the solid part of the veil reaches past
       the bottom of it rather than stopping somewhere above. */
    let W = 0
    let H = 0

    const measure = () => {
      const b = box.getBoundingClientRect()
      const w = Math.max(1, Math.round(b.width))
      const h = Math.max(1, Math.round(b.height))
      /* Capped: this is a wash, and a wash does not need retina. */
      const dpr = Math.min(1.5, window.devicePixelRatio || 1)

      if (w !== W || h !== H || cv.width !== Math.round(w * dpr)) {
        W = w
        H = h
        cv.width = Math.round(w * dpr)
        cv.height = Math.round(h * dpr)
        gl.viewport(0, 0, cv.width, cv.height)
        gl.uniform1f(uDpr, dpr)
        gl.uniform2f(uSize, W, H)
      }

      const mark = document.querySelector('.site-mark')
      const m = mark ? mark.getBoundingClientRect() : null
      const foot = m ? m.bottom - b.top : H * 0.44
      gl.uniform1f(uSolid, Math.min(H * 0.88, foot + CLEARANCE))
      gl.uniform1f(uFade, H)
      gl.uniform1f(uMarkX, m ? ((m.left + m.right) / 2 - b.left) / W : 0.5)
    }

    /* ── the loop ────────────────────────────────────────────────────────
       It runs while the veil is on screen and the tab is in front, at half
       frame rate, and stops dead otherwise. A fixed overlay that renders all
       day on a page nobody is looking at is a battery bill, not a flourish. */
    const still = window.matchMedia('(prefers-reduced-motion: reduce)')
    let raf = 0
    let last = 0
    const born = performance.now()

    const draw = (now: number) => {
      readColour()
      measure()
      gl.uniform1f(uTime, still.matches ? 0 : (now - born) / 1000)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const frame = (now: number) => {
      if (!live.current || document.hidden) {
        raf = 0
        return
      }
      raf = requestAnimationFrame(frame)
      if (now - last < FRAME) return
      last = now
      draw(now)
      /* Asked for less motion: one frame is the whole animation. */
      if (still.matches) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }

    const start = () => {
      if (raf || document.hidden) return
      raf = requestAnimationFrame(frame)
    }
    wake.current = start

    /* One frame straight away, so it is right before it is ever shown. */
    draw(performance.now())

    const onVisible = () => (document.hidden ? null : live.current && start())
    document.addEventListener('visibilitychange', onVisible)

    const ro = new ResizeObserver(() => {
      draw(performance.now())
      if (live.current) start()
    })
    ro.observe(box)

    /* The act colour is set as an inline style on the root. Draw first and
       ask questions after: the loop will not start while the tab is in the
       background, and a veil that is a whole act behind when the tab comes
       forward is worse than one frame of work nobody watched. */
    const mo = new MutationObserver(() => {
      draw(performance.now())
      if (live.current) start()
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] })

    const lost = (e: Event) => {
      e.preventDefault()
      delete box.dataset.gl
    }
    cv.addEventListener('webglcontextlost', lost)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      wake.current = null
      ro.disconnect()
      mo.disconnect()
      document.removeEventListener('visibilitychange', onVisible)
      cv.removeEventListener('webglcontextlost', lost)
      delete box.dataset.gl
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  /* Scrolled back to the top: the veil fades out in CSS and the loop stops. */
  useEffect(() => {
    if (active) wake.current?.()
  }, [active])

  return (
    <div ref={host} className="site-veil" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <canvas ref={shown} className="site-veil-field" />
    </div>
  )
}
