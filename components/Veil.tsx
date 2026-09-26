/**
 * The veil under the mark: one pane of glass, and a wash of the page's colour.
 *
 * The page scrolls up into a fade behind the name, and this is the fade. It is
 * two elements and no script: a blurred pane masked to a wide, shallow arc, and
 * over it a gradient mixed from --background, so whatever colour a record has
 * painted the document is the colour the top of the window thins out to. See
 * .site-veil in globals.css, which is where all of it lives now.
 *
 * ── What was here ───────────────────────────────────────────────────────
 *
 * Four hundred lines and six compositing layers: four stacked backdrop-filter
 * panes, each with its own blur radius, its own radial mask and a
 * brightness/contrast pair computed per act from script, and above them a WebGL
 * canvas drawing the colour — with fractal noise warping the boundary so it
 * could not read as a dome, and a dither so the ramp could not band. It also
 * carried a context-loss handler, a visibility listener, a ResizeObserver and a
 * MutationObserver to keep all of that alive.
 *
 * Every piece of it was answering a real objection, and the whole was still
 * wrong. It was the other half of the mark's rectangle on iOS and iPadOS: an
 * element with a filter, above a stack of backdrop-filters, inside a
 * position: fixed container, is the arrangement WebKit gives an opaque backing
 * store. The name's halo went first and the rectangle stayed, because the stack
 * under it was as much of the cause as the filter over it.
 *
 * ── What it costs ───────────────────────────────────────────────────────
 *
 * The warped boundary and the dither are gone. The mask is a plain arc, 150%
 * wide so it drops about a fifteenth of its depth from the middle of the window
 * to the corner — the same reason the four panes were that wide: at that width
 * there is no curve left to read as a dome. The banding the dither was for has
 * not appeared, because the ramp runs over a blur rather than over a flat
 * colour, and because the two gradients in the wash cross rather than fade in
 * step.
 *
 * Also gone is the per-act brightness/contrast, which let the glass behave as
 * very nearly a multiply on a dark act — black staying black, so the pane did
 * nothing where the page was already ink. Without it, a white screen passing
 * under the mark on a dark act is dimmed by the wash rather than receding into
 * it. That is what every browser without WebGL has been seeing here all along.
 */
export function Veil() {
  return (
    <div className="site-veil" aria-hidden="true">
      <span />
    </div>
  )
}
