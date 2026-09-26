/**
 * The veil under the mark: four panes of glass, and a wash of the page's colour.
 *
 * The page scrolls up into a fade behind the name, and this is the fade. Four
 * layers of blur, deepening as their masks tighten in around the mark, so the
 * top of the page thins out rather than ending at a line — and over them a
 * gradient mixed from --background, so whatever colour a record has painted the
 * document is the colour it thins out to. Markup and no script: all of it is in
 * .site-veil in globals.css.
 *
 * ── What was here ───────────────────────────────────────────────────────
 *
 * Four hundred lines, and a WebGL canvas over the glass drawing the colour:
 * fractal noise warping the boundary so it could not read as a dome, a dither
 * so the ramp could not band, and a brightness/contrast pair written onto each
 * pane per act from script — kept alive by a context-loss handler, a
 * visibility listener, a ResizeObserver and a MutationObserver.
 *
 * It came out with the mark's halo and for the same reason: an element with a
 * filter, above this stack, inside a position: fixed container, is what WebKit
 * hands an opaque backing store, and that was the rectangle appearing behind
 * the name on iOS and iPadOS. The halo was the filter. The canvas was six
 * hundred lines and a compositing layer for a gradient the stylesheet was
 * already drawing underneath it as a fallback.
 *
 * The glass stayed. Nothing about backdrop-filter was the fault, and the
 * graduated falloff — four radii over four arcs — is the part worth having.
 *
 * ── What it costs ───────────────────────────────────────────────────────
 *
 * The warped boundary and the dither. The masks are plain arcs now, and the
 * widest is 150% across so it drops about a fifteenth of its depth from the
 * middle of the window to the corner — wide enough that there is no curve left
 * to read as a dome, which is what the noise was for. The banding the dither
 * was for has not appeared, because the ramp runs over a blur rather than over
 * a flat colour and the two gradients in the wash cross rather than fade in
 * step.
 *
 * And the per-act brightness/contrast, which let the glass behave as very
 * nearly a multiply on a dark act — black staying black, so a pane did nothing
 * where the page was already ink. Without it a white screen passing under the
 * mark on a dark act is dimmed by the wash rather than receding into it, which
 * is what every browser without WebGL has been seeing here all along.
 */
export function Veil() {
  return (
    <div className="site-veil" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
  )
}
