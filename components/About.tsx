import { ContactRow } from '@/components/ContactRow'

/**
 * Who he is: a record of where he has been, an offer, and a sentence.
 *
 * It sits in the right half of the page with the left half left alone. A
 * portrait used to hold that side and it has gone; what is there now is air,
 * which is the point — the page opens on almost nothing and gives you five
 * lines to read, and the emptiness is what makes those five lines the only
 * thing to look at.
 *
 * Nothing here answers the pointer. The record and the statement used to be
 * "pieces": hovering one lit its corner marks and dimmed the other. The marks
 * are for things you can choose — a thumbnail, a destination — and these are
 * neither. They are the page, and the page does not need to respond to being
 * looked at.
 */

/* The six entries, newest first by start date. The degree sits last because
   it began first, not because education conventionally goes at the bottom —
   and keeping all six is what shows the overlap a shorter list would hide.

   One shape for every span: three-letter month, four-digit year, both ends.
   Not the shortest way to write them — "May – Jul 2026" says the same thing
   in five fewer characters — but a column of dates is read by running down
   it, and a column where some rows carry a year on both sides and some carry
   it once has to be read a row at a time instead. The repetition is what
   makes it scannable. It also costs nothing here: every span now breaks after
   the dash into exactly two lines on a phone, where four of them did before
   and two did not.

   Sept is the odd one out of the twelve at four letters, so it is Sep. */
const RECORD = [
  { span: 'May 2026 – Jul 2026', org: 'SuperHealth', role: 'Product Design' },
  { span: 'Feb 2026 – Apr 2026', org: 'Bigfoot Guitars', role: 'Luthier' },
  { span: 'Sep 2024 – Feb 2026', org: 'CNVRT Labs', role: 'Product Design' },
  { span: 'Apr 2024 – Jul 2025', org: 'Impact Acquisition', role: 'Growth' },
  { span: 'Jul 2023', org: 'Herbal Mitra', role: 'Co-founder' },
  { span: 'Jul 2021 – Jul 2025', org: 'IIT Guwahati', role: 'B.Des.' },
]

export function About() {
  return (
    <section className="about" aria-label="About">
      {/* The page naming itself, in the margin. */}
      <p className="about-slug">//about me//</p>

      {/* The mark at the top of the window is the name, but its letters are
          cells and it is decoration to anything that reads aloud. The page
          still needs a heading that says whose it is. */}
      <h1 className="sr-only">Anshul Suthar, product designer, India</h1>

      <div className="about-col">
        <section className="about-record">
          <ol className="record">
            {RECORD.map((r) => (
              <li className="record-row" key={r.org}>
                <span className="record-span">{r.span}</span>
                <span className="record-org">{r.org}</span>
                <span className="record-role">{r.role}</span>
              </li>
            ))}
          </ol>
          <p className="piece-foot">Case file: 2019—2026</p>
        </section>

        {/* The one fact that is an offer rather than a description, so it takes
            the site's pink — the same pink that marks every other live thing
            here. The document stands at the other end of the same line: the
            person who has just read that he is open to work is the person who
            wants it, and it used to wait at the foot of the page past
            everything else. */}
        <p className="about-open">
          <span>Open to work</span>
          <a
            href="/Anshul_Suthar_CV.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="link-quiet about-cv"
          >
            Curriculum vitae →
          </a>
        </p>

        <section className="about-statement">
          <div className="statement-body">
            <p className="statement">
              I&rsquo;m interested in how people, products, and systems fit together. I like getting
              close to a problem, understanding what&rsquo;s actually happening, and{' '}
              <b>turning that into clear, useful experiences.</b>
            </p>
            <p className="piece-foot">Question until it makes sense</p>
          </div>

          {/* The four ways to reach him, standing at the right edge of the box
              the sentence is in — which is the line every role in the record
              above ends on. A column, because four icons laid across read as a
              toolbar; stood up they read as a list of four things, which is
              what they are. */}
          <ContactRow className="contact-rail" direction="down" />
        </section>
      </div>
    </section>
  )
}
