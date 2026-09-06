import { caseStudies } from '@/lib/case-studies'
import { neighbours } from '@/lib/flow'
import { Settle } from '@/components/Settle'
import { WorkTile } from '@/components/WorkTile'

/**
 * Work index. Each item is a media well plus a tabular caption row — title and
 * type ranged left, description in the middle, year hard right in tabular
 * figures so the years form a clean column down the page.
 */
export default function WorkPage() {
  // The footer used to promise "↓ Continue" unconditionally. With Garage
  // unrouted there is nothing below this page, and an invitation to scroll on
  // to a place that no longer exists is worse than no invitation at all.
  const { next } = neighbours('/work')

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div style={{ padding: 'var(--s6) var(--s6) var(--s8)' }}>
        <Settle boot mass="light">
          <div className="flex items-baseline justify-between" style={{ paddingBottom: 'var(--s3)' }}>
            <span className="t-label">Selected work</span>
            <span className="t-label">{String(caseStudies.length).padStart(2, '0')} items</span>
          </div>
        </Settle>
        <hr className="rule" />

        {/* Rows are given more room than columns: a caption sitting under one
            picture must not crowd the picture below it, where two side by side
            only need telling apart. */}
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ columnGap: 'var(--s6)', rowGap: 'var(--s7)', marginTop: 'var(--s6)' }}
        >
          {caseStudies.map((study, index) => (
            <Settle key={study.slug} boot mass="medium" delay={120 + index * 90}>
              <WorkTile study={study} />
            </Settle>
          ))}
        </div>

        <Settle mass="light">
          <div style={{ marginTop: 'var(--s8)' }}>
            <hr className="rule" />
            <div
              className="flex items-baseline justify-between"
              style={{ paddingTop: 'var(--s3)' }}
            >
              <span className="t-label">End of selected work</span>
              {next && <span className="t-label">↓ Continue</span>}
            </div>
          </div>
        </Settle>
      </div>
    </div>
  )
}
