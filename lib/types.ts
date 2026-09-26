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
  /**
   * Kept, but not shown.
   *
   * A record marked this way is out of the index, out of the count, and out of
   * the sequence the arrows walk — but its route is still built and its URL
   * still works, so a link already sent to somebody does not rot while the
   * work is off the shelf. Set it back to false to put the record back.
   */
  hidden?: boolean
  thumbnail?: string
  year: number
  details: {
    challenge: string
    solution: string
    results: string[]
  }
  sections: CaseStudySection[]
  /**
   * Frames that come after the record's own screens, under a heading of their
   * own: the parts of the project worth showing that are not the story the
   * record tells. Same plates and the same deck as the screens above them —
   * a second sequence, not a second kind of thing.
   */
  more?: CaseStudySection[]
}

export interface CaseStudySection {
  type: 'text' | 'image' | 'embed' | 'two-column' | 'cta' | 'button'
  title?: string
  content?: string
  image?: string
  imageAlt?: string
  /**
   * A live prototype, shown in the frame sequence where an image would be.
   * width/height are the prototype's own design size — a phone build is drawn
   * at phone size rather than stretched across the plate.
   */
  embed?: string
  embedWidth?: number
  embedHeight?: number
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
