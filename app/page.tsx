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
 * The record — experience, education, the rest — follows underneath. The
 * reference has no equivalent for it, and it is the part a recruiter opens
 * the page for.
 */

function Card({
  title,
  children,
  className = '',
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`card ${className}`}>
      {title && <h2 className="t-head">{title}</h2>}
      <div style={{ marginTop: title ? 'var(--s5)' : 0 }}>{children}</div>
    </section>
  )
}

function Entry({ period, detail }: { period: string; detail: React.ReactNode }) {
  return (
    <div>
      <div className="t-meta">{period}</div>
      <div className="t-body" style={{ lineHeight: 1.5 }}>
        ↳ {detail}
      </div>
    </div>
  )
}

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

        {/* ── The record ────────────────────────────────────────────── */}
        <div
          className="about-grid grid grid-cols-1 lg:grid-cols-2"
          style={{ gap: 'var(--s5)', marginTop: 'var(--s7)' }}
        >
          <div className="about-col stack">
            <Settle mass="light" delay={40} className="ord-experience">
              <Card title="Experience">
                <div className="stack">
                  <Entry period="May 2026 — Jul 2026" detail="Product Designer at SuperHealth" />
                  <Entry period="Sept 2024 — Feb 2026" detail="Product Designer at CNVRT Labs" />
                  <Entry period="Apr 2024 — Jul 2025" detail="Growth Operator at Impact Acquisition" />
                  <Entry
                    period="Jul 2023 — Present"
                    detail="Co-Founder & Creative Director at Herbal Mitra"
                  />
                </div>
              </Card>
            </Settle>

            <Settle mass="light" delay={60} className="ord-education">
              <Card title="Education">
                <div>
                  <div className="t-meta">2021 — 2025</div>
                  {/* Taller line and a little lead: an 18px mark on a 13px line
                      overflows its line box and crowds the date above. */}
                  <div className="t-body" style={{ lineHeight: 1.9, marginTop: 3 }}>
                    ↳{' '}
                    <LogoMark
                      src="/images/iitg.png"
                      alt="Indian Institute of Technology Guwahati"
                    />
                    B.Des. at IIT, Guwahati
                  </div>
                </div>
              </Card>
            </Settle>
          </div>

          <div className="about-col stack">
            <Settle mass="light" delay={80} className="ord-skills">
              <Card title="Skills & Tools">
                <div className="grid grid-cols-2" style={{ gap: 'var(--s5)' }}>
                  <div>
                    <div className="t-label" style={{ marginBottom: 'var(--s2)' }}>
                      Skills
                    </div>
                    <div className="t-body" style={{ lineHeight: 1.85 }}>
                      {[
                        'User Research',
                        'Usability Testing',
                        'Journey Mapping',
                        'Design Systems',
                        'Visual Design',
                        'Industrial Design',
                      ].map((s) => (
                        <div key={s}>+ {s}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="t-label" style={{ marginBottom: 'var(--s2)' }}>
                      Tools
                    </div>
                    <div className="t-body" style={{ lineHeight: 1.85 }}>
                      {['Figma', 'Adobe Suite', 'HTML/CSS', 'React.js', 'v0.app', 'Framer'].map(
                        (s) => (
                          <div key={s}>+ {s}</div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Settle>

            <Settle mass="light" delay={100} className="ord-philosophy">
              <Card title="Philosophy">
                <p className="t-body">
                  Kaizen — continuous improvement. There&apos;s always room to make something
                  better, one improvement at a time.
                </p>
              </Card>
            </Settle>

            <Settle mass="light" delay={120} className="ord-outside">
              <Card title="Outside Work">
                <div className="t-body" style={{ lineHeight: 1.9 }}>
                  <div>↳ Lead guitar &amp; vocals, Octaves — IITG Music Society</div>
                  <div>↳ Inter-IIT Cultural Meet 7.0, second overall</div>
                  <div>↳ Photo walks, Bengaluru &amp; Guwahati</div>
                </div>
              </Card>
            </Settle>
          </div>
        </div>
      </div>
    </div>
  )
}
