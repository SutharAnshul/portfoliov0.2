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
 * One record follows underneath, holding the work and the degree together.
 * The reference has no equivalent for it, and it is the part a recruiter
 * opens the page for.
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
            I’m interested in how people, products, and systems fit together. I like getting close
            to a problem, understanding what’s actually happening, and turning that into clear,
            useful experiences.
          </p>
        </Settle>

        <Settle boot mass="light" delay={140}>
          <div className="t-body stack hero-sub">
            <p>
              I’ve worked across B2B platforms, healthcare, e-commerce, and systems design, with
              experience spanning research, UX, interaction design, and design systems. I’ve also
              explored industrial design, which has shaped how I think about form, constraints, and
              how things come together.
            </p>
            <p>
              Outside work, I’m usually playing guitar, taking photographs, tinkering with
              something, or following some new curiosity down a rabbit hole.
            </p>
          </div>
        </Settle>

        {/* ── The three panels ──────────────────────────────────────── */}
        <Settle boot mass="light" delay={200}>
          <div className="fact-row">
            <div className="card fact-card">
              <div className="fact-pair">
                <Fact label="Position">Product Designer</Fact>
                <Fact label="Experience">3+ years</Fact>
              </div>
              <Fact label="Currently">Herbal Mitra — Co-Founder &amp; Creative Director</Fact>
              <Fact label="Degree">
                <LogoMark src="/images/iitg.png" alt="Indian Institute of Technology Guwahati" />
                B.Des., IIT Guwahati
              </Fact>
            </div>

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

        {/* ── The record ──────────────────────────────────────────────
            One list, not two. The degree ran alongside the first two roles,
            which two separate cards hid and a single reverse-chronological
            record shows: he was co-founding and working while finishing it.
            Ordered by start date, the degree lands last on its own. */}
        <Settle mass="light" delay={40}>
          <section className="card" style={{ marginTop: 'var(--s7)' }}>
            <h2 className="t-head">Experience &amp; Education</h2>
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
      </div>
    </div>
  )
}
