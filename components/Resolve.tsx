'use client'

import { useEffect, useRef } from 'react'

/**
 * A picture that arrives coarse and gets denser until it is a photograph.
 *
 * Chosen from four studies under /lab/reveal. It begins as a handful of large
 * cells in two colours and gains resolution in steps — smaller cells, more
 * levels — which is the icons' own language rather than the tubes'. The other
 * three were all about a display doing something; this one is about there
 * being more of the picture than there was a moment ago.
 *
 * ── The two things that keep it from being a blur ────────────────────────
 *
 * It steps, and it never slides. A blur clearing is a continuous thing losing
 * its radius; this is a discrete thing gaining resolution, and you should be
 * able to count the stages. Both axes move in powers of two for the same
 * reason — halving is a thing you can see happen, and 1.37× is not.
 *
 * And the dither is an ordered Bayer matrix, not noise. At two levels noise is
 * a mess; a Bayer matrix is a *pattern*, and the crosshatch it makes is the
 * same visual idea as a 13×13 icon built out of cells. That is the whole
 * reason this belongs on this site rather than being a generic pixelate.
 *
 * ── Why it is built as a disposable overlay ──────────────────────────────
 *
 * The picture is always in the DOM as an ordinary <img>. The canvas is laid
 * over it, plays, and is thrown away.
 *
 *   Contexts.  A browser allows roughly sixteen live WebGL contexts and kills
 *              the oldest past that; a case study carries twenty-four screens.
 *              Measured on a hard flick, eight halfway lines were crossed
 *              inside one animation's run — so a context is built on play,
 *              destroyed on finish, and no more than MAX_LIVE run at once.
 *
 *   Handover.  The final stage is a straight passthrough — no quantising, no
 *              dither, no grid — so the last frame drawn is the photograph
 *              exactly and removing the canvas is invisible. Ending on the
 *              finest *quantised* stage would have been nearly the picture,
 *              and nearly is a visible snap.
 *
 *   Failure.   Reduced motion, no IntersectionObserver, no WebGL, no JS: the
 *              <img> is already there and nothing covers it. There is no state
 *              in which the picture is missing.
 */

/** Long enough to read as stages, short enough to not be waited on. */
const RUN = 1250

/** Stages, including the final passthrough. Five you see, then the truth. */
const STAGES = 6

/**
 * How many may hold a WebGL context at once, across the page.
 *
 * Past the ceiling a frame simply does not play. That is the right failure:
 * the only way to exceed it is to scroll faster than the animation runs, and a
 * reveal nobody is in front of is not worth a context.
 */
const MAX_LIVE = 4
let live = 0

const FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform vec2 uRes;
  uniform float uStage;

  /* Ordered dither, built by recursion rather than a lookup table — GLSL ES
     has no bitwise operators, and this is the compact construction of the same
     8x8 matrix. */
  float bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2.0 + a.y * a.y * 0.75);
  }
  float bayer4(vec2 a) { return bayer2(a * 0.5) * 0.25 + bayer2(a); }
  float bayer8(vec2 a) { return bayer4(a * 0.5) * 0.25 + bayer2(a); }

  void main() {
    /* The last stage is the photograph, untouched. This is what makes the
       canvas disappearing invisible — see the note in the component. */
    if (uStage >= ${STAGES - 1}.0) {
      gl_FragColor = vec4(texture2D(uTex, vUv).rgb, 1.0);
      return;
    }

    float cell = pow(2.0, 4.0 - uStage);
    float levels = pow(2.0, uStage + 1.0);

    /* Snap the sample to the cell so a whole block takes one colour. Sampled
       at the cell's centre and not its corner — a corner sample biases every
       block up and left by half a cell, which slides the picture sideways as
       it resolves. */
    vec2 px = gl_FragCoord.xy;
    vec2 snapped = (floor(px / cell) + 0.5) * cell;
    vec3 src = texture2D(uTex, clamp(snapped / uRes, 0.0, 1.0)).rgb;

    /* Quantise, with the dither threshold added before the floor. That is what
       makes two levels legible rather than a silhouette. */
    float t = bayer8(px / cell);
    vec3 col = floor(src * levels + t) / levels;

    /* The cell edges are part of the picture while cells are big, and gone
       once they are pixels — the way a grid is part of an icon at icon size
       and meaningless at photograph size. */
    vec2 inCell = fract(px / cell);
    float grid = min(min(inCell.x, inCell.y), min(1.0 - inCell.x, 1.0 - inCell.y));
    col *= 1.0 - smoothstep(0.10, 0.0, grid) * 0.3 * smoothstep(1.5, 5.0, cell);

    gl_FragColor = vec4(col, 1.0);
  }
`

export function Resolve({ src, alt }: { src: string; alt: string }) {
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
      wrap.dataset.resolving = 'false'
    }

    const play = () => {
      if (!picture.naturalWidth) return
      /* Scrolled past faster than this runs — let it be a picture. */
      if (live >= MAX_LIVE) return

      live++
      canvas = document.createElement('canvas')
      canvas.className = 'resolve-gl'
      canvas.setAttribute('aria-hidden', 'true')
      wrap.appendChild(canvas)

      const gl = canvas.getContext('webgl', { alpha: false, antialias: false })
      if (!gl) {
        /* The one exit that does not go through finish(), so the one that
           would leak the count — and a leaked slot is permanent. */
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
        console.error('resolve:', gl.getShaderInfoLog(fs))
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

      const uStage = gl.getUniformLocation(prog, 'uStage')
      const uRes = gl.getUniformLocation(prog, 'uRes')

      cleanup = () => {
        gl.deleteProgram(prog)
        gl.deleteShader(vs)
        gl.deleteShader(fs)
        gl.deleteTexture(tex)
        gl.deleteBuffer(buf)
      }

      wrap.dataset.resolving = 'true'
      const t0 = performance.now()
      let drawn = -1

      const draw = (now: number) => {
        if (!canvas) return

        const p = Math.min(1, (now - t0) / RUN)
        const stage = Math.min(STAGES - 1, Math.floor(p * STAGES))

        /* Only redraw when the stage actually changes. The whole idea is that
           this holds still between steps, so drawing the identical frame sixty
           times a second would be work nobody can see — six draws, not eighty. */
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
        const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
        const resized = canvas.width !== w || canvas.height !== h

        if (stage !== drawn || resized) {
          drawn = stage
          if (resized) {
            canvas.width = w
            canvas.height = h
          }
          gl.viewport(0, 0, w, h)
          gl.uniform2f(uRes, w, h)
          gl.uniform1f(uStage, stage)
          gl.drawArrays(gl.TRIANGLES, 0, 3)
        }

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
         decoded yet. Waiting is right: playing against an empty texture would
         resolve a black rectangle into a black rectangle. */
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
    <span className="resolve" ref={host}>
      <img ref={img} src={src} alt={alt} loading="lazy" />
      <span className="resolve-half" ref={half} aria-hidden="true" />
    </span>
  )
}
