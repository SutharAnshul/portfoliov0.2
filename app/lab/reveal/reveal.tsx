'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Two CRT load animations for the case study screens.
 *
 * Both are deliberately one idea each. The earlier round of four studies is in
 * the history of this file; what came out of it was that the interesting
 * question is not which effect but how much of one — the version that shipped
 * had to be quietened twice, and the thing that made it too much was never the
 * mechanism, it was having several at once.
 *
 * So: one gesture, short, ending exactly on the photograph.
 *
 *   A  switch-on   the tube comes on. The picture is squashed into a bright
 *                  line across the middle and opens out, overbright, settling
 *                  to correct.
 *
 *   B  interlace   the two fields have not meshed yet. Alternate lines sit a
 *                  couple of pixels out and close together.
 *
 * A is a display starting; B is a display locking. A is the more familiar
 * gesture and the more theatrical — it moves the whole picture. B never moves
 * the picture at all, only its lines against each other, which makes it the
 * quieter of the two by some distance.
 */

export type Mode = 'switchon' | 'interlace'

const HEAD = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform vec2 uRes;
  uniform float uP;
`

/* ═══════════════════════════════════════════════════════════════════════════
   A · SWITCH-ON
   ═══════════════════════════════════════════════════════════════════════════
   What a tube does when the power arrives: everything collapsed into one bright
   line across the middle, which then opens vertically into a picture while the
   excess brightness bleeds off.

   Two details do the work. The picture is *squashed* into the opening rather
   than masked by it — sampling y through the opening's height rather than
   clipping to it — because a mask sliding apart is a pair of doors, and a tube
   has the whole frame in that line the entire time. And the overbright decays
   on its own slower curve after the geometry has finished, so the last third
   of the run is only the picture cooling: the shape arrives, then the light
   settles, which is the order it happens in.
   ─────────────────────────────────────────────────────────────────────────── */
const SWITCHON = `${HEAD}
  void main() {
    /* The opening, done by 55% of the run. The rest is luminance. */
    float h = smoothstep(0.0, 0.55, uP);
    /* Eased so it leaves the line quickly and arrives at the edges slowly,
       which is the shape of a deflection coil coming up to voltage. */
    h = pow(h, 0.62);

    float dy = abs(vUv.y - 0.5) * 2.0;

    /* Outside the opening there is no picture — and no light either, because a
       tube that has not deflected there has not lit it. */
    if (dy > h) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }

    /* Squashed, not masked: the whole frame is inside that line from the
       first instant, which is what a tube actually holds. */
    vec2 uv = vec2(vUv.x, 0.5 + (vUv.y - 0.5) / max(h, 0.0015));
    vec3 col = texture2D(uTex, clamp(uv, 0.0, 1.0)).rgb;

    /* Overbright, on its own slower curve so it is still settling after the
       shape has finished. Squeezing a whole frame into a fraction of the
       height is also concentrating its light, so this is not decoration. */
    float hot = 1.0 - smoothstep(0.0, 0.85, uP);
    col *= 1.0 + hot * 1.15;
    col += vec3(0.75, 0.85, 0.78) * hot * 0.16;

    /* The lit edge of the opening, brightest while the gap is narrow. */
    float edge = smoothstep(h, h - 0.06, dy);
    col += vec3(0.7, 0.85, 0.72) * (1.0 - edge) * hot * 0.7;

    gl_FragColor = vec4(col, 1.0);
  }
`

/* ═══════════════════════════════════════════════════════════════════════════
   B · INTERLACE
   ═══════════════════════════════════════════════════════════════════════════
   A frame on an interlaced set is two passes — the odd lines, then the even
   ones — and until they mesh the picture is serrated: every edge in it is
   combed, because the two fields are drawn a fraction of a line apart.

   This starts the two fields a couple of pixels out of register and closes
   them. Nothing else moves: the picture stays exactly where it is, at exactly
   the size it will be, and only its own lines shift against each other. That
   is what makes it the quiet one — there is no gesture to watch, just an
   edge that stops being ragged.

   The offset is in device pixels rather than in uv, so it is the same
   perceptual amount on a small thumbnail and a full-width screen. In uv it
   would be four times stronger on a quarter-width picture.
   ─────────────────────────────────────────────────────────────────────────── */
const INTERLACE = `${HEAD}
  void main() {
    /* Ends exactly at zero, so the final frame is the texture untouched and
       taking the canvas away is invisible. */
    float k = 1.0 - smoothstep(0.0, 0.86, uP);

    /* Which field this line belongs to. gl_FragCoord, so a line is a real
       line on the glass rather than a fraction of the picture. */
    float line = floor(gl_FragCoord.y);
    float field = mod(line, 2.0) * 2.0 - 1.0;

    /* Up to three device pixels apart, closing. Vertical, because that is the
       axis the two fields are actually offset on — sideways would be a
       timebase error, which is a different fault. */
    float off = field * 3.0 * k / uRes.y;

    vec3 col = texture2D(uTex, clamp(vUv + vec2(0.0, off), 0.0, 1.0)).rgb;

    /* Each field is drawn on its own pass, so while they are apart they are
       not equally fresh — one is always half a frame older and dimmer. It
       evens out as they mesh. */
    col *= 1.0 + field * 0.05 * k;

    /* The beam current settling, once, across the whole frame. Small: this is
       the difference between a picture that arrived and a picture that was
       always there. */
    col *= 1.0 + k * 0.10;

    gl_FragColor = vec4(col, 1.0);
  }
`

const SHADERS: Record<Mode, string> = {
  switchon: SWITCHON,
  interlace: INTERLACE,
}

/** Both short. A load animation is met dozens of times down one page. */
export const DURATION: Record<Mode, number> = {
  switchon: 460,
  interlace: 380,
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
      p: gl.getUniformLocation(prog, 'uP'),
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
    im.src = src
    const upload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im)
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
    <div className="rv" data-done={done}>
      <canvas className="rv-canvas" ref={canvas} />
      {/* The real picture, for anyone the canvas never reaches. It is what the
          shader is drawing, so it is not a placeholder — it is the content,
          and the canvas is the effect laid over it. */}
      <img className="rv-fallback" src={src} alt={alt} />
    </div>
  )
}
