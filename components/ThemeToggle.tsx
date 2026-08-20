'use client'

import { useEffect, useState } from 'react'
import { sfx } from '@/lib/audio'
import { IconSun, IconMoon } from '@/components/Icons'

export type Theme = 'light' | 'dark'

/**
 * Both classes are written explicitly, never just one.
 *
 * globals.css carries a `@media (prefers-color-scheme: dark) :root:not(.light)`
 * block, so simply removing `.dark` would leave an OS-dark visitor stuck in
 * dark when they asked for light. `.light` is what opts out of that block.
 *
 * The initial class is set by the inline script in layout.tsx before first
 * paint; this component mirrors it into the button and updates it on click.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
  }, [])

  const toggle = () => {
    sfx.relay()
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    try {
      localStorage.setItem('theme', next)
    } catch {
      /* private mode — fall through, the class still applies for this session */
    }
    const el = document.documentElement
    el.classList.toggle('dark', next === 'dark')
    el.classList.toggle('light', next === 'light')
  }

  return (
    <button
      onClick={toggle}
      title={mounted ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
      aria-label={mounted ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[var(--r-sm)] border border-border/40 text-foreground/60 transition-all duration-200 hover:border-foreground/50 hover:bg-foreground/10 hover:text-foreground ${className}`}
    >
      {/* Render a stable placeholder until mounted so the icon can't mismatch
          during hydration; the box keeps its size either way. */}
      {!mounted ? (
        <span className="block h-4 w-4" />
      ) : theme === 'dark' ? (
        <IconSun size={15} />
      ) : (
        <IconMoon size={15} />
      )}
    </button>
  )
}
