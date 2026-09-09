import { caseStudies } from '@/lib/case-studies'
import { Settle } from '@/components/Settle'
import { WorkTile } from '@/components/WorkTile'

/**
 * The list of case studies: a labelled rule, the tiles, and a closing rule.
 *
 * Lifted out of `/work` so the phone can put it under the About page without
 * the two drifting apart. On a phone there is no rail to move between sections
 * with, so About and Work are one scroll and this is its second half; on a
 * desktop it is still its own route, reached from the rail.
 *
 * `heading` is what differs between the two. Standing alone the page needs to
 * say what it is; arriving under the About page it is already following a
 * heading of its own, and a second "Selected work" label would be the page
 * introducing itself twice.
 */
export function WorkIndex({ heading = true }: { heading?: boolean }) {
  return (
    <>
      {heading && (
        <>
          <Settle boot mass="light">
            <div
              className="flex items-baseline justify-between"
              style={{ paddingBottom: 'var(--s3)' }}
            >
              <span className="t-label">Selected work</span>
              <span className="t-label">{String(caseStudies.length).padStart(2, '0')} items</span>
            </div>
          </Settle>
          <hr className="rule" />
        </>
      )}

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
    </>
  )
}
