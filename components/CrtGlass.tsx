/**
 * The shape of the tube, and the warp of the glass.
 *
 * Two defs, rendered once near the root — a clip-path and a filter only need
 * to exist somewhere in the document to be referenced by id.
 *
 * ── The silhouette ──────────────────────────────────────────────────────
 *
 * A CRT face is not a rounded rectangle; it is the opposite. Its four edges
 * bow *outward* and its corners come to a point, which is why a border-radius
 * reads as a phone and this reads as a monitor. So the outline is cut rather
 * than softened: four quadratic curves, each bulging to the edge of the box at
 * its midpoint, meeting at corners pulled slightly in.
 *
 * `objectBoundingBox` units mean the path is written once in 0–1 and stretches
 * to whatever uses it, so one clip serves a 4:3 thumbnail and a 2:3 portrait
 * without either being told its own size. The corner inset is larger
 * vertically than horizontally on purpose: in these units a fixed number bows
 * by a share of each side's own length, so an equal pair curves the short side
 * visibly harder than the long one.
 *
 * ── The content ─────────────────────────────────────────────────────────
 *
 * Clipping alone gives a bowed outline around a flat picture, which is the
 * tell. The picture has to bulge too, and that is not reachable in CSS — so
 * the warp is a real displacement map, generated as a 128² PNG where each
 * pixel encodes how far to reach for its colour. The filter resolves
 *
 *     P'(x, y) = P( x + scale·(R − 0.5), y + scale·(G − 0.5) )
 *
 * and the map's offsets point inward and grow with r², so every pixel samples
 * from slightly nearer the centre than it sits: centre magnified, edges
 * compressed. A tube.
 *
 * sRGB is not optional here. The default is linearRGB, and these bytes are
 * numbers standing for offsets, not light — converted, 0.5 stops meaning "no
 * displacement" and the whole picture slides off its own centre.
 *
 * The filter runs before the clip, so the scanlines and the vignette warp with
 * the picture rather than sitting flat on top of a curved one.
 */
export function CrtGlass() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" className="sr-only">
      <defs>
        <clipPath id="crt-bulge" clipPathUnits="objectBoundingBox">
          <path
            d="M 0.030,0.042
               Q 0.500,0.000 0.970,0.042
               Q 1.000,0.500 0.970,0.958
               Q 0.500,1.000 0.030,0.958
               Q 0.000,0.500 0.030,0.042 Z"
          />
        </clipPath>

        <filter
          id="crt-warp"
          x="0"
          y="0"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          {/* Stretched to the element, which is what makes the warp elliptical
              on a screen that is not square — a 4:3 tube is not spherical. */}
          <feImage href="/images/crt-warp.png" preserveAspectRatio="none" result="map" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale="13"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}
