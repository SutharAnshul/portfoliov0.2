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
uniform float uNoise;    // how badly the set is holding, 0 = fine
uniform float uRoll;     // vertical sync: the picture will not sit still
uniform float uTear;     // horizontal sync: lines shoved sideways
uniform float uSag;      // supply sag: the raster swells as the beam weakens
uniform float uSnow;     // signal dropout: static, and the picture going away
uniform float uPhase;    // the set hunting for lock and not finding it
uniform float uLife;     // a working set's own small restlessness
uniform float uKey;      // backdrop key strength, 0 = leave the picture alone
uniform vec2  uKeyBand;  // the luminance band the backdrop lives in

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
vec3 converge(vec2 uv, vec2 s, float px) {
  vec2 o = vec2(px, 0.0) * s / uRes;
  return vec3(tap(uv + o).r, tap(uv).g, tap(uv - o).b);
}

/* A cheap hash, and everything unstable is quantised through it on purpose.
   Faults on a tube arrive on the frame, not smoothly: a tear is there and then
   gone, and interpolating one in and out reads as a wobble rather than a
   fault. floor() on time is what makes it snap. */
/* Keeps its input inside the unit square at every step, so it does not lose
   its footing once uTime is large. The sine version this replaces degenerated
   into a few repeating values after a couple of minutes. */
float hash2(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float hash(float n) { return hash2(vec2(n, n * 1.7 + 0.3)); }

/* A position that never repeats: three rates with no common multiple, so the
   pattern would have to run for hours to come back to where it started. */
float wander(float t, float a, float b, float c) {
  return sin(t * a) * 0.5 + sin(t * b + 2.1) * 0.31 + sin(t * c + 4.7) * 0.19;
}

/* Where the picture is, as opposed to where the glass is.

   Vertical hold gives way in bursts: most seconds are clean, and the ones that
   are not sweep the frame a full height so it wraps through the seam. The tear
   is per-band and much more frequent, a few scanlines at a time shoved
   sideways. Both wrap rather than clamp, because a tube with no picture at the
   edge shows the other edge, not a smear of the last column. */
vec2 wobble(vec2 uv) {
  float roll = 0.0;
  float tear = 0.0;

  if (uRoll > 0.0) {
    // The slow half: the frame is never quite held, and drifts.
    roll += wander(uTime, 0.23, 0.61, 1.07) * 0.10 * uRoll;

    /* The fast half: every so often the hold lets go entirely and the picture
       runs. Each slip gets its own speed, direction and length, so no two look
       alike — which is what the fixed sawtooth could never do. */
    float ev = floor(uTime * 0.7);
    float fire = step(0.62, hash(ev * 3.1));
    float life = mix(0.2, 0.85, hash(ev * 7.7));
    float local = fract(uTime * 0.7);
    float speed = mix(0.6, 3.4, hash(ev * 11.3));
    float dir = hash(ev * 5.9) < 0.28 ? -1.0 : 1.0;
    roll += fire * step(local, life) * dir * local * speed * uRoll;
  }

  if (uTear > 0.0) {
    /* Tearing arrives in blocks of lines rather than one line at a time, and
       the block boundaries move — a fixed band count reads as a venetian
       blind. */
    float rows = mix(14.0, 42.0, hash(floor(uTime * 2.3)));
    float band = floor(uv.y * rows + wander(uTime, 0.7, 1.9, 3.3) * 6.0);
    float beat = floor(uTime * mix(9.0, 26.0, hash(floor(uTime * 0.9))));
    float torn = step(mix(0.95, 0.72, uTear), hash2(vec2(band, beat)));
    tear = torn * (hash2(vec2(band * 1.7, beat * 2.3)) - 0.5) * 0.16 * uTear;
  }

  return vec2(fract(uv.x + tear), fract(uv.y + roll));
}

/* Value noise, for the ground the keyed backdrop is replaced with. Two
   octaves is enough: one for the clumps, one for the grain. It is generated
   rather than sampled from a texture so it costs no bytes and never tiles. */
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i.x + i.y * 57.0);
  float b = hash(i.x + 1.0 + i.y * 57.0);
  float c = hash(i.x + (i.y + 1.0) * 57.0);
  float d = hash(i.x + 1.0 + (i.y + 1.0) * 57.0);
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

/* How much of this pixel is subject.

   Two terms, and both are needed. The band says the backdrop is neither the
   darkest thing on screen nor the brightest — the shirt is below it and the
   skin is above it — so what gets removed is the middle. Detail says the
   backdrop is smooth and everything on the subject is not, which is what saves
   hair: a mid-tone strand sits squarely inside the band and is kept anyway
   because it has contrast against its neighbours. */
float subject(vec3 c, vec3 blur) {
  if (uKey <= 0.0) return 1.0;
  float l = luma(c);
  // 1 inside the backdrop band, falling off on both sides.
  float inBand = smoothstep(uKeyBand.x - 0.05, uKeyBand.x, l) *
                 (1.0 - smoothstep(uKeyBand.y, uKeyBand.y + 0.12, l));
  float detail = abs(l - luma(blur));
  // Less detail is needed to count as subject than the first pass allowed.
  // At the wider threshold, skin in shadow — mid-tone and almost as smooth as
  // the backdrop — was being speckled away along the jaw.
  float flatness = 1.0 - smoothstep(0.0006, 0.0045, detail);
  return 1.0 - clamp(inBand * flatness * uKey, 0.0, 1.0);
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

  /* Supply sag. The raster swells as the beam weakens, so the picture gets
     bigger and dimmer at the same moment and then snaps back. Brightness on
     its own reads as a fade; tied to geometry it reads as a set that cannot
     hold its supply. Kept in screen space, before the crop, because it is the
     scan going wrong rather than the picture changing. */
  float sag = 0.0;
  if (uSag > 0.0) {
    sag = (wander(uTime, 0.9, 2.3, 5.1) * 0.5 + 0.5) * uSag;
    sag += step(0.86, hash(floor(uTime * 3.0))) * 0.5 * uSag;
    vec2 c = sUv - 0.5;
    // Wider than it is tall: the horizontal scan gives out first.
    sUv = 0.5 + c * (1.0 - vec2(0.13, 0.09) * sag);
  }

  /* Phase. One wandering value drives all of it, so the guns, the line start
     and the raster all drift together the way they would on a set whose
     timebase is the thing at fault.

     The swing goes negative, which is the important part: at the crossover the
     red and blue guns trade sides, so the fringe on an edge flips from warm to
     cool. A convergence error that only ever grows and shrinks reads as a
     focus problem; one that changes sign reads as timing. */
  float phase = 0.0;
  float shiftPx = uShift;
  if (uPhase > 0.0) {
    phase = wander(uTime, 0.31, 0.83, 1.97);
    shiftPx += phase * 9.0 * uPhase;
    // Horizontal phase: where the line starts, sliding and never settling.
    sUv.x += phase * 0.035 * uPhase;
  }

  vec2 cs = coverScale();
  // sUv stays the glass; pUv is the picture sliding about behind it.
  vec2 uv = cover(wobble(sUv), cs);

  vec3 src = converge(uv, cs, shiftPx);
  vec3 bl = bloom(uv, cs);

  /* Backdrop out, noise in — before the raster, so the beam and the bloom run
     across the new ground exactly as they run across the picture. Composited
     here rather than behind the canvas for that reason: a ground laid under
     the tube would be the one thing on screen the tube was not affecting. */
  if (uKey > 0.0) {
    float keep = subject(src, bl);
    vec2 np = gl_FragCoord.xy * 0.35;
    float grain = vnoise(np + floor(uTime * 12.0) * 13.0) * 0.55 +
                  vnoise(np * 0.25 - floor(uTime * 12.0) * 7.0) * 0.45;
    // Dark, and a touch cooler than the picture, so it reads as the inside of
    // a tube with nothing on it rather than as a grey card.
    vec3 ground = toLinear(vec3(0.055, 0.06, 0.07) + grain * 0.075);
    src = mix(ground, src, keep);
    bl = mix(ground, bl, keep);
  }

  // The beam. Width tracks brightness, which is the whole point: a bright
  // line spills over its gap, a dark one does not.
  // sUv, not uv: the raster is a property of the tube, so its line count is
  // fixed by the glass. Run it on the cropped coordinate and the number of
  // scanlines would change as the column resizes.
  float b = clamp(luma(src + bl * uBloom), 0.0, 1.0);
  /* The raster beating against the picture. The scanlines belong to the glass
     and do not move, but the picture's timing drifts underneath them, so the
     lines appear to crawl through it. Slow on purpose — fast enough to notice
     and too slow to watch. */
  float d = abs(fract(sUv.y * uLines + phase * 2.4 * uPhase + uTime * 0.35 * uPhase) - 0.5) * 2.0;
  float beam = exp(-pow(d / mix(0.42, 1.15, b), 2.0) * 1.9);

  vec3 col = src * beam + bl * uBloom;

  // The mask eats light, so some goes back or the screen just reads as dim.
  col *= grille(gl_FragCoord.x);
  col *= mix(1.0, 1.5, uMask);

  /* What a set that is working still does.

     A brief dip, a few times a minute, gone before it can be looked at
     directly. A bright bar drifting through, rarer still. And a shimmer under
     both, small enough that it registers as the picture being alive rather
     than as anything happening to it.

     All three ride on uTime, which every instance has already offset by its
     own random amount — so four tiles side by side never do this together. */
  if (uLife > 0.0) {
    /* A flicker is a couple of frames, not a fade — anything long enough to
       watch stops being a flicker and becomes a dip. Two chances per window
       rather than one, so it sometimes stutters twice and never arrives on a
       count you can predict. */
    float w = floor(uTime * 0.9);
    float t = fract(uTime * 0.9);
    float f1 = step(0.88, hash(w * 3.7)) * step(t, 0.045);
    float f2 = step(0.94, hash(w * 8.3)) * step(abs(t - 0.14), 0.03);
    col *= 1.0 - min(f1 + f2, 1.0) * (0.10 + hash(w * 9.1) * 0.14) * uLife;

    /* Beam current, which is never perfectly steady. Two rates, because one
       sine is a pulse and the eye finds a pulse. */
    col *= 1.0 + (sin(uTime * 9.7) * 0.006 + sin(uTime * 23.3) * 0.003) * uLife;
  }

  // One soft band drifting down, slowly enough to be caught not watched.
  // Deeper on a set that is not holding.
  float hum = fract(sUv.y * 0.5 - uTime * 0.055);
  col *= 1.0 - (0.055 + 0.10 * uNoise) * smoothstep(0.0, 0.09, hum) * (1.0 - smoothstep(0.09, 0.24, hum));

  // Beam current wandering: the whole picture breathes, stepped so it flickers
  // rather than pulses.
  col *= 1.0 + (hash(floor(uTime * 17.0)) - 0.5) * 0.30 * uNoise;

  // Dimmer exactly as it swells — the other half of the sag.
  col *= 1.0 - 0.42 * sag;


  /* Dropout. The signal goes and static comes back in its place, in bursts
     with a long quiet between them. The snow is per device pixel and reseeded
     every frame, which is what stops it crawling like a texture. */
  if (uSnow > 0.0) {
    float burst = smoothstep(0.72, 0.95, hash(floor(uTime * 1.9)) * 0.6 +
                                          hash(floor(uTime * 5.3) + 31.0) * 0.4);

    /* And now and then the signal goes altogether — no picture, only snow,
       for a moment. Rare and short on purpose: an occasional total loss stops
       being occasional the second it is on a timer you can feel. */
    float win = floor(uTime * 0.45);
    float total = step(0.88, hash(win * 9.7)) *
                  step(fract(uTime * 0.45), mix(0.06, 0.22, hash(win * 2.9)));

    float lost = max(burst, total) * uSnow;
    float grain = hash2(gl_FragCoord.xy + floor(uTime * 30.0) * vec2(41.0, 17.0));
    // A band of it rather than the whole frame, most of the time.
    float bandY = smoothstep(0.0, 0.12, abs(fract(sUv.y * 1.3 - uTime * 0.6) - 0.5));
    // A band of it normally; the whole frame when the signal has gone.
    float reach = max(mix(0.35, 1.0, 1.0 - bandY), total);
    col = mix(col, vec3(grain) * 0.75, lost * reach);
  }

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
  instability = 0,
  life = 0,
  roll,
  tear,
  sag,
  snow,
  phase,
  keyStrength = 0,
  keyBand = [0.08, 0.34],
  frames,
  frameMs = 1500,
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
  /**
   * How badly the set is holding, 0 to 1. Zero is a tube in good order, which
   * is every other screen on this site. Past about 0.5 the vertical hold
   * starts letting go and the picture rolls.
   */
  instability?: number
  /**
   * A working set's own restlessness, 0 to 1 — an occasional flicker and a
   * shallow ripple in the beam, and nothing else. Not a fault: it is what a
   * tube in good order does while it sits there displaying a still, which is
   * why it is separate from `instability`.
   */
  life?: number
  /**
   * The individual faults, each 0 to 1. Left unset, roll and tear follow
   * `instability` so it keeps working as a single knob; sag and snow are off
   * unless asked for, because they are the two that stop a picture being
   * readable.
   *
   *   roll  vertical sync — the frame drifts, and now and then runs
   *   tear  horizontal sync — blocks of lines shoved sideways
   *   sag   the supply giving out — the raster swells as the beam weakens
   *   snow  dropout — the signal goes and static arrives
   *   phase the timebase drifting — the guns swing apart and cross over, the
   *         line start slides, and the raster crawls through the picture
   */
  roll?: number
  tear?: number
  sag?: number
  snow?: number
  phase?: number
  /**
   * Key the backdrop out and put noise behind, 0 to 1. For studio portraits
   * where the ground is a smooth gradient and the subject is both darker and
   * lighter than it.
   */
  keyStrength?: number
  /** The luminance band the backdrop occupies, measured off the files. */
  keyBand?: [number, number]
  /**
   * Extra stills to run as a boomerang: 1 → 2 → 3 → 2 → 1. `frameMs` is the
   * middle of the hold rather than the hold itself — each one is drawn from a
   * spread either side of it, so the sequence never settles into a rhythm.
   * When given, these replace `src` as the picture; `src` stays the poster,
   * which is what ships in the HTML and what shows if WebGL never comes up.
   */
  frames?: string[]
  frameMs?: number
}) {
  const host = useRef<HTMLSpanElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const img = useRef<HTMLImageElement>(null)
  const extra = useRef<(HTMLImageElement | null)[]>([])
  const glowImg = useRef<HTMLImageElement>(null)
  const [on, setOn] = useState(false)

  /* The poster first, then the rest. One list means the loop does not have to
     care whether it is running one picture or four. */
  const shots = frames?.length ? [src, ...frames] : [src]
  /* Ping-pong, precomputed: for three shots this is 0,1,2,1 — four holds, and
     the two ends are not held twice as long as the middle. */
  const order =
    shots.length < 2
      ? [0]
      : [...shots.keys(), ...[...shots.keys()].slice(1, -1).reverse()]
  const shotKey = shots.join('|')

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

    // NEAREST for pixel art. LINEAR is right for a photograph and ruinous for
    // a drawing whose whole subject is that it has visible pixels — it would
    // smooth every block edge into a gradient.
    const filter = pixelated ? gl.NEAREST : gl.LINEAR
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)

    /* One texture per still. They are uploaded once each, as they decode, and
       from then on a frame change is a bind — no pixels move. */
    const texes = shots.map(() => {
      const t = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, t)
      // Non-power-of-two, so clamp and no mipmaps or it samples black.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
      return t
    })
    const dims: ([number, number] | null)[] = shots.map(() => null)

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
      noise: gl.getUniformLocation(prog, 'uNoise'),
      roll: gl.getUniformLocation(prog, 'uRoll'),
      tear: gl.getUniformLocation(prog, 'uTear'),
      sag: gl.getUniformLocation(prog, 'uSag'),
      snow: gl.getUniformLocation(prog, 'uSnow'),
      phase: gl.getUniformLocation(prog, 'uPhase'),
      life: gl.getUniformLocation(prog, 'uLife'),
      key: gl.getUniformLocation(prog, 'uKey'),
      keyBand: gl.getUniformLocation(prog, 'uKeyBand'),
    }
    // The texture is uploaded flipped, so v = 1 is the top of the picture and
    // a CSS-style focus measured from the top has to be turned over.
    gl.uniform2f(u.focus, focusX, 1 - focusY)
    gl.uniform1f(u.lines, lines)
    gl.uniform1f(u.warp, warp)
    gl.uniform1f(u.mask, mask)
    gl.uniform1f(u.bloom, bloomAmount)
    gl.uniform1f(u.shift, shift)
    gl.uniform1f(u.noise, instability)
    // Unset faults fall back to the master, so instability on its own still
    // behaves the way it did before any of these existed.
    gl.uniform1f(u.roll, roll ?? instability)
    gl.uniform1f(u.tear, tear ?? instability)
    gl.uniform1f(u.sag, sag ?? 0)
    gl.uniform1f(u.snow, snow ?? 0)
    gl.uniform1f(u.phase, phase ?? 0)
    gl.uniform1f(u.life, life)
    gl.uniform1f(u.key, keyStrength)
    gl.uniform2f(u.keyBand, keyBand[0], keyBand[1])

    let ready = false
    let frame = 0
    const t0 = performance.now()
    /* Minutes, not seconds, and drawn once per instance. Small enough to stay
       well inside float precision for as long as anyone will keep the page
       open, large enough that two tubes booted in the same frame have nothing
       in common. */
    const offset = Math.random() * 420
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

    /* Which still the clock is on, and the last one actually bound — the
       texture and its proportion only change on a step, not on every frame. */
    let shown = -1

    /* Where the boomerang is, and when it moves next.

       Not floor(elapsed / frameMs): a fixed division makes every hold exactly
       as long as every other one, and three stills on a metronome read as a
       slideshow. Each hold is drawn from a spread either side of frameMs
       instead, so the head rests on one angle and hurries past the next, and
       the loop never announces its own period. */
    let at = 0
    let until = -1
    const hold = () => frameMs * (0.6 + Math.random() * 0.95)

    const pick = (now: number) => {
      if (order.length < 2) return 0
      if (until < 0) until = now + hold()
      else if (now >= until) {
        at = (at + 1) % order.length
        until = now + hold()
      }
      const step = order[at]
      // Hold on the last decoded still rather than flashing a blank texture at
      // one that has not arrived yet.
      return dims[step] ? step : shown < 0 ? 0 : shown
    }

    const draw = (now: number) => {
      if (!ready) return
      size()

      const next = pick(now)
      if (next !== shown) {
        shown = next
        gl.bindTexture(gl.TEXTURE_2D, texes[next])
        const d = dims[next]
        if (d) gl.uniform2f(u.texSize, d[0], d[1])
        // The glow is a blurred copy of the picture, so it has to follow it.
        // Every still is already decoded by this point, so this is a swap of
        // an already-cached image, not a fetch.
        if (glowImg.current) glowImg.current.src = shots[next]
      }

      // Offset per instance, so no two tubes are ever on the same beat.
      gl.uniform1f(u.time, (now - t0) / 1000 + offset)
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

    const upload = (i: number, el: HTMLImageElement) => {
      gl.bindTexture(gl.TEXTURE_2D, texes[i])
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, el)
      // Cover needs the picture's own proportion, which only exists once it
      // has actually decoded.
      dims[i] = [el.naturalWidth, el.naturalHeight]
      // Whatever is bound now is stale, so make the next draw rebind.
      shown = -1
      // The first still is enough to start: the rest join as they arrive
      // rather than holding the tube dark until all of them have.
      if (i === 0) {
        gl.uniform2f(u.texSize, el.naturalWidth, el.naturalHeight)
        ready = true
        setOn(true)
        start()
      }
    }

    const load = (i: number, el: HTMLImageElement) =>
      el.decode().then(
        () => upload(i, el),
        () => {
          // decode() rejects on some cached-image paths; complete is enough.
          if (el.complete && el.naturalWidth) upload(i, el)
        },
      )

    const watch = (i: number, el: HTMLImageElement | null) => {
      if (!el) return
      if (el.complete && el.naturalWidth) load(i, el)
      else el.addEventListener('load', () => load(i, el), { once: true })
    }

    watch(0, im)
    shots.slice(1).forEach((_, i) => watch(i + 1, extra.current[i]))

    resume = start
    pause = stop

    return () => {
      stop()
      texes.forEach((t) => gl.deleteTexture(t))
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
  // key, not frames: a fresh array literal on every render would rebuild
  // the whole tube on every render.
  }, [
    shotKey,
    lines,
    warp,
    mask,
    bloomAmount,
    shift,
    instability,
    life,
    roll,
    tear,
    sag,
    snow,
    phase,
    keyStrength,
    keyBand[0],
    keyBand[1],
    frameMs,
    focusX,
    focusY,
    pixelated,
  ])

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
      {glow && <img ref={glowImg} src={src} alt="" aria-hidden="true" className="crt-glow" />}
      <img
        ref={img}
        src={src}
        alt={alt}
        data-pixelated={pixelated ? '' : undefined}
        className={`crt-src ${imgClassName}`}
      />
      {/* The other stills, in the markup so the browser fetches and decodes
          them the ordinary way. Hidden rather than absent: an <img> that is
          never laid out still loads, and this keeps them out of the fallback
          — if WebGL never starts, the poster above is the picture.

          The src is withheld until the tube is actually running, and that is
          the whole of the page's weight problem. Measured on the production
          build, this page was 2.45MB and 2.20MB of it was three portraits,
          every one of them requested inside the same millisecond — for a loop
          whose second still is not wanted for nearly two seconds. Setting the
          attribute later is what starts the fetch.

          Nothing downstream needs to know: `watch` already listens for load on
          any still that is not complete, which is what an <img> with no src
          is, and `pick` already holds the last decoded still rather than
          binding a texture that has not arrived. */}
      {shots.slice(1).map((u, i) => (
        <img
          key={u}
          ref={(el) => {
            extra.current[i] = el
          }}
          src={on ? u : undefined}
          alt=""
          aria-hidden="true"
          className="crt-frame"
        />
      ))}
      <canvas ref={canvas} className="crt-canvas" aria-hidden="true" />
    </span>
  )
}
