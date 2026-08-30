import { Settle } from '@/components/Settle'
import { LogoMark } from '@/components/LogoMark'
import { LocalTime } from '@/components/LocalTime'

/**
 * About.
 *
 * The opening follows the Gimaev reference: a small label, one large spoken
 * statement, and a row of three — the facts, a photograph, and how to reach
 * him. The statement does the introducing and the row answers the questions
 * someone would otherwise have to read a CV to answer.
 *
 * It is set in this site's own material rather than the reference's: the
 * statement is the monospace body face simply spoken louder, and the three
 * panels are the same `.card` every other surface here uses.
 *
 * Between the statement and the panels sits the record, unlabelled — the
 * reference has no equivalent for it, and it is the part a recruiter opens
 * the page for.
 *
 * Four things on the page, and no more. Every paragraph that only restated
 * what the record already proves has been cut.
 */

/**
 * Work and study in one list, newest first by start date.
 *
 * Kept as data rather than markup because the merge only works if the order
 * is derived from the dates — the degree sits last because it started first,
 * not because education conventionally goes at the bottom.
 */
const RECORD = [
  { period: 'May 2026 — Jul 2026', detail: 'Product Designer at SuperHealth' },
  { period: 'Sept 2024 — Feb 2026', detail: 'Product Designer at CNVRT Labs' },
  { period: 'Apr 2024 — Jul 2025', detail: 'Growth Operator at Impact Acquisition' },
  { period: 'Jul 2023 — Present', detail: 'Co-Founder & Creative Director at Herbal Mitra' },
  { period: '2021 — 2025', detail: 'B.Des. at IIT, Guwahati', mark: true },
]

/** One labelled fact inside the panel row. */
function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="t-label">{label}</div>
      <div className="fact-value">{children}</div>
    </div>
  )
}

export default function Page() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div style={{ padding: 'var(--s6) var(--s6) var(--s8)' }}>
        {/* ── The opening ───────────────────────────────────────────── */}
        <Settle boot mass="light">
          <div className="t-label">About me</div>
        </Settle>

        <Settle boot mass="medium" delay={80}>
          <p className="hero-statement">
            Hi, I am Anshul. I’m interested in how people, products, and systems fit together. I
            like getting close to a problem, understanding what’s actually happening, and turning
            that into clear, useful experiences.
          </p>
        </Settle>

        {/* ── The record ──────────────────────────────────────────────
            No heading. Directly under the statement, dates against roles is
            already unmistakably a working history — a label would only name
            what the reader has finished understanding.

            One list, not two, ordered newest first by start date. That puts
            the degree last because it began first, and it shows what two
            separate cards hid: 2021 — 2025 overlaps Jul 2023 and Apr 2024,
            so he was co-founding and working while finishing it. */}
        <Settle boot mass="light" delay={140}>
          <section className="card record-card">
            <div className="record">
              {RECORD.map((row) => (
                <div key={row.detail} className="record-row">
                  <div className="t-meta record-period">{row.period}</div>
                  <div className="t-body record-detail">
                    {row.mark && (
                      <LogoMark
                        src="/images/iitg.png"
                        alt="Indian Institute of Technology Guwahati"
                      />
                    )}
                    {row.detail}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Settle>

        {/* ── The face, and how to reach it ─────────────────────────
            The facts panel that stood here said Position, Currently and
            Degree — all three of which the record above now states with
            dates attached. What is left is the pair the record cannot
            carry. */}
        <Settle boot mass="light" delay={200}>
          <div className="fact-row">
            <figure className="card fact-photo">
              <img src="/images/anshul-portrait.jpeg" alt="Anshul Suthar, product designer" />
            </figure>

            <div className="card fact-card">
              <Fact label="Email">
                <a href="mailto:s.anshul@iitg.ac.in" data-sfx="tick" className="fact-mail">
                  s.anshul@iitg.ac.in
                </a>
              </Fact>
              <Fact label="Location">
                India, <LocalTime />
                <div className="t-meta" style={{ marginTop: 2 }}>
                  Open to product design roles
                </div>
              </Fact>
            </div>
          </div>
        </Settle>

      </div>
    </div>
  )
}
