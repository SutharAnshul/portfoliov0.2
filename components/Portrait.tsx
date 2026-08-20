/**
 * The portrait. A photograph, and nothing else.
 *
 * This replaced a canvas that developed the image under the cursor like a
 * print coming up in a tray. It was accurate to the process and it did not
 * earn its place: it put a puzzle in front of the one thing on the page that
 * should land instantly, and the picture spent most of its life half-there.
 *
 * No corner marks either. Those are the site's selection mark, and they belong
 * on the case-study frames where a screen is one of a numbered set. A single
 * portrait is not a specimen, and bracketing it only fences it in.
 */
export function Portrait() {
  return (
    <figure className="plate">
      <img
        src="/images/anshul-portrait.jpeg"
        alt="Anshul Suthar, product designer"
        width={1520}
        height={1520}
        // Above the fold on the page it opens: fetch it early and decode it
        // in line, so it paints with everything else rather than after.
        fetchPriority="high"
        decoding="sync"
        className="portrait-photo"
      />
    </figure>
  )
}
