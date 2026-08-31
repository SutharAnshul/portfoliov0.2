import Link from 'next/link'
import dynamic from 'next/dynamic'
import { caseStudies } from '@/lib/case-studies'
import { neighbours } from '@/lib/flow'
import { Settle } from '@/components/Settle'

/**
 * Four faces to try on this page, in development only.
 *
 * The import sits inside a branch that is statically false in production, not
 * behind a guard in the JSX: a `use client` component referenced from a server
 * component ships whether or not it renders, so the guard has to be where the
 * bundler can see it.
 */
const WorkFontSwitch =
  process.env.NODE_ENV === 'development'
    ? dynamic(() => import('@/components/WorkFontSwitch').then((m) => m.WorkFontSwitch))
    : null

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
      {/* data-work-root is what the font switch writes to, so the choice is
          confined to this page's own type. */}
      <div className="work-page" data-work-root style={{ padding: 'var(--s6) var(--s6) var(--s8)' }}>
        <Settle boot mass="light">
          <div className="flex items-baseline justify-between" style={{ paddingBottom: 'var(--s3)' }}>
            <span className="t-label">Selected work</span>
            <span className="t-label">{String(caseStudies.length).padStart(2, '0')} items</span>
          </div>
        </Settle>
        <hr className="rule" />

        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: 'var(--s5)', marginTop: 'var(--s5)' }}
        >
          {caseStudies.map((study, index) => (
            <Settle key={study.slug} boot mass="medium" delay={120 + index * 90}>
              <Link href={`/work/${study.slug}`} data-sfx="tick" className="group block">
                {study.thumbnail && (
                  <div className="well" style={{ aspectRatio: '4 / 3' }}>
                    <img
                      src={study.thumbnail}
                      alt={study.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                )}

                <div className="caption-row">
                  <div className="min-w-0">
                    <div className="t-title truncate">{study.title}</div>
                    <div className="t-meta truncate">{study.category}</div>
                  </div>
                  <p className="t-meta">{study.description}</p>
                  <span className="t-meta">{study.year}</span>
                </div>
              </Link>
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

      {WorkFontSwitch && <WorkFontSwitch />}
    </div>
  )
}
