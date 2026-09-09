'use client'

import Link from 'next/link'
import type { CaseStudy } from '@/lib/types'
import { CrtScreen } from '@/components/CrtScreen'
import { CornerMarks } from '@/components/CornerMarks'
import { setNavOrigin } from '@/lib/nav-origin'

/**
 * One project on the Work index.
 *
 * Marked like every other thing on the site you can choose, which the index
 * was oddly missing — it was the one list of destinations with no corner marks
 * on it at all.
 *
 * Hover switches the tile on, rather than showing the collapsed line the nav
 * shows. In the nav the bloom is reserved for the page you are on, and hover
 * is only a preview of it; here there is no page you are on, so hover is the
 * strongest thing a tile can say and gets the full switch-on. The rule holds
 * either way: the picture is open on the one thing that has your attention.
 *
 * It also records the door. Reaching a study from here means the reader is
 * still inside Work, and the left nav should say so instead of lighting the
 * project as though they had picked it from the list.
 */
export function WorkTile({ study }: { study: CaseStudy }) {
  return (
    <Link
      href={`/work/${study.slug}`}
      onClick={() => setNavOrigin('work')}
      data-sfx="tick"
      className="work-tile group"
    >
      {/* The marks bracket the picture, not the picture plus its caption. The
          well clips its own overflow, so they sit on a wrapper outside it. */}
      {study.thumbnail && (
        <div className="work-shot">
          <CornerMarks />
          <div className="well" style={{ aspectRatio: '4 / 3' }}>
            {/* A set in good order, but not a still: an occasional dip, a bar
                drifting through now and then, and a shimmer under both. Each
                tile offsets its own clock, so four of them side by side never
                do any of it at the same moment. */}
            <CrtScreen
              src={study.thumbnail}
              alt={study.title}
              life={1}
              className="transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        </div>
      )}

      {/* Title, discipline and year. The description that used to sit here is
          the same sentence the case study opens with, so on the index it was
          asking to be read twice and making every tile a different height. */}
      <div className="caption-row">
        <div className="min-w-0">
          <div className="t-title truncate">{study.title}</div>
          <div className="t-meta truncate">{study.category}</div>
        </div>
        <span className="t-meta">{study.year}</span>
      </div>
    </Link>
  )
}
