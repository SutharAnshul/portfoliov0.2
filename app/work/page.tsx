import Link from 'next/link'
import { caseStudies } from '@/lib/case-studies'
import { Settle } from '@/components/Settle'
import { FieldItem } from '@/components/FieldItem'
import { CornerMarks } from '@/components/CornerMarks'

/**
 * Work index. Each item is a media well plus a tabular caption row — title and
 * type ranged left, description in the middle, year hard right in tabular
 * figures so the years form a clean column down the page.
 */
export default function WorkPage() {
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

        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: 'var(--s5)', marginTop: 'var(--s5)' }}
        >
          {caseStudies.map((study, index) => (
            <Settle key={study.slug} boot mass="medium" delay={120 + index * 90}>
              <FieldItem maxShift={5} radiusRatio={1.35} mass={1.4}>
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
              </FieldItem>
            </Settle>
          ))}
        </div>

        {/* Not a case study: a live document, so it gets its own entry rather
            than being flattened into the same card shape. */}
        <Settle mass="medium" delay={80}>
          <FieldItem maxShift={4} radiusRatio={1.4} mass={1.2}>
            <Link href="/work/superhealth" data-sfx="tick" className="card-link relative block">
              <CornerMarks />
              <div style={{ marginTop: 0 }}>
                <div className="flex items-baseline justify-between" style={{ gap: 16 }}>
                  <span className="t-title">Superhealth — Design System</span>
                  <span className="t-meta">2026</span>
                </div>
                <p className="t-meta" style={{ marginTop: 6, lineHeight: 1.7 }}>
                  An interactive document read straight out of the Figma file — 18 colour styles,
                  30 type styles, 58 variables and 49 component sets, with the button matrix live.
                </p>
              </div>
            </Link>
          </FieldItem>
        </Settle>
        <Settle mass="light">
          <div style={{ marginTop: 'var(--s8)' }}>
            <hr className="rule" />
            <div
              className="flex items-baseline justify-between"
              style={{ paddingTop: 'var(--s3)' }}
            >
              <span className="t-label">End of selected work</span>
              <span className="t-label">↓ Continue</span>
            </div>
          </div>
        </Settle>
      </div>
    </div>
  )
}
