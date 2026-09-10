# The About page CRT

Context for the tube on the left of the About page: what it shows, how it
moves, and which effects are on. Written from the code as it stands — every
number below is the value actually passed or hard-coded, not an intention.

- **Component** — `components/CrtScreen.tsx` (the tube), used by
  `components/AboutStage.tsx` (the page).
- **Rendering** — one WebGL fragment shader on a full-screen triangle, one
  texture per still. No video, no image sequence on a timer swapping `src`.

---

## 1 · What it shows

Three photographs of the same person, cropped to the same framing:

| Role | File | Note |
|---|---|---|
| Poster | `/images/anshul-left.jpg` | Left profile. Ships in the HTML; also the fallback. |
| Frame | `/images/anshul-front.jpg` | Front. |
| Frame | `/images/anshul-right.jpg` | Right profile. |

They are ordered as a **head turning**, not as the camera took them: left →
front → right → front, and repeat. The order is a computed ping-pong
(`0,1,2,1`) so the two ends are not held twice as long as the middle.

The poster is the only one that reaches the browser as a normal `<img>`. The
other two are held in hidden 1px elements and **get no `src` until the tube is
actually running** — three portraits are ~2.2 MB and only one can be shown at
first paint. See `CrtScreen.tsx`'s note on the extra stills.

### Timing

- `frameMs` is **1800**, but no frame is held for exactly that. Each hold is
  `frameMs × (0.6 … 1.55)` → roughly **1.1–2.8 s**, drawn fresh each time.
- Every instance of the component starts its clock at a **random offset of up
  to 420 s**. Two tubes on one page therefore never do the same thing at the
  same moment. (Matters on the work index, where several run side by side.)
- A frame that has not decoded yet is skipped — the last decoded still is held
  rather than binding an empty texture.

---

## 2 · The glass — always on

These are properties of the tube itself and run whatever the signal is doing.

| Effect | Value | What it does |
|---|---|---|
| `lines` | 190 | Scanline count. Fixed to the **glass**, not the picture, so resizing the column does not change how many lines there are. |
| `warp` | 0.18 | Barrel curvature. Applied in screen space; past the curve nothing is painted, so the tube keeps its own silhouette against the page rather than sitting in a black box. |
| `mask` | 0.55 | Aperture grille — RGB stripes stepped on `gl_FragCoord`, so one stripe is one **physical** pixel at any device ratio. The mask eats light, so the shader puts some back (`×1.5` at full mask) or the screen just reads dim. |
| `bloomAmount` | 0.3 | Eight-tap radially symmetric bloom, summed in linear light. |
| `shift` | 2.2 | Convergence error in device pixels — the red and blue guns land slightly apart. |
| `focusY` | 0.36 | Where `cover` trims. The stills are taller than the frame; this puts the crop below the eyes. |
| — | — | **Beam**: line width tracks local brightness, so a bright line spills over its gap and a dark one does not. This is what stops the scanlines reading as a striped overlay. |

---

## 3 · The faults — what is on

The About tube is a **set that is failing and never recovers**. There is no
arc and no resolution: every fault below runs continuously, in bursts, forever.

| Prop | Value | What it does |
|---|---|---|
| `instability` | 0.9 | Master noise level. Drives the hum band's depth and the stepped beam-current flicker, and is the default for `roll`/`tear`. |
| `roll` | 0.55 | **Vertical hold.** Two halves: a constant slow drift, plus bursts where the hold lets go entirely and the frame runs. Each slip gets its own speed, direction and length. Wraps rather than clamps. |
| `tear` | 0.75 | **Horizontal sync.** Blocks of scanlines shoved sideways. The block count (14–42) and the boundaries both move — a fixed band count reads as a venetian blind. |
| `sag` | 0.45 | **HV / flyback.** The raster swells as the beam weakens, so the picture gets **bigger and dimmer at the same moment**, then snaps back. Wider than tall, because the horizontal scan gives out first. Brightness alone would read as a fade; tied to geometry it reads as a supply that cannot hold. |
| `snow` | 0.95 | **Dropout.** Static in bursts with long quiets. Usually a band; rarely — via a separate, slower window — the signal goes **altogether**, whole frame, for a fraction of a second. Snow is per device pixel and reseeded every frame so it does not crawl like a texture. |
| — | — | **Hum bar**: one soft band drifting down, deeper on an unstable set. |

### What is deliberately off

- **`phase` — not passed, so 0.** This was built and then removed on request:
  it drifts the timebase, which slides the guns, the line start and the raster
  together, and makes the picture lean. The "RGB error and slanting" version.
  Turning it on is one prop.
- **`life` — 0.** The opposite vocabulary: a tube in *good* order that flickers
  occasionally and does nothing else. That is what the work-index thumbnails
  use (`life={1}`). The two are mutually exclusive by intent — a set cannot be
  both failing and fine.

### Why nothing repeats

Two mechanisms, both worth preserving in any change:

1. **`wander(t, a, b, c)`** — three sines at rates with no common multiple. The
   pattern would have to run for hours to return to where it started.
2. **A unit-square hash**, not `fract(sin(n × k))`. The classic one loses
   precision as `uTime` grows, so the "randomness" visibly degrades after a few
   minutes on screen. This was a real bug, fixed.

---

## 4 · The backdrop key

The studio backdrop is removed **in the shader** and replaced with generated
noise, so the beam, the grille and the bloom run across the new ground exactly
as they run across the picture. Compositing a ground behind the canvas would
have left one thing on screen the tube was not affecting.

- `keyStrength` = 1, `keyBand` = `[0.08, 0.34]` (default).
- Two terms decide whether a pixel is subject:
  - **Luminance band** — the backdrop is neither darkest nor brightest. Shirt
    sits below it, skin above; what gets removed is the middle. (Measured on
    the actual files: shirt 2–6, backdrop 22–77, skin 90–255.)
  - **Local detail** — the backdrop is smooth and the subject is not. This is
    what saves hair: a mid-tone strand sits squarely inside the band and is
    kept anyway because it has contrast against its neighbours.
- The replacement ground is two octaves of value noise, dark and slightly
  cooler than the picture, so it reads as the inside of an unlit tube rather
  than a grey card.

---

## 5 · Behaviour and failure

- **Off screen it stops.** An `IntersectionObserver` pauses the render loop
  when the tube leaves the viewport.
- **`prefers-reduced-motion`** is read at startup.
- **No WebGL, or the context fails** → the poster `<img>` is the picture. The
  tube is an effect over content that is already there, never a replacement
  for it.
- The canvas is `aria-hidden`; the accessible name is the poster's `alt`
  ("Anshul Suthar").

---

## 6 · The exact call

From `components/AboutStage.tsx`:

```tsx
<CrtScreen
  src="/images/anshul-left.jpg"
  frames={['/images/anshul-front.jpg', '/images/anshul-right.jpg']}
  frameMs={1800}
  alt="Anshul Suthar"
  lines={190}
  warp={0.18}
  mask={0.55}
  bloomAmount={0.3}
  shift={2.2}
  focusY={0.36}
  instability={0.9}
  roll={0.55}
  tear={0.75}
  sag={0.45}
  snow={0.95}
  keyStrength={1}
/>
```

---

## 7 · If this changes

Things a future edit should know, because they were each learned the hard way:

- **The tube is failing, not switching.** Any idea framed as "changing
  channel" fights the current setting — you cannot change channel on a set
  that is breaking down. A damaged signal *picking up fragments* of something
  else is the framing that fits what is already there.
- **Order of operations matters.** Curvature is screen-space and happens
  first; sag is applied to the screen coordinate *before* the crop, because it
  is the scan going wrong rather than the picture changing; phase must modify
  `sUv.x` **before** `cover()` or the horizontal slide never reaches the
  picture. That last one was a bug.
- **Context budget.** Each tube holds one WebGL context and a browser allows
  roughly sixteen per page. The work index already runs several; anything that
  adds more should build on play and destroy on finish, the way
  `components/Interlace.tsx` does.
- **Frames are cheap, files are not.** Adding stills costs one texture each
  and no new context — but they are full-size JPEGs, and the page's weight is
  almost entirely these images. Anything added should be ~1200px and ~120KB.
