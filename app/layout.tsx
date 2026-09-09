import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Raleway } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

/**
 * The working face.
 *
 * Tronica Mono, held in the repo rather than fetched: it is not on Google
 * Fonts, and a face this particular is part of the work rather than a
 * dependency of it. One file, one weight, no italic — which is the whole
 * family, so there is nothing to lazy-load and nothing to fall back to
 * mid-render.
 *
 * Declared at 400, its true weight, which leaves the browser to synthesise
 * the 700 the labels and titles ask for. The alternative — claiming a 100-900
 * range so nothing is ever synthesised — was tried on the face this replaced
 * and looked worse: every label, title and body line draws at one weight and
 * the hierarchy the page was built on flattens out.
 *
 * It advances at 0.65em where the previous face advanced at 0.7, so every
 * line of interface type on the site is about seven percent narrower than it
 * was, and 1ch — which the name signature is built on — narrows with it.
 */
const ui = localFont({
  src: './fonts/Tronica-Mono.otf',
  weight: '400',
  style: 'normal',
  variable: '--font-ui',
  display: 'swap',
})

/**
 * The reading face.
 *
 * Case study prose is the one place on this site where someone is asked to
 * read several hundred words in a row, and a monospace is the wrong tool for
 * that — the even colour that makes it good interface type is exactly what
 * makes a paragraph of it hard to get through. Raleway is set larger than the
 * interface around it, which is the point: the size change is the signal that
 * this is to be read rather than scanned.
 *
 * Variable, so the weight range costs one file.
 */
const read = Raleway({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-read',
  display: 'swap',
})

import { LayoutShell } from '@/components/LayoutShell'
import { SmoothScroll } from '@/components/SmoothScroll'
import { CustomCursor } from '@/components/CustomCursor'
import { CrtGlass } from '@/components/CrtGlass'

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
  // One palette, so one answer to both of these. A light themeColor on an OS
  // set to light would have drawn a white browser bar above a page that is
  // always dark — the only place the removed light mode could still show.
  //
  // The favicon above keeps its media queries on purpose: those describe the
  // tab strip the icon sits in, not the page it points at.
  colorScheme: 'dark',
  themeColor: '#252525',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${ui.variable} ${read.variable}`} suppressHydrationWarning>
      <head>
        {/*
          Holds settle-able content before hydration, so the boot animation
          starts from its displaced position instead of flashing in settled
          first. Added from script and never in the served HTML, which is what
          keeps the page readable with JS off.

          This used to resolve the theme too. There is one palette now, so
          there is nothing to resolve and nothing to flash.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('boot')}}catch(err){}})();`,
          }}
        />
      </head>
      <body className="antialiased bg-background">
        <CrtGlass />
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
