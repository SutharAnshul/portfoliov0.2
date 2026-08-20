import { caseStudies } from './case-studies'

/**
 * What Mr. Toast knows.
 *
 * A model cannot be "trained on" a CV in any practical sense here — fine-tuning
 * is expensive, slow, and wrong for facts that change. What it needs is the
 * facts in front of it at the moment it answers, which is what this file is.
 *
 * The case studies are read from the same source the Work pages render, so a
 * project added there is answerable here without anyone remembering to update a
 * second copy. The biography is written out because it is the only place these
 * particular facts live.
 */

const BIO = `
Anshul Suthar is a product designer based in India.

He sees design as solving real problems and building systems that scale, and
works across product, UX, systems design, and industrial design — he has
designed and built an electric guitar. He believes the best outcomes come from
questioning, validating, and building with intent.

He has worked on B2B HR tech platforms, maternal health apps, and organic
beauty e-commerce brands.

EXPERIENCE
  May 2026 - Jul 2026    Product Designer, SuperHealth
  Sept 2024 - Feb 2026   Product Designer, CNVRT Labs
  Apr 2024 - Jul 2025    Growth Operator, Impact Acquisition
  Jul 2023 - present     Co-Founder & Creative Director, Herbal Mitra

EDUCATION
  2021 - 2025            B.Des., Indian Institute of Technology Guwahati

SKILLS
  User Research, Usability Testing, Journey Mapping, Design Systems,
  Visual Design, Industrial Design

TOOLS
  Figma, Adobe Suite, HTML/CSS, React.js, v0.app, Framer

PHILOSOPHY
  Kaizen — continuous improvement. There is always room to make something
  better, one improvement at a time.

OUTSIDE WORK
  Lead guitar and vocals for Octaves, the IIT Guwahati Music Society.
  Inter-IIT Cultural Meet 7.0, second overall.
  Photo walks around Bengaluru and Guwahati.

CONTACT
  Email     s.anshul@iitg.ac.in
  Phone     +91 63765 42708
  LinkedIn  linkedin.com/in/sutharanshul
  Behance   behance.net/anshulsuthar
`.trim()

function projects(): string {
  return caseStudies
    .map((s) => {
      const d = s.details
      return [
        `PROJECT: ${s.title} (${s.year}) — ${s.category}`,
        s.description,
        d?.challenge ? `Challenge: ${d.challenge}` : '',
        d?.solution ? `Solution: ${d.solution}` : '',
        d?.results?.length ? `Results: ${d.results.join('; ')}` : '',
        `Page: /work/${s.slug}`,
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n\n')
}

/** The whole dossier, assembled once per request. */
export function buildProfile(extra?: string): string {
  return [BIO, '', projects(), extra ? `\n\nPAGE CONTEXT\n${extra}` : ''].join('\n')
}
