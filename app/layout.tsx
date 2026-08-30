import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Space_Mono, EB_Garamond } from 'next/font/google'
import './globals.css'

/**
 * The working face. Everything in the system reads from --font-ui, so this
 * import is the only place the family is named.
 *
 * Space Mono ships 400 and 700 only — there is no 500 or 600 to ask for, and
 * asking would make the browser synthesise one. The three weight tokens in
 * globals.css are set to weights it actually has.
 *
 * It is also a wide, low-contrast face that loses legibility faster than most
 * as it shrinks, which is the reason for the 12px floor on page content.
 */
const ui = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  // Italic carries Mr. Toast's untranslated speech. It has to be the same
  // monospace family as the translation so a meow and the English word it
  // becomes occupy identical width — the swap then happens with no reflow.
  style: ['normal', 'italic'],
  variable: '--font-ui',
  display: 'swap',
})

/**
 * The display face, and now the voice of the About statement too. Pairing a
 * serif against the mono is what creates hierarchy — four mono sizes between
 * 10px and 14px read as one size no matter how the weights are set.
 *
 * EB Garamond is a variable font, so the weight range costs one file rather
 * than one per step.
 */
const display = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
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
