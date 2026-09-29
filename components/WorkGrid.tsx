import { shownCaseStudies } from '@/lib/case-studies'
import { Settle } from '@/components/Settle'
import { WorkTile } from '@/components/WorkTile'

/**
 * The work, two abreast, under its own name.
 *
 * It is the second half of the one page rather than a route of its own. With
 * no rail to move between sections there is nothing to navigate to: the About
 * page is four lines long, and the work is simply what is under it.
 */
export function WorkGrid() {
  return (
    <section className="work" aria-label="Selected work" id="work">
      <Settle mass="light">
        <div className="work-head">
          <p className="work-slug">//selected work//</p>
          {/* The count is the other end of the slug's line, so it is set in the
              slug's hand rather than as a label: same face, size, tracking and
              20% ink, and no uppercasing. Two things on one rule, saying the
              same kind of thing. */}
          <span className="work-count">{String(shownCaseStudies.length).padStart(2, '0')} items</span>
        </div>
      </Settle>

      {/* Rows are given more room than columns: a caption sitting under one
          picture must not crowd the picture below it, where two side by side
          only need telling apart. */}
      <div className="work-tiles">
        {shownCaseStudies.map((study, index) => (
          <Settle key={study.slug} mass="medium" delay={index * 80}>
            <WorkTile study={study} />
          </Settle>
        ))}
      </div>
    </section>
  )
}
