import { CaseStudy } from './types'

export const caseStudies: CaseStudy[] = [
  {
    slug: 'incentiwise',
    title: 'Incentiwise',
    description:
      'A rewards and recognition platform designed to make employee recognition more meaningful, measurable, and relevant to different workplace cultures.',
    category: 'Product Design',
    deck: 'A rewards and recognition platform, built to fit how each organisation actually recognises work.',
    status: 'Product design · 6 months',
    client: 'CNVRT Labs',
    role: ['Product Designer'],
    team: ['Founder', 'Product Manager', 'Product Designer', 'Developer'],
    surfaces: ['Web'],
    opening: [
      "Existing rewards and recognition platforms often treat recognition as a generic, one-size-fits-all system. Through competitor analysis, forum reviews, and stakeholder research, I found that the problem wasn't simply a lack of recognition tools — it was a lack of meaningful adaptation to how different organisations and employees actually recognise contributions.",
      'The project evolved from designing another recognition tool into building a system that could support different employee roles, recognition behaviours, organisational policies, budgets, and cultural contexts.',
    ],
    featured: true,
    thumbnail: '/images/incentiwise/thumbnail.png',
    year: 2024,
    details: {
      challenge:
        'Create an intuitive B2B rewards and recognition platform in a fast-paced, ambiguous 0-to-1 environment with unclear product requirements.',
      solution:
        'Led end-to-end UX design including market research, competitor analysis, user personas, product strategy definition, and interface design with scalable UI components.',
      results: [
        'MVP delivered and user-tested',
        'Streamlined design specifications for developer handoff',
        'Scalable component system built for future expansion',
      ],
    },
    sections: [
      { type: 'image', image: '/images/incentiwise/01-login.png', imageAlt: 'Incentiwise — Login and password reset' },
      { type: 'image', image: '/images/incentiwise/02-feed.png', imageAlt: 'Incentiwise — Activity feed' },
      { type: 'image', image: '/images/incentiwise/03-send-appreciation.png', imageAlt: 'Incentiwise — Sending an appreciation' },
      { type: 'image', image: '/images/incentiwise/04-rewards-overview.png', imageAlt: 'Incentiwise — Rewards overview' },
      { type: 'image', image: '/images/incentiwise/05-rewards-catalog.png', imageAlt: 'Incentiwise — Rewards catalog' },
      { type: 'image', image: '/images/incentiwise/06-reward-detail.png', imageAlt: 'Incentiwise — A single reward' },
      { type: 'image', image: '/images/incentiwise/07-badges.png', imageAlt: 'Incentiwise — Badges' },
      { type: 'image', image: '/images/incentiwise/08-badge-detail.png', imageAlt: 'Incentiwise — A single badge' },
      { type: 'image', image: '/images/incentiwise/09-transactions.png', imageAlt: 'Incentiwise — Reward transactions' },
      { type: 'image', image: '/images/incentiwise/10-transaction-detail.png', imageAlt: 'Incentiwise — A single transaction' },
      { type: 'image', image: '/images/incentiwise/11-people.png', imageAlt: 'Incentiwise — People' },
      { type: 'image', image: '/images/incentiwise/12-member-detail.png', imageAlt: 'Incentiwise — A member and their transactions' },
      { type: 'image', image: '/images/incentiwise/13-admins.png', imageAlt: 'Incentiwise — Admins and permissions' },
      { type: 'image', image: '/images/incentiwise/14-admins-edit.png', imageAlt: 'Incentiwise — Editing admin access' },
      { type: 'image', image: '/images/incentiwise/15-culture.png', imageAlt: 'Incentiwise — Culture and budget' },
      { type: 'image', image: '/images/incentiwise/16-settings.png', imageAlt: 'Incentiwise — Organisation settings' },
    ],
  },
  {
    slug: 'superhealth',
    title: 'Superhealth',
    description:
      'A design system for a healthcare product — colour, type, spacing and elevation, and the components built on top of them.',
    category: 'Design System',
    deck: 'The system a healthcare product is built from.',
    status: 'Design system · 2026',
    client: 'SuperHealth',
    role: ['Product Designer'],
    team: ['Product Designer', 'Developer'],
    surfaces: ['Web', 'Mobile'],
    opening: [
      'A product team moving quickly will invent a button every time it needs one. The work here was to make that unnecessary: a set of foundations — colour with documented contrast, a type scale, a nine-step spacing ladder and four elevations — and the components built on top of them, drawn once and specified for every state they can be in.',
      'The sheets that follow are the system as documented. Each component is drawn across its full matrix rather than in a single resting state, because the states are where a system either holds or falls apart: 49 component sets, 2,799 variants, and 2,370 instances placed from them across the product.',
    ],
    featured: true,
    thumbnail: '/images/superhealth/thumbnail.png',
    year: 2026,
    details: {
      challenge:
        'Give a fast-moving healthcare product one set of foundations and components, specified across every state, so the interface stops being reinvented screen by screen.',
      solution:
        'Built colour ramps with documented contrast, a type scale, a nine-step spacing ladder and an elevation set, then drew each component across its full variant matrix and bound its properties to variables.',
      results: [],
    },
    sections: [
      { type: 'image', image: '/images/superhealth/sheet-colours.png', imageAlt: 'Superhealth design system — Colour' },
      { type: 'image', image: '/images/superhealth/sheet-typography.png', imageAlt: 'Superhealth design system — Typography' },
      { type: 'image', image: '/images/superhealth/sheet-spacing-system.png', imageAlt: 'Superhealth design system — Spacing system' },
      { type: 'image', image: '/images/superhealth/sheet-shadow.png', imageAlt: 'Superhealth design system — Elevation' },
      { type: 'image', image: '/images/superhealth/sheet-button.png', imageAlt: 'Superhealth design system — Button' },
      { type: 'image', image: '/images/superhealth/sheet-text-input.png', imageAlt: 'Superhealth design system — Text input' },
      { type: 'image', image: '/images/superhealth/sheet-select-field.png', imageAlt: 'Superhealth design system — Select field' },
      { type: 'image', image: '/images/superhealth/sheet-otp-input-field.png', imageAlt: 'Superhealth design system — OTP input field' },
      { type: 'image', image: '/images/superhealth/sheet-phone-number-field.png', imageAlt: 'Superhealth design system — Phone number field' },
      { type: 'image', image: '/images/superhealth/sheet-logotype-and-mark.png', imageAlt: 'Superhealth design system — Logotype and mark' },
      { type: 'image', image: '/images/superhealth/sheet-website-components.png', imageAlt: 'Superhealth design system — Website components' },
    ],
  },
  {
    slug: 'aris',
    title: 'Aris',
    description:
      'A vendor rate submission flow for a construction materials marketplace, rebuilt as something a supplier would actually want to open.',
    category: 'Product Design',
    deck: 'The highest-value thing a vendor does, made to feel like it.',
    status: 'Product design · Working prototype',
    client: 'Aris',
    clientNote: 'Construction materials marketplace',
    role: ['Product Designer'],
    team: ['Solo project'],
    surfaces: ['Mobile'],
    opening: [
      'A construction materials marketplace raises RFQs to its vendor network — steel, cement, aggregates — and those vendors submit rates back. The existing flow was four mobile screens: the offer request, rate entry per line item, review with totals and GST, and a confirmation. It worked. That was all it did.',
      'Rate submission is the highest-value action a vendor takes on the platform, and the brief was to make the experience reflect that: restructure the screens, merge them, change the visual language, or keep the structure and layer motion over it — but ship the version you would actually want to use. The weight went on the small moments. Input states, the transitions between steps, what moves and why it feels good, and the submit moment itself, which is the one beat a vendor remembers.',
      'The deliverable is not a picture of a flow. It is the flow — running below, on this page. Open it and quote something. Under it sits the system it was built from: 70% neutral concrete and paper tones, charcoal for commitment, and yellow held back as a signal rather than spent as a background.',
    ],
    featured: true,
    thumbnail: '/images/aris/thumbnail.jpg',
    year: 2026,
    details: {
      challenge:
        'Redesign a functional but unremarkable four-screen vendor rate submission flow so that it feels like a consumer-grade app, mobile first, with real motion and a point of view.',
      solution:
        'Rebuilt the flow as a working prototype rather than a static comp — micro-interactions on every input state, motion carrying the reader between steps, and a submit moment built to land.',
      results: [],
    },
    sections: [
      {
        type: 'embed',
        embed: 'https://aris-100.vercel.app/',
        imageAlt: 'Aris — the vendor rate submission prototype, running',
        embedWidth: 390,
        embedHeight: 844,
      },
      {
        type: 'image',
        image: '/images/aris/design-system.png',
        imageAlt:
          'Aris — the design system behind the flow: colour, typography, buttons, rate input states, badges',
      },
    ],
  },
  {
    slug: 'solic-arc',
    title: 'Solic Arc',
    description:
      'An ergonomic electric guitar, designed and built — an instrument shaped to the player rather than to tradition.',
    category: 'Industrial Design',
    deck: "An extension of the player's body.",
    status: 'Industrial design · 3 months',
    client: 'Self-initiated',
    role: ['Industrial Designer', 'Maker'],
    team: ['Solo project'],
    surfaces: ['Physical product'],
    opening: [
      'Guitarists adapt to their instruments. Weight sits wrong on the shoulder, the upper frets are a reach, and the balance pulls the neck down — problems widespread enough that players treat them as the cost of playing rather than as faults worth fixing.',
      'Community research and ergonomic study drove the form: body shape, neck profile, a scalloped fretboard and hand-wound pickups, taken through sketching and prototyping to a finished instrument built on a CNC and by hand.',
    ],
    featured: true,
    thumbnail: '/images/solic-arc/thumbnail.png',
    year: 2025,
    details: {
      challenge:
        'Design an ergonomic electric guitar that addresses the playability and comfort problems identified across the guitarist community: poor weight distribution, neck dive, and unoptimised ergonomics.',
      solution:
        'Community research and ergonomic study, then iteration through sketching, prototyping and testing — resolved into an optimised body shape, ergonomic neck profile, scalloped fretboard and precision-built pickups, made with CNC machining and luthier craft.',
      results: [],
    },
    sections: [
      { type: 'image', image: '/images/solic-arc/01.png', imageAlt: 'Solic Arc, frame 01' },
      { type: 'image', image: '/images/solic-arc/02.png', imageAlt: 'Solic Arc, frame 02' },
      { type: 'image', image: '/images/solic-arc/03.png', imageAlt: 'Solic Arc, frame 03' },
      { type: 'image', image: '/images/solic-arc/04.png', imageAlt: 'Solic Arc, frame 04' },
      { type: 'image', image: '/images/solic-arc/05.png', imageAlt: 'Solic Arc, frame 05' },
      { type: 'image', image: '/images/solic-arc/06.png', imageAlt: 'Solic Arc, frame 06' },
      { type: 'image', image: '/images/solic-arc/07.png', imageAlt: 'Solic Arc, frame 07' },
      { type: 'image', image: '/images/solic-arc/08.png', imageAlt: 'Solic Arc, frame 08' },
      { type: 'image', image: '/images/solic-arc/09.png', imageAlt: 'Solic Arc, frame 09' },
      { type: 'image', image: '/images/solic-arc/10.png', imageAlt: 'Solic Arc, frame 10' },
      { type: 'image', image: '/images/solic-arc/11.png', imageAlt: 'Solic Arc, frame 11' },
      { type: 'image', image: '/images/solic-arc/12.png', imageAlt: 'Solic Arc, frame 12' },
      { type: 'image', image: '/images/solic-arc/13.png', imageAlt: 'Solic Arc, frame 13' },
      { type: 'image', image: '/images/solic-arc/14.png', imageAlt: 'Solic Arc, frame 14' },
      { type: 'image', image: '/images/solic-arc/15.png', imageAlt: 'Solic Arc, frame 15' },
      { type: 'image', image: '/images/solic-arc/16.png', imageAlt: 'Solic Arc, frame 16' },
      { type: 'image', image: '/images/solic-arc/17.png', imageAlt: 'Solic Arc, frame 17' },
    ],
  },
]

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((cs) => cs.slug === slug)
}

export function getFeaturedCaseStudies(): CaseStudy[] {
  return caseStudies.filter((cs) => cs.featured)
}
