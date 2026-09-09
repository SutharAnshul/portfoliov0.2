import { Settle } from '@/components/Settle'
import { CrtScreen } from '@/components/CrtScreen'
import { LogoMark } from '@/components/LogoMark'
import { LocalTime } from '@/components/LocalTime'
import { PixelIcon } from '@/components/PixelIcon'

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
    <div className={`entry${apart ? ' record-apart' : ''}`}>
      {/* The same right angle the corner marks are cut from, drawn rather than
          typed: a glyph would depend on the monospace having it, and this one
          scales with the row and takes its colour from the text. */}
      <span className="entry-mark" aria-hidden="true" />
      <div className="entry-body">
        <div className="t-meta">{period}</div>
        {/* Class, not an inline style: an inline line-height outranks the token
            the tuner drives, so this list was the one place on the page where
            the leading slider appeared to do nothing. */}
        <div className="t-body record-line" data-mark={mark ? 'true' : undefined}>
          {mark && (
            <LogoMark src="/images/iitg.png" alt="Indian Institute of Technology Guwahati" />
          )}
          {detail}
        </div>
      </div>
    </div>
  )
}

/** The four ways to reach him, in the sidebar's order and with its marks. */
const CONTACT = [
  { href: 'mailto:s.anshul@iitg.ac.in', label: 'Email', icon: 'mail' },
  { href: 'tel:+916376542708', label: 'Phone', icon: 'phone' },
  { href: 'https://linkedin.com/in/sutharanshul', label: 'LinkedIn', icon: 'linkedin' },
  { href: 'https://behance.net/anshulsuthar', label: 'Behance', icon: 'behance' },
] as const

/**
 * A titled panel.
 *
 * The bar across the top is the only new furniture on the page, and it earns
 * its place by naming two things that used to be unlabelled and adjacent: a
 * list of dates and a list of details read as one undifferentiated block of
 * small type. `experience.log` and `profile.status` are set as filenames
 * rather than as headings — a heading would be the page talking, and this is
 * the page's chrome talking, which is a quieter register and the one the rest
 * of the site already uses for breadcrumbs and meta.
 */
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel">
      <div className="panel-bar">
        <span className="panel-title">{title}</span>
      </div>
      <div className="panel-body">{children}</div>
    </section>
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
            One drawn lockup — the portrait and the words "about Me!" set as a
            single piece of pixel art — with the statement alongside it.

            The heading lives inside the artwork rather than in markup, so the
            h1 below it carries the accessible name and the picture is left to
            be a picture. That is also why the quotation marks have gone: the
            lockup already announces what this page is, and a quotation mark
            over a title reading "about Me!" was two openings stacked. */}
        <div className="about-hero">
          <Settle boot mass="medium" className="about-lockup">
            {/* Pixel art, so the shader samples it NEAREST — LINEAR would
                interpolate every block edge into a gradient and undo the one
                thing the drawing is about.

                warp is 0 here, alone among the tubes on this site. The artwork
                runs to the top and bottom edges of its own file — the hair
                touches row 0 and the shoulder touches row 507 — and barrel
                curvature bows those edges inward and discards what falls
                outside, so any warp at all crops the head. Everything else the
                shader does is the part that matters here: the beam widening
                into the highlights, the grille, the bloom. */}
            <CrtScreen
              src="/images/about-me.png"
              alt="about Me! — Anshul Suthar, product designer"
              lines={150}
              warp={0}
              mask={0.5}
              bloomAmount={0.26}
              shift={1.6}
              pixelated
            />
          </Settle>

          <div className="hero-text">
            <Settle boot mass="medium" delay={80}>
              <h1 className="hero-greeting">Hey there! I am Anshul</h1>
            </Settle>

            <Settle boot mass="light" delay={130}>
              <p className="hero-statement">
                I’m interested in how people, products, and systems fit together. I like getting
                close to a problem, understanding what’s actually happening, and turning that into
                clear, useful experiences.
              </p>
            </Settle>
          </div>
        </div>
        {/* ── One band: the record and the address ───────────────────
            Two panels on one line, under the opening. The face used to be the
            middle one; it has gone up beside the statement, which leaves this
            band as the two things a reader goes looking for rather than the
            three things the page has.

            No heading on the record. Directly under the statement, dates
            against roles is already unmistakably a working history, and a
            label would only name what the reader has finished understanding.

            One list, not two, ordered newest first by start date. That puts
            the degree last because it began first, and it shows what two
            separate cards hid: 2021 — 2025 overlaps Jul 2023 and Apr 2024,
            so he was co-founding and working while finishing it. */}
        <Settle boot mass="light" delay={140}>
          <div className="about-band">
            <Panel title="experience.log">
              <div className="record">
                {RECORD.map((row) => (
                  <Entry key={row.detail} {...row} />
                ))}
              </div>
            </Panel>

            <Panel title="profile.status">
              <div className="fact-card">
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

                {/* The same marks as the sidebar, at the foot of the panel that
                    is already about how to reach him. Drawn from the same set
                    rather than a second, quieter one — a page with two
                    iconographies has neither. */}
                <div className="fact-links">
                  {CONTACT.map(({ href, label, icon }) => (
                    <a
                      key={label}
                      href={href}
                      target={href.startsWith('http') ? '_blank' : undefined}
                      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      data-sfx="tick"
                      aria-label={label}
                      title={label}
                    >
                      <PixelIcon name={icon} size={26} />
                    </a>
                  ))}
                </div>
              </div>
            </Panel>
          </div>
        </Settle>
      </div>
    </div>
  )
}
