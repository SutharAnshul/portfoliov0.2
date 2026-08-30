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
  // `apart` opens the gap that separates study from work. No rule and no
  // heading: at this point in the list the shift from roles to a degree is
  // already legible, and space is enough to mark it.
  { period: '2021 — 2025', detail: 'B.Des. at IIT, Guwahati', mark: true, apart: true },
]

/**
 * One line of the record: the period, then what happened under it.
 *
 * An 18px institution mark on a 13px line overflows its line box and crowds
 * the date above, which the rows without one do not have to allow for — hence
 * the extra lead on that row only.
 */
function Entry({
  period,
  detail,
  mark,
  apart,
}: {
  period: string
  detail: string
  mark?: boolean
  apart?: boolean
}) {
  return (
    <div className={apart ? 'record-apart' : undefined}>
      <div className="t-meta">{period}</div>
      {/* Class, not an inline style: an inline line-height outranks the token
          the tuner drives, so this list was the one place on the page where
          the leading slider appeared to do nothing. */}
      <div className="t-body record-line" data-mark={mark ? 'true' : undefined}>
        ↳{' '}
        {mark && (
          <LogoMark src="/images/iitg.png" alt="Indian Institute of Technology Guwahati" />
        )}
        {detail}
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
      {/* A container, not just a wrapper: the band below has to respond to
          the width of this column rather than of the window. The sidebar and
          the chat panel both take space the viewport knows nothing about, so
          at 1500px of window there can be as little as 778px of column. */}
      <div className="about-page">
        {/* ── The opening ─────────────────────────────────────────────
            Set as a quotation: the marks open and close it, the greeting
            stands on its own line, and the statement follows underneath.
            The "About me" label is gone — a quotation that begins "Hey
            there! I am Anshul" does not need to be told what it is. */}
        <Settle boot mass="light">
          <div className="hero-quote" aria-hidden="true">
            &ldquo;
          </div>
        </Settle>

        <Settle boot mass="medium" delay={80}>
          <h1 className="hero-greeting">Hey there! I am Anshul</h1>
        </Settle>

        <Settle boot mass="light" delay={130}>
          <p className="hero-statement">
            I’m interested in how people, products, and systems fit together. I like getting close
            to a problem, understanding what’s actually happening, and turning that into clear,
            useful experiences.
          </p>
        </Settle>

        <Settle boot mass="light" delay={180}>
          <div className="hero-quote hero-quote-close" aria-hidden="true">
            &rdquo;
          </div>
        </Settle>
        {/* ── One band: the record, the face, the address ────────────
            Three panels on one line, in the order they are wanted: what he
            has done, who he is, how to reach him.

            No heading on the record. Directly under the statement, dates
            against roles is already unmistakably a working history, and a
            label would only name what the reader has finished understanding.

            One list, not two, ordered newest first by start date. That puts
            the degree last because it began first, and it shows what two
            separate cards hid: 2021 — 2025 overlaps Jul 2023 and Apr 2024,
            so he was co-founding and working while finishing it. */}
        <Settle boot mass="light" delay={140}>
          <div className="about-band">
            <section className="card record-card">
              <div className="record">
                {RECORD.map((row) => (
                  <Entry key={row.detail} {...row} />
                ))}
              </div>
            </section>

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
              </Fact>
              {/* Its own fact, not a footnote to the clock. Sitting two pixels
                  under the time it read as part of it — as though the hour
                  were somehow the reason he was available. */}
              <Fact label="Work status">
                <span className="status-pill">Open to work</span>
              </Fact>
            </div>
          </div>
        </Settle>
      </div>
    </div>
  )
}
