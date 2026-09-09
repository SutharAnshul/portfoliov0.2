'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * A picture put through a real tube.
 *
 * The CSS version of this was a dark grid laid over a flat image, and the grid
 * never changed no matter what was under it. That is the tell. On a real CRT
 * the beam's spot *widens as it gets brighter*, so a highlight blooms over the
 * gap between lines and a shadow shows the gap fully — the scanlines are a
 * function of the picture, not a texture on top of it. Nothing in CSS can do
 * that, because CSS cannot read the pixel it is covering.
 *
 * So: one fragment shader, doing what emulator shaders do.
 *
 *   geometry   barrel curvature, and everything outside the tube is cut
 *   beam       a Gaussian across each scanline whose width tracks luminance
 *   mask       an aperture grille stepped in DEVICE pixels, never CSS ones,
 *              which is what stops it moiring on fractional display scales
 *   bloom      a cheap six-tap, added in linear light
 *   gamma      decode at 2.2, encode at 2.35 — the mismatch is what crushes
 *              blacks the way a tube does
 *   hum        one soft band drifting down, and a vignette
 *
 * ── Falling back ────────────────────────────────────────────────────────
 *
 * The `<img>` is real markup and ships in the HTML: it is what search engines
 * and screen readers get, it is the texture source, and it is what stays on
 * screen if WebGL is unavailable. Only once a context, a program and a texture
 * all exist does `data-gl="on"` go up, which hides the image, reveals the
 * canvas, and switches off the CSS raster in globals.css. Nothing is ever
 * removed before its replacement is proven to work.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FRAG = `
precision highp float;

uniform sampler2D uTex;
uniform vec2  uRes;      // canvas size in device pixels
uniform vec2  uTexSize;  // the picture's own pixels
uniform vec2  uFocus;    // object-position, 0..1
uniform float uTime;     // seconds
uniform float uLines;    // scanlines across the height
uniform float uWarp;     // barrel strength
uniform float uMask;     // grille strength, 0..1
uniform float uBloom;
uniform float uShift;    // convergence error, in device pixels

varying vec2 vUv;

vec3 toLinear(vec3 c) { return pow(max(c, 0.0), vec3(2.2)); }
vec3 toSrgb(vec3 c)   { return pow(max(c, 0.0), vec3(1.0 / 2.35)); }
float luma(vec3 c)    { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

/* Barrel. Edges bow out, corners pull in — the opposite of a border-radius. */
vec2 curve(vec2 uv) {
  uv = uv * 2.0 - 1.0;
  vec2 off = abs(uv.yx) * uWarp;
  uv += uv * off * off;
  return uv * 0.5 + 0.5;
}

/* object-fit: cover, which a shader does not get for free.

   The quad maps the whole texture across the whole canvas, so a 2:3 picture in
   a narrower box simply stretches — the face gets wider as the column gets
   narrower. Cover instead samples a sub-rectangle of the texture matching the
   box's proportion, which crops rather than distorts. */
vec2 coverScale() {
  float texA = uTexSize.x / uTexSize.y;
  float boxA = uRes.x / uRes.y;
  return texA > boxA ? vec2(boxA / texA, 1.0)   // wider picture: crop the sides
                     : vec2(1.0, texA / boxA);  // taller picture: crop top and bottom
}

/* uFocus is object-position: where the kept window sits inside what is cropped. */
vec2 cover(vec2 uv, vec2 s) { return uv * s + (1.0 - s) * uFocus; }

/* Premultiplied on the way in, which is about the neighbours rather than this
   pixel: the bloom reaches into the transparent ground, and texture2D hands
   back whatever RGB happens to sit under an alpha of zero. Multiplying by
   alpha makes that contribute nothing instead of bleeding a colour nobody
   chose into the edge of the figure. */
vec3 tap(vec2 uv) {
  vec4 t = texture2D(uTex, uv);
  return toLinear(t.rgb * t.a);
}

float alphaAt(vec2 uv) { return texture2D(uTex, uv).a; }

/* The taps are in texture space, so they take the cover scale with them —
   otherwise a cropped axis blurs by a different amount than the other one.

   Eight taps, not six, and this is a fix rather than a refinement. The six were
   four on the axes plus two at plus and minus px * 2.0 — which is one diagonal
   only, the top-left and bottom-right corners. (No backticks in here: this
   whole shader is a JS template literal, and one closes it.)
   A halo weighted along a single diagonal is
   not a halo; it is a shadow thrown one way, and that is the white offset the
   glow appeared to have. Adding the other diagonal makes the kernel radially
   symmetric, so bright type glows evenly instead of casting a ghost. */
vec3 bloom(vec2 uv, vec2 s) {
  vec2 px = 1.7 * s / uRes;
  vec3 b = tap(uv + vec2(px.x, 0.0)) + tap(uv - vec2(px.x, 0.0));
  b += tap(uv + vec2(0.0, px.y)) + tap(uv - vec2(0.0, px.y));
  vec2 d = px * 1.45;  // 2 / sqrt(2), so the corners sit on the same circle
  b += tap(uv + d) + tap(uv - d);
  b += tap(uv + vec2(d.x, -d.y)) + tap(uv - vec2(d.x, -d.y));
  return b / 8.0;
}

/* Convergence error: the three guns land in slightly different places, so the
   red edge of a white shape sits a pixel one way and the blue edge a pixel the
   other. Horizontal only — the guns on an inline-gun tube are side by side, and
   a vertical split is a fault, not a characteristic.

   The offset is given in device pixels and converted here, so it stays the same
   apparent width whatever size the element is drawn at and whatever the display
   scale is. s carries the cover scale for the same reason the bloom taps do.

   Because the taps are premultiplied, a channel that lands off the figure
   contributes nothing rather than a colour nobody chose — which is what puts a
   warm rim on one side of the silhouette and a cool one on the other, exactly
   where a real tube's convergence shows first. */
vec3 converge(vec2 uv, vec2 s) {
  vec2 o = vec2(uShift, 0.0) * s / uRes;
  return vec3(tap(uv + o).r, tap(uv).g, tap(uv - o).b);
}

/* Stepped on gl_FragCoord, so one stripe is one physical pixel however the
   display is scaled. In CSS pixels this is what moires. */
vec3 grille(float x) {
  float m = mod(x, 3.0);
  vec3 c = m < 1.0 ? vec3(1.0, 0.55, 0.55)
         : m < 2.0 ? vec3(0.55, 1.0, 0.55)
                   : vec3(0.55, 0.55, 1.0);
  return mix(vec3(1.0), c, uMask);
}

void main() {
  // Curvature is screen-space: the tube's edge is a property of the glass, not
  // of the picture, so the bounds test happens here and cropping happens after.
  vec2 sUv = curve(vUv);

  // Past the glass there is no picture, and no bezel painted either — the
  // page shows through, so the tube keeps its own silhouette.
  if (sUv.x < 0.0 || sUv.x > 1.0 || sUv.y < 0.0 || sUv.y > 1.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec2 cs = coverScale();
  vec2 uv = cover(sUv, cs);

  vec3 src = converge(uv, cs);
  vec3 bl = bloom(uv, cs);

  // The beam. Width tracks brightness, which is the whole point: a bright
  // line spills over its gap, a dark one does not.
  // sUv, not uv: the raster is a property of the tube, so its line count is
  // fixed by the glass. Run it on the cropped coordinate and the number of
  // scanlines would change as the column resizes.
  float b = clamp(luma(src + bl * uBloom), 0.0, 1.0);
  float d = abs(fract(sUv.y * uLines) - 0.5) * 2.0;
  float beam = exp(-pow(d / mix(0.42, 1.15, b), 2.0) * 1.9);

  vec3 col = src * beam + bl * uBloom;

  // The mask eats light, so some goes back or the screen just reads as dim.
  col *= grille(gl_FragCoord.x);
  col *= mix(1.0, 1.5, uMask);

  // One soft band drifting down, slowly enough to be caught not watched.
  float hum = fract(sUv.y * 0.5 - uTime * 0.055);
  col *= 1.0 - 0.055 * smoothstep(0.0, 0.09, hum) * (1.0 - smoothstep(0.09, 0.24, hum));

  // Falloff at the edge of the glass. Weak, because a source with a
  // transparent ground has no glass to fall off — here it would only be
  // shading the figure's own shoulders for no visible reason.
  vec2 v = vUv * (1.0 - vUv);
  col *= pow(clamp(v.x * v.y * 16.0, 0.0, 1.0), 0.12);

  // The source's own alpha, carried through rather than composited away. An
  // opaque picture has alpha 1 everywhere and is unaffected, so this is one
  // path for both: the thumbnails stay solid and a cut-out figure stays cut
  // out, standing on the page instead of inside a black rectangle.
  //
  // Alpha is NOT modulated by the beam or the mask. Those darken the picture;
  // letting them touch alpha would punch the raster clean through the
  // silhouette and show the page in stripes.
  gl_FragColor = vec4(toSrgb(col), alphaAt(uv));
}`

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)
  if (!sh) return null
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh)
    return null
  }
  return sh
}

export function CrtScreen({
  src,
  alt,
  className = '',
  imgClassName = '',
  lines = 190,
  warp = 0.16,
  mask = 0.55,
  bloomAmount = 0.22,
  shift = 1.4,
  glow = true,
  focusX = 0.5,
  focusY = 0.5,
  pixelated = false,
}: {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  lines?: number
  warp?: number
  mask?: number
  bloomAmount?: number
  /**
   * Convergence error in device pixels: how far the red and blue guns land
   * either side of green. One to two is a tube that is slightly out of
   * adjustment; past three it stops reading as a screen and starts reading as
   * a 3D film.
   */
  shift?: number
  /** The light thrown on the wall behind. Off where the frame would clip it. */
  glow?: boolean
  /** object-position, 0–1 and measured from the left and the top, as in CSS. */
  focusX?: number
  focusY?: number
  /** Source is pixel art: sample it NEAREST and never smooth it. */
  pixelated?: boolean
}) {
  const host = useRef<HTMLSpanElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const img = useRef<HTMLImageElement>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const cv = canvas.current
    const im = img.current
    const box = host.current
    if (!cv || !im || !box) return

    let disposed = false
    let teardown: (() => void) | null = null
    let resume: (() => void) | null = null
    let pause: (() => void) | null = null

    /**
     * Deferred until the thing is on screen and has a size.
     *
     * The phone header renders the same four tiles the work index does, and at
     * desktop widths they are display:none — so booting eagerly opened eight
     * contexts to draw four pictures, four of them into a 1×1 canvas nobody
     * would ever see. Browsers hand out somewhere around sixteen before they
     * start dropping the oldest, and a page of tiles would have walked into
     * that. A hidden element has no box, so the size check is what catches it.
     */
    const boot = () => {
      if (teardown || disposed) return false
      if (box.clientWidth < 2 || box.clientHeight < 2) return false
      teardown = init()
      return !!teardown
    }

    const init = (): (() => void) | null => {
    const gl = cv.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      powerPreference: 'low-power',
    })
    if (!gl) return null

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return null
    const prog = gl.createProgram()
    if (!prog) return null
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    // Non-power-of-two, so clamp and no mipmaps or it samples black.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    // NEAREST for pixel art. LINEAR is right for a photograph and ruinous for
    // a drawing whose whole subject is that it has visible pixels — it would
    // smooth every block edge into a gradient.
    const filter = pixelated ? gl.NEAREST : gl.LINEAR
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)

    const u = {
      res: gl.getUniformLocation(prog, 'uRes'),
      texSize: gl.getUniformLocation(prog, 'uTexSize'),
      focus: gl.getUniformLocation(prog, 'uFocus'),
      time: gl.getUniformLocation(prog, 'uTime'),
      lines: gl.getUniformLocation(prog, 'uLines'),
      warp: gl.getUniformLocation(prog, 'uWarp'),
      mask: gl.getUniformLocation(prog, 'uMask'),
      bloom: gl.getUniformLocation(prog, 'uBloom'),
      shift: gl.getUniformLocation(prog, 'uShift'),
    }
    // The texture is uploaded flipped, so v = 1 is the top of the picture and
    // a CSS-style focus measured from the top has to be turned over.
    gl.uniform2f(u.focus, focusX, 1 - focusY)
    gl.uniform1f(u.lines, lines)
    gl.uniform1f(u.warp, warp)
    gl.uniform1f(u.mask, mask)
    gl.uniform1f(u.bloom, bloomAmount)
    gl.uniform1f(u.shift, shift)

    let ready = false
    let frame = 0
    const t0 = performance.now()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const size = () => {
      // Capped at 2: past that the grille is finer than anyone can see and it
      // is four times the fragments for it.
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.max(1, Math.round(box.clientWidth * dpr))
      const h = Math.max(1, Math.round(box.clientHeight * dpr))
      if (cv.width !== w || cv.height !== h) {
        cv.width = w
        cv.height = h
      }
      gl.viewport(0, 0, cv.width, cv.height)
      gl.uniform2f(u.res, cv.width, cv.height)
    }

    const draw = (now: number) => {
      if (!ready) return
      size()
      gl.uniform1f(u.time, (now - t0) / 1000)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const loop = (now: number) => {
      draw(now)
      frame = requestAnimationFrame(loop)
    }

    const start = () => {
      if (reduce) {
        draw(performance.now())
        return
      }
      if (!frame) frame = requestAnimationFrame(loop)
    }
    const stop = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
    }

    const upload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im)
      // Cover needs the picture's own proportion, which only exists once it
      // has actually decoded.
      gl.uniform2f(u.texSize, im.naturalWidth, im.naturalHeight)
      ready = true
      setOn(true)
      start()
    }

    const load = () =>
      im.decode().then(upload, () => {
        // decode() rejects on some cached-image paths; complete is enough.
        if (im.complete && im.naturalWidth) upload()
      })

    if (im.complete && im.naturalWidth) load()
    else im.addEventListener('load', load, { once: true })

    resume = start
    pause = stop

    return () => {
      stop()
      gl.deleteTexture(tex)
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
    }

    // Boots on the first sighting, and after that just starts and stops the
    // loop — a rolling hum bar off screen is work nobody is looking at.
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        boot()
        resume?.()
      } else {
        pause?.()
      }
    })
    io.observe(box)

    // A tile can also come into existence at size without ever crossing the
    // viewport edge — a panel opening, a column widening.
    const ro = new ResizeObserver(() => boot())
    ro.observe(box)

    return () => {
      disposed = true
      io.disconnect()
      ro.disconnect()
      teardown?.()
    }
  }, [src, lines, warp, mask, bloomAmount, shift, focusX, focusY, pixelated])

  return (
    <span ref={host} className={`crt-screen ${className}`} data-gl={on ? 'on' : undefined}>
      {/* The light the tube throws on the wall behind it. A blurred copy of
          the picture rather than anything computed: blur is a low-pass filter
          and the scanlines and the mask are precisely the frequencies it
          removes, so a shader glow derived from the shaded output lands in the
          same place as this one and costs a second pass to get there. What
          actually sells it is that the colour varies across the spill — a blue
          frame glows blue on its own side — and a copy gives that for free.

          `filter: blur()` paints outside the element's box, which is what lets
          it spill past the tube without anything being sized to hold it. */}
      {glow && <img src={src} alt="" aria-hidden="true" className="crt-glow" />}
      <img
        ref={img}
        src={src}
        alt={alt}
        data-pixelated={pixelated ? '' : undefined}
        className={`crt-src ${imgClassName}`}
      />
      <canvas ref={canvas} className="crt-canvas" aria-hidden="true" />
    </span>
  )
}
