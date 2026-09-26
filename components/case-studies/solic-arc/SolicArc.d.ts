/**
 * Types for the exported case study, declared beside it rather than in it.
 *
 * SolicArc.jsx takes one destructured props object and documents its four
 * fields as four JSDoc @param tags. TypeScript reads JSDoc in a .jsx file as
 * the signature, matches the first tag to the first (only) parameter, and so
 * decides the component takes a string — which makes every use of it an error.
 *
 * Declaring it here leaves the export untouched, which is the point: it is a
 * vendored artifact, and it should stay diffable against the next one.
 */
declare function SolicArc(props: {
  /** URL prefix for the images, with trailing slash. */
  imgBase?: string
  /** Where the top bar's way out points. */
  backHref?: string
  /** What that way out is called. */
  backLabel?: string
  /** Whether to jump to the top on mount. */
  resetScroll?: boolean
}): JSX.Element

export default SolicArc
