import { Settle } from '@/components/Settle'
import { WorkIndex } from '@/components/WorkIndex'

/**
 * Work index. Each item is a media well plus a tabular caption row — title and
 * type ranged left, description in the middle, year hard right in tabular
 * figures so the years form a clean column down the page.
 *
 * The list itself lives in WorkIndex, because the phone shows it under the
 * About page rather than as a place you navigate to. This route is what a
 * desktop rail links to and what a direct link lands on.
 */
export default function WorkPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div style={{ padding: 'var(--s6) var(--s6) var(--s8)' }}>
        <WorkIndex />

        <Settle mass="light">
          <div style={{ marginTop: 'var(--s8)' }}>
            <hr className="rule" />
            <div
              className="flex items-baseline justify-between"
              style={{ paddingTop: 'var(--s3)' }}
            >
              <span className="t-label">End of selected work</span>
            </div>
          </div>
        </Settle>
      </div>
    </div>
  )
}
