/**
 * Four corner brackets marking a bounding box.
 *
 * Started life as the screws on the transport faceplate; it is now the site's
 * single "this one is selected" signal, replacing border-weight changes that
 * were too quiet to read.
 *
 * Each bracket is one quarter of the cross these used to be — a plus cut along
 * both its centre lines gives four right angles — turned so its corner points
 * at the corner it marks. Which is also the movement: hidden, the four gather
 * toward the middle where they would re-form that plus; selected, they
 * disperse to the corners. The geometry is in globals.css under .marks.
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
