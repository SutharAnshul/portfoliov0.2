import type { Metadata } from 'next'
import SolicArc from '@/components/case-studies/solic-arc/SolicArc'
import { ACTS } from '@/components/case-studies/solic-arc/lib/acts'
import { CaseIndex } from '@/components/CaseIndex'
import { SolicTint } from '@/components/case-studies/solic-arc/SolicTint'

/**
 * Solic Arc, in the site's record layout.
 *
 * Unlike the other records this one is not assembled from case-studies.ts. It
 * arrived as a finished, scroll-driven editorial with its own compiled CSS —
 * every rule scoped under .solic, including a reset that neutralises this
 * site's element styles — and its own fixed chrome. So it is served as it was
 * made, and nothing here restyles it.
 *
 * What the site adds is the shape every record has: the index in the left
 * quarter, the work in the right three quarters. The case study is not
 * reflowed into that column, which would put it on a different set of its own
 * breakpoints and make it a different design. It is laid out at the full width
 * of the window and then painted at three quarters — see .solic-stage in
 * globals.css for why that is a zoom and what it costs.
 *
 * A static segment beside app/work/[slug], which takes precedence over the
 * dynamic one for this slug — the same arrangement Incentiwise already uses,
 * so the work tiles keep linking to /work/<slug> and nothing else changes.
 *
 * Every effect inside it reads the window's scroll position, so this route has
 * to scroll the document rather than a pane. It does: the shell stands aside
 * here (see BARE in components/Shell.tsx), nothing sets overflow, and the
 * Lenis wrapper in SmoothScroll drives native window scrolling, which the
 * export's README names as compatible.
 */

export const metadata: Metadata = {
  title: 'Solic Arc — Anshul Suthar',
  description:
    'An ergonomic electric guitar, designed and built — an instrument shaped to the player rather than to tradition.',
}

/* Taken from the case study's own act table, so the index cannot fall out of
   step with the page it indexes — the same rule the frame records follow. */
const LABELS = ACTS.map((a) => a.title)
const MARKS = ACTS.map((a) => a.n)

/* The brief said backHref="/work". There is no /work route on this site any
   more — the index stopped being a page of its own and became the second half
   of the front page, under WorkGrid's id="work" — so the link points there
   instead. "/work" would have been a 404 behind a button labelled All work. */
export default function SolicArcPage() {
  return (
    <div className="solic-record">
      <SolicTint />
      <CaseIndex labels={LABELS} marks={MARKS} selector="[data-act]" />
      <div className="solic-stage">
        <SolicArc backHref="/#work" />
      </div>
    </div>
  )
}
