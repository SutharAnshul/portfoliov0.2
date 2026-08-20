export interface CaseStudy {
  slug: string
  title: string
  description: string
  category: string
  /** The one line under the title, in italic. What the thing was. */
  deck?: string
  /** Small status chip beside it. */
  status?: string
  /** The spec block. Absent fields are simply not rendered. */
  client?: string
  clientNote?: string
  role?: string[]
  team?: string[]
  surfaces?: string[]
  /** Body paragraphs. */
  opening?: string[]
  featured: boolean
  thumbnail?: string
  year: number
  details: {
    challenge: string
    solution: string
    results: string[]
  }
  sections: CaseStudySection[]
}

export interface CaseStudySection {
  type: 'text' | 'image' | 'two-column' | 'cta' | 'button'
  title?: string
  content?: string
  image?: string
  imageAlt?: string
  layout?: 'left' | 'right'
  label?: string
  href?: string
  isBulletList?: boolean
  bullets?: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface UploadedFile {
  name: string
  url: string
  size: number
  uploadedAt: Date
}
