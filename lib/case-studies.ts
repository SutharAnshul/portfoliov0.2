import { CaseStudy } from './types'

export const caseStudies: CaseStudy[] = [
  {
    slug: 'solic-arc',
    title: 'SOLIC ARC',
    description: 'An extension of player\'s body - a premium ergonomic electric guitar design that merges industrial craft with modern aesthetics',
    category: 'Industrial Design',
    featured: true,
    thumbnail: '/images/Solic Arc/Thumbnail.png',
    year: 2024,
    details: {
      challenge: 'Design an ergonomic electric guitar that solves widespread playability and comfort issues identified across the guitarist community, addressing poor weight distribution, balance problems, and unoptimized ergonomics in existing instruments.',
      solution: 'Conducted extensive community research, ergonomic studies, and created multiple iterations through sketching, prototyping, and testing. Engineered a guitar with optimized body shape, ergonomic neck profile, scalloped fretboard, and precision-built pickups using CNC machining and luthier craftsmanship.',
      results: []
    },
    sections: [
      { type: 'image', image: '/images/Solic Arc/2.png' },
      { type: 'image', image: '/images/Solic Arc/3.png' },
      { type: 'image', image: '/images/Solic Arc/4.png' },
      { type: 'image', image: '/images/Solic Arc/5.png' },
      { type: 'image', image: '/images/Solic Arc/6.png' },
      { type: 'image', image: '/images/Solic Arc/7.png' },
      { type: 'image', image: '/images/Solic Arc/8.png' },
      { type: 'image', image: '/images/Solic Arc/9.png' },
      { type: 'image', image: '/images/Solic Arc/10.png' },
      { type: 'image', image: '/images/Solic Arc/11.png' },
      { type: 'image', image: '/images/Solic Arc/12.png' },
      { type: 'image', image: '/images/Solic Arc/13.png' },
      { type: 'image', image: '/images/Solic Arc/14.png' },
      { type: 'image', image: '/images/Solic Arc/15.png' },
      { type: 'image', image: '/images/Solic Arc/16.png' },
      { type: 'image', image: '/images/Solic Arc/17.png' },
      { type: 'image', image: '/images/Solic Arc/18.png' },
      { type: 'image', image: '/images/Solic Arc/19.png' },
      { type: 'image', image: '/images/Solic Arc/20.png' },
      { type: 'image', image: '/images/Solic Arc/21.png' },
    ],
  },
  {
    slug: 'incentiwize',
    title: 'Incentiwise',
    description:
      'A rewards and recognition platform designed to make employee recognition more meaningful, measurable, and relevant to different workplace cultures.',
    category: 'Product Design',
    deck: 'A rewards and recognition platform, built to fit how each organisation actually recognises work.',
    status: 'Product design · 14 weeks',
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
]

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((cs) => cs.slug === slug)
}

export function getFeaturedCaseStudies(): CaseStudy[] {
  return caseStudies.filter((cs) => cs.featured)
}
