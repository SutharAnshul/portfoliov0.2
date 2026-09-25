import Link from 'next/link'
import type { CaseStudy } from '@/lib/types'
import { CrtScreen } from '@/components/CrtScreen'
import { CornerMarks } from '@/components/CornerMarks'

/**
 * One project on the index.
 *
 * Marked like every other thing on the site you can choose. Hover switches the
 * tile fully on rather than showing the collapsed line: there is no page you
 * are on here, so hover is the strongest thing a tile can say, and the rule
 * holds either way — the picture is open on whatever has your attention.
 */
export function WorkTile({ study }: { study: CaseStudy }) {
  return (
    <Link href={`/work/${study.slug}`} className="work-tile group">
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
