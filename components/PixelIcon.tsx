import { GLYPH, PIXEL_ICONS } from '@/lib/pixel-icons'

/** The 13×13 tile: flat ground, a cell off each corner, the glyph inset by two. */
function tile(glyph: readonly string[]): string[] {
  const G = 'G'
  return [
    '.' + G.repeat(11) + '.',
    G.repeat(13),
    ...glyph.map((r) => G + G + r.replace(/\./g, G) + G + G),
    G.repeat(13),
    '.' + G.repeat(11) + '.',
  ]
}

/**
 * Draws a 13×13 grid as SVG rather than shipping ten PNGs.
 *
 * SVG because these have to stay crisp at whatever size a slot gives them and
 * on whatever pixel ratio the display has, and because at this size the markup
 * is smaller than the image would be. `crispEdges` is what keeps the cell
 * boundaries hard — without it the renderer antialiases every edge and the
 * whole point is lost.
 *
 * Runs of the same colour are merged along each row before drawing, which
 * takes a typical icon from 169 rects to about thirty. Worth doing when ten of
 * them sit in one sidebar.
 *
 * `size` should be a whole multiple of 13. It is not enforced — a slot can ask
 * for anything — but 26 is the size the set was drawn for.
 */
export function PixelIcon({
  name,
  size = 26,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  const icon = PIXEL_ICONS[name]
  if (!icon) return null

  const rects: React.ReactElement[] = []
  tile(icon.glyph).forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const ch = row[x]
      if (ch === '.') {
        x++
        continue
      }
      let run = 1
      while (x + run < row.length && row[x + run] === ch) run++
      rects.push(
        <rect
          key={`${y}-${x}`}
          x={x}
          y={y}
          width={run}
          height={1}
          fill={ch === 'W' ? GLYPH : icon.ground}
        />,
      )
      x += run
    }
  })

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 13 13"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {rects}
    </svg>
  )
}
