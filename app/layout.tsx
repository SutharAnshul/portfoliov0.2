import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono, Instrument_Serif } from 'next/font/google'
import './globals.css'

/**
 * Working default while the typeface is still open. The whole system reads
 * from --font-ui, so swapping families is a one-line change here.
 */
/**
 * Working default while the typeface is still open. The whole system reads
 * from --font-ui, so swapping families is a one-line change here.
 */
const ui = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  // Italic carries Orion's untranslated speech. It has to be the same
  // monospace family as the translation so a meow and the English word it
  // becomes occupy identical width — the swap then happens with no reflow.
  style: ['normal', 'italic'],
  variable: '--font-ui',
  display: 'swap',
})

/**
 * The display face. Pairing a dramatic serif against the mono is what creates
 * hierarchy — four mono sizes between 10px and 13px read as one size no matter
 * how the weights are set.
 */
const display = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})
import { LayoutShell } from '@/components/LayoutShell'
import { SmoothScroll } from '@/components/SmoothScroll'
import { CustomCursor } from '@/components/CustomCursor'

export const metadata: Metadata = {
  title: 'Anshul Suthar - Product Designer',
  description:
    'Product designer based in India. I like figuring out how things work, then making them better.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${ui.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        {/*
          Resolves the theme before first paint, so the page never flashes the
          wrong palette.

          Three palette blocks exist in globals.css: `:root` (light), `.dark`
          (manual dark), and `@media (prefers-color-scheme: dark) :root:not(.light)`
          (system dark). Leaving the class off means the system block decides,
          which makes a manual "light" choice unreachable on an OS set to dark.
          So this always writes an explicit `.light` or `.dark` — falling back to
          the system preference only when nothing is stored.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}var e=document.documentElement;e.classList.add(t);e.classList.remove(t==='dark'?'light':'dark')}catch(err){document.documentElement.classList.add('dark')}
/* Hold settle-able content before hydration so the boot animation starts from
   its displaced position instead of flashing in settled first. Adding this
   from script (never in the served HTML) is what keeps the page readable when
   JS is off. */
try{if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('boot')}}catch(err){}})();`,
          }}
        />
      </head>
      <body className="antialiased bg-background">
        <SmoothScroll />
        <CustomCursor />
        <LayoutShell context="portfolio">
          {children}
        </LayoutShell>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
