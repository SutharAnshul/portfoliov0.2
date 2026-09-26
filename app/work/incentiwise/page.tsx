import fs from 'node:fs'
import path from 'node:path'
import Link from 'next/link'
import { shownCaseStudies } from '@/lib/case-studies'
import { CaseIndex } from '@/components/CaseIndex'
import { StoryBackground, type Theme } from '@/components/StoryBackground'
import { StoryFit } from '@/components/StoryFit'
import { Lightbox } from '@/components/Lightbox'
import './story.css'

/**
 * Incentiwise, as the long scroll it was designed as.
 *
 * The record for this one is not a sequence of frames in plates — it is a
 * built piece, ten acts long, exported from the file it was designed in. It is
 * served as it was made: its own markup, its own stylesheet scoped under
 * .story so none of it can reach the rest of the site, and its pictures
 * written out as files rather than carried inline, which is what turned a 7MB
 * document into an 88KB one that fetches what it reaches.
 *
 * What the site adds is the background. Each act is a colour, and rather than
 * painting it behind the content the sections are left transparent and the
 * page takes the colour instead — so the work appears to have no ground of its
 * own, and the site changes colour as it is read. See StoryBackground.
 *
 * The other records still use app/work/[slug]. This route takes precedence
 * over that one for this slug alone, which is how one record can be built like
 * this while the rest wait their turn.
 */

const SLUG = 'incentiwise'

/** Each act's colour, and the ink that stays readable on it. */
const THEMES: Record<string, Theme> = {
  ink: { bg: '#0C0C0B', ink: '#ECE8E0' },
  graphite: { bg: '#141517', ink: '#ECE8E0' },
  slackbg: { bg: '#0F1012', ink: '#E8E8E8' },
  cream: { bg: '#ECE8E0', ink: '#0C0C0B' },
  pale: { bg: '#E3ECF7', ink: '#0C0C0B' },
  mustard: { bg: '#F2B544', ink: '#0C0C0B' },
}

/**
 * The exported markup, with two things added at build time: which act each
 * section belongs to, so the background knows what colour to be, and a mark on
 * the section that opens each act, so the index in the margin has something to
 * count.
 */
function story() {
  const raw = fs.readFileSync(path.join(process.cwd(), 'app/work/incentiwise/story.html'), 'utf8')

  /* Walked in order, because nine of the fourteen sections open with the same
     string — looked up by text, every one of those found the first. */
  const opens = [...raw.matchAll(/<section\b([^>]*)>/gi)]
  const acts: string[] = []
  let out = ''
  let cursor = 0

  opens.forEach((open, i) => {
    const attrs = open[1]
    const start = open.index!
    const end = i + 1 < opens.length ? opens[i + 1].index! : raw.length
    const body = raw.slice(start, end)

    const cls = (attrs.match(/class="([^"]*)"/) || [])[1] || ''
    const theme = cls.split(/\s+/).find((c) => c && c !== 'page') || 'ink'

    /* An act begins where a section carries a heading of its own; a section
       without one is the same act continued, and shares its line. */
    const title = (body.match(/<div class="act">[\s\S]*?<\/i>([^<]*)<\/div>/i) || [])[1]
    let mark = ''
    if (title) {
      mark = ` data-frame="${acts.length}"`
      acts.push(title.trim())
    }

    out += raw.slice(cursor, start) + `<section${attrs} data-theme="${theme}"${mark}>`
    cursor = start + open[0].length
  })

  out += raw.slice(cursor)
  return { html: out, acts }
}

export default function IncentiwiseStory() {
  const { html, acts } = story()

  const index = shownCaseStudies.findIndex((cs) => cs.slug === SLUG)
  const next = index >= 0 ? shownCaseStudies[index + 1] ?? null : null

  return (
    <article className="case-story">
      <StoryBackground themes={THEMES} />
      <StoryFit />
      <CaseIndex labels={acts} />
      <Lightbox within=".story" />

      {/* The column is what the record is measured against and scaled into —
          see StoryFit. It has to be a box of its own: the record carries a
          zoom, so measuring the record itself would be measuring the answer. */}
      <div className="story-col">
        <div className="story" dangerouslySetInnerHTML={{ __html: html }} />

        <footer className="story-foot">
        <hr className="rule" />
        <div className="work-head" style={{ paddingTop: 'var(--s3)', paddingBottom: 0 }}>
          <span className="t-label">End of record</span>
          {next ? (
            <Link href={`/work/${next.slug}`} className="t-label">
              Next — {next.title} →
            </Link>
          ) : (
            <Link href="/#work" className="t-label">
              Back to work →
            </Link>
          )}
          </div>
        </footer>
      </div>
    </article>
  )
}
