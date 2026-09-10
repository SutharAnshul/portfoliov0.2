'use client'

import { useEffect, useRef } from 'react'

/**
 * A picture whose two fields have not meshed yet, and then do.
 *
 * A frame on an interlaced set is two passes — the odd lines, then the even
 * ones — and until they mesh the picture is combed: every edge in it is
 * serrated, because the fields are drawn a fraction of a line apart. This
 * starts them a couple of device pixels out of register and closes them.
 *
 * Chosen over a switch-on bloom because it is the quiet one. Nothing moves:
 * the picture is in its final place at its final size from the first frame,
 * and only its own lines shift against each other. There is no gesture to
 * watch — an edge is briefly ragged and then it is not. That matters when the
 * thing appears two dozen times down one page while somebody is reading, which
 * is the lesson from every previous attempt at this: what made them too much
 * was never the mechanism, it was how much of it there was.
 *
 * ── The two details worth keeping ────────────────────────────────────────
 *
 * The offset is in device pixels, not in uv. In uv a quarter-width thumbnail
 * would get four times the displacement of a full-width screen; in pixels a
 * line is a line, and it looks like the same fault everywhere.
 *
 * And the fields differ slightly in brightness while they are apart. Each is
 * drawn on its own pass, so one is always half a frame older than the other —
 * that difference evening out as they close is what makes it read as two
 * things becoming one, rather than as a picture being sharpened.
 *
 * ── Why it is a disposable overlay ───────────────────────────────────────
 *
 * The picture is always in the DOM as an ordinary <img>; the canvas is laid
 * over it, plays, and is thrown away.
 *
 *   Contexts.  A browser allows roughly sixteen live WebGL contexts and kills
 *              the oldest past that; a case study carries twenty-four screens,
 *              and a hard flick was measured crossing eight halfway lines
 *              inside one run. So a context is built on play, destroyed on
 *              finish, and no more than MAX_LIVE exist at once.
 *
 *   Handover.  The offset and the brightness both reach exactly zero before
 *              the end, so the last frame drawn is the photograph and removing
 *              the canvas is invisible.
 *
 *   Failure.   Reduced motion, no IntersectionObserver, no WebGL, no JS: the
 *              <img> is already there and nothing covers it. There is no state
 *              in which the picture is missing.
 */

/** Short. The fields close and that is the whole event. */
const RUN = 320

/**
 * How far apart the fields start, in device pixels.
 *
 * Two, not the three the study used. On a real page against real screenshots
 * three was a visible tear; two is a comb you notice on the hard edges and
 * nowhere else, which is the brief.
 */
const OFFSET = 2.0

/**
 * How many may hold a WebGL context at once, across the page. Past the ceiling
 * a frame does not play — the only way to exceed it is to scroll faster than
 * the animation runs, and a reveal nobody is in front of is not worth a
 * context.
 */
const MAX_LIVE = 4
let live = 0

const FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform vec2 uRes;
  uniform float uP;

  void main() {
    /* Reaches exactly zero before the run ends, so the final frame is the
       texture untouched. */
    float k = 1.0 - smoothstep(0.0, 0.88, uP);

    /* Which field this line belongs to. gl_FragCoord, so a line is a real line
       on the glass rather than a fraction of the picture. */
    float field = mod(floor(gl_FragCoord.y), 2.0) * 2.0 - 1.0;

    /* Vertical, because that is the axis the two fields are genuinely offset
       on. Sideways would be a timebase error, which is a different fault
       belonging to a different machine. */
    float off = field * ${OFFSET.toFixed(1)} * k / uRes.y;

    vec3 col = texture2D(uTex, clamp(vUv + vec2(0.0, off), 0.0, 1.0)).rgb;

    /* One field is half a frame older than the other, so it is fractionally
       dimmer. Evening out is what makes this read as two things becoming one
       rather than as a picture being sharpened. */
    col *= 1.0 + field * 0.04 * k;

    gl_FragColor = vec4(col, 1.0);
  }
`

export function Interlace({ src, alt }: { src: string; alt: string }) {
  const host = useRef<HTMLSpanElement>(null)
  const img = useRef<HTMLImageElement>(null)
  const half = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const wrap = host.current
    const picture = img.current
    const sentinel = half.current
    if (!wrap || !picture || !sentinel) return

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    let frame = 0
    let canvas: HTMLCanvasElement | null = null
    let ctx: WebGLRenderingContext | null = null
    let cleanup: (() => void) | null = null

    /** Tear the context down and hand the picture back to the <img>. */
    const finish = () => {
      cancelAnimationFrame(frame)
      if (canvas) live--
      cleanup?.()
      cleanup = null
      if (canvas) canvas.remove()
      canvas = null
      /* A page with two dozen of these should not wait on a garbage collector
         to get its contexts back. */
      ctx?.getExtension('WEBGL_lose_context')?.loseContext()
      ctx = null
      wrap.dataset.meshing = 'false'
    }

    const play = () => {
      if (!picture.naturalWidth) return
      /* Scrolled past faster than this runs — let it be a picture. */
      if (live >= MAX_LIVE) return

      live++
      canvas = document.createElement('canvas')
      canvas.className = 'interlace-gl'
      canvas.setAttribute('aria-hidden', 'true')
      wrap.appendChild(canvas)

      const gl = canvas.getContext('webgl', { alpha: false, antialias: false })
      if (!gl) {
        /* The one exit that does not go through finish(), so the one that would
           leak the count — and a leaked slot is permanent. */
        live--
        canvas.remove()
        canvas = null
        return
      }
      ctx = gl

      const vs = gl.createShader(gl.VERTEX_SHADER)!
      gl.shaderSource(
        vs,
        `attribute vec2 aPos; varying vec2 vUv;
         void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`,
      )
      gl.compileShader(vs)

      const fs = gl.createShader(gl.FRAGMENT_SHADER)!
      gl.shaderSource(fs, FRAG)
      gl.compileShader(fs)
      if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        console.error('interlace:', gl.getShaderInfoLog(fs))
        finish()
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

      const tex = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, picture)
      gl.uniform1i(gl.getUniformLocation(prog, 'uTex'), 0)

      const uP = gl.getUniformLocation(prog, 'uP')
      const uRes = gl.getUniformLocation(prog, 'uRes')

      cleanup = () => {
        gl.deleteProgram(prog)
        gl.deleteShader(vs)
        gl.deleteShader(fs)
        gl.deleteTexture(tex)
        gl.deleteBuffer(buf)
      }

      wrap.dataset.meshing = 'true'
      const t0 = performance.now()

      const draw = (now: number) => {
        if (!canvas) return

        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
        const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w
          canvas.height = h
        }
        gl.viewport(0, 0, w, h)

        const p = Math.min(1, (now - t0) / RUN)
        gl.uniform1f(uP, p)
        gl.uniform2f(uRes, w, h)
        gl.drawArrays(gl.TRIANGLES, 0, 3)

        if (p >= 1) {
          finish()
          return
        }
        frame = requestAnimationFrame(draw)
      }
      frame = requestAnimationFrame(draw)
    }

    const start = () => {
      /* The screens are lazy-loaded, so the one being scrolled to may not have
         decoded yet. Waiting is right: meshing an empty texture would comb a
         black rectangle. */
      if (picture.complete && picture.naturalWidth) play()
      else picture.addEventListener('load', play, { once: true })
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        start()
      },
      /* A sentinel on the frame's own halfway line crossing the fold, rather
         than a ratio of the element — a threshold of 0.5 can never be met by a
         frame taller than the window, which would leave the tallest screens
         never playing at all. */
      { threshold: 0, rootMargin: '0px' },
    )
    observer.observe(sentinel)

    return () => {
      observer.disconnect()
      picture.removeEventListener('load', play)
      finish()
    }
  }, [src])

  return (
    <span className="interlace" ref={host}>
      <img ref={img} src={src} alt={alt} loading="lazy" />
      <span className="interlace-half" ref={half} aria-hidden="true" />
    </span>
  )
}
