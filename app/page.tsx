import { Portrait } from '@/components/Portrait'
import { Settle } from '@/components/Settle'
import { LogoMark } from '@/components/LogoMark'

/**
 * About. Two columns: the description and the print on the left, the factual
 * record on the right.
 *
 * Headings are plain section names now rather than spoken lines. The italic
 * serif still carries them, but as headings rather than as conversation.
 */

/**
 * One heading, one body, and space between them. The title is optional — the
 * opening description does not need a label to be understood.
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

export default function Page() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div style={{ padding: 'var(--s6) var(--s6) var(--s8)' }}>
        <div className="about-grid grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'var(--s5)' }}>
          {/* Left: the print, and the two cards that read as asides to it */}
          <div className="about-col stack">
            <Settle boot mass="heavy" className="ord-portrait">
              <Portrait />
            </Settle>

            <Settle mass="light" delay={60} className="ord-philosophy">
              <Card title="Philosophy">
                <p className="t-body">
                  Kaizen — continuous improvement. There&apos;s always room to make something
                  better, one improvement at a time.
                </p>
              </Card>
            </Settle>

            <Settle mass="light" delay={80} className="ord-outside">
              <Card title="Outside Work">
                <div className="t-body" style={{ lineHeight: 1.9 }}>
                  <div>↳ Lead guitar &amp; vocals, Octaves — IITG Music Society</div>
                  <div>↳ Inter-IIT Cultural Meet 7.0, second overall</div>
                  <div>↳ Photo walks, Bengaluru &amp; Guwahati</div>
                </div>
              </Card>
            </Settle>
          </div>

          {/* Right: description, then the record */}
          <div className="about-col stack">
            <Settle boot mass="light" delay={100} className="ord-about">
              <Card>
                <div className="t-body stack">
                  <p>
                    I see design as solving real problems and building systems that scale. I work
                    across product, UX, systems design, and even industrial design — I&apos;ve
                    designed and built an electric guitar. The best outcomes come from questioning,
                    validating, and building with intent.
                  </p>
                  <p>
                    I&apos;ve worked on B2B HR tech platforms, maternal health apps, and organic
                    beauty e-commerce brands. Every project taught me something about design,
                    business, and people.
                  </p>
                  <p>
                    In my free time you&apos;ll find me playing guitar, tinkering with new ideas, or
                    out on a photo walk exploring my neighbourhood.
                  </p>
                </div>
              </Card>
            </Settle>

            <Settle boot mass="light" delay={180} className="ord-experience">
              <Card title="Experience">
                <div className="stack">
                  <Entry period="May 2026 — Jul 2026" detail="Product Designer at SuperHealth" />
                  <Entry period="Sept 2024 — Feb 2026" detail="Product Designer at CNVRT Labs" />
                  <Entry period="Apr 2024 — Jul 2025" detail="Growth Operator at Impact Acquisition" />
                  <Entry
                    period="Jul 2023 — Present"
                    detail="Co-Founder & Creative Director at Herbal Mitra"
                  />

                  {/* Education closes the same record rather than repeating the
                      card structure beside it. */}
                  <div
                    style={{
                      marginTop: 'var(--s3)',
                      paddingTop: 'var(--s4)',
                      borderTop: '1px solid var(--card-line)',
                    }}
                  >
                    <div className="t-meta">2021 — 2025</div>
                    {/* Taller line and a little lead: an 18px mark on a 13px
                        line overflows its line box and crowds the date above,
                        which every other entry here does not have to allow for. */}
                    <div
                      className="t-body"
                      style={{ lineHeight: 1.9, marginTop: 3 }}
                    >
                      ↳{' '}
                      <LogoMark
                        src="/images/iitg.png"
                        alt="Indian Institute of Technology Guwahati"
                      />
                      B.Des. at IIT, Guwahati
                    </div>
                  </div>
                </div>
              </Card>
            </Settle>

            <Settle mass="light" delay={40} className="ord-skills">
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

          </div>
        </div>
      </div>
    </div>
  )
}
