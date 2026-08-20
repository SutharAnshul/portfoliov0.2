/**
 * Four corner crosses marking a bounding box.
 *
 * Started life as the screws on the transport faceplate; it is now the site's
 * single "this one is selected" signal, replacing border-weight changes that
 * were too quiet to read. Same crosshair vocabulary as the cursor.
 */
export function CornerMarks({ className = '' }: { className?: string }) {
  return (
    <span className={`marks ${className}`} aria-hidden="true">
      <i className="mark mark-tl" />
      <i className="mark mark-tr" />
      <i className="mark mark-bl" />
      <i className="mark mark-br" />
    </span>
  )
}
