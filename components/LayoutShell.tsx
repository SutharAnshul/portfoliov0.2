'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SideNav } from '@/components/SideNav'
import { ChatDrawer } from '@/components/ChatDrawer'
import { MobileChrome } from '@/components/MobileChrome'
import { BreadcrumbNav } from '@/components/BreadcrumbNav'
import { ScrollAdvance } from '@/components/ScrollAdvance'

const NAV_MIN = 300
const NAV_MAX = 480
const CHAT_MIN = 300
const CHAT_MAX = 640

interface LayoutShellProps {
  context: string
  children: React.ReactNode
}

export function LayoutShell({ context, children }: LayoutShellProps) {
  const pathname = usePathname()
  const [navWidth, setNavWidth] = useState(324)
  // Mr. Toast matches the nav opposite him, so the page sits centred between
  // two equal columns rather than being pushed off-axis by a wider one.
  const [chatWidth, setChatWidth] = useState(324)
  // Open beside the page on a desktop, closed on a phone. There it is a
  // full-height sheet, so opening it by default means the site loads with its
  // own content hidden behind a chat nobody asked for yet.
  const [chatOpen, setChatOpen] = useState(false)
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    setChatOpen(window.matchMedia('(min-width: 768px)').matches)
  }, [])

  const draggingRef = useRef<null | 'nav' | 'chat'>(null)

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

  // The direction comparison needs the full viewport and no competing chrome.
  const bare = pathname.startsWith('/compare') || pathname.startsWith('/type')

  const startNavResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    draggingRef.current = 'nav'
    setIsResizing(true)
  }, [])

  const startChatResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    draggingRef.current = 'chat'
    setIsResizing(true)
  }, [])

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!draggingRef.current) return
      if (draggingRef.current === 'nav') {
        setNavWidth(clamp(e.clientX, NAV_MIN, NAV_MAX))
      } else {
        setChatWidth(clamp(window.innerWidth - e.clientX, CHAT_MIN, CHAT_MAX))
      }
    }
    const handleUp = () => {
      if (!draggingRef.current) return
      draggingRef.current = null
      setIsResizing(false)
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [])

  // Prevent text selection / set cursor globally while dragging
  useEffect(() => {
    if (isResizing) {
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'col-resize'
    } else {
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
    return () => {
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isResizing])

  const transition = isResizing ? 'none' : 'margin 300ms ease'
  const rightEdge = chatOpen ? chatWidth : 0

  if (bare) return <>{children}</>

  return (
    <>
      <ScrollAdvance />
      
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <SideNav width={navWidth} />

      <BreadcrumbNav
        left={navWidth}
        right={rightEdge}
        chatOpen={chatOpen}
        onOpenChat={() => setChatOpen(true)}
      />

      <main
        style={{
          marginLeft: navWidth,
          marginRight: rightEdge,
          transition,
        }}
        data-page-content
        className="pt-20 min-h-screen"
      >
        {children}
      </main>

      {/* Nav divider - line with pill grip, sits above both panels so nothing clips it */}
      <div
        onPointerDown={startNavResize}
        style={{ left: navWidth }}
        className="group fixed top-0 z-50 flex h-screen w-2 -translate-x-1/2 cursor-col-resize items-center justify-center"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize navigation"
      >
        <div className="h-full w-px bg-foreground/20 transition-colors group-hover:bg-foreground/40" />
        <div className="absolute h-8 w-1.5 rounded-[var(--r-sm)] bg-muted-foreground transition-colors group-hover:bg-foreground" />
      </div>

      {chatOpen && (
        <>
          {/* Chat divider - line with pill grip */}
          <div
            onPointerDown={startChatResize}
            style={{ right: chatWidth }}
            className="group fixed top-0 z-50 flex h-screen w-2 translate-x-1/2 cursor-col-resize items-center justify-center"
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize chat"
          >
            <div className="h-full w-px bg-foreground/20 transition-colors group-hover:bg-foreground/40" />
            <div className="absolute h-8 w-1.5 rounded-[var(--r-sm)] bg-muted-foreground transition-colors group-hover:bg-foreground" />
          </div>

        </>
      )}
      </div>

      {/*
        Mr. Toast lives outside both trees. Rendered inside the desktop one he
        was display:none on a phone — present in the DOM, measuring 0x0, and
        opening nothing when you tapped him.
      */}
      {chatOpen && (
        <ChatDrawer context={context} width={chatWidth} onClose={() => setChatOpen(false)} />
      )}

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-screen bg-background">
        <MobileChrome onOpenChat={() => setChatOpen(true)} />
        <div data-scroll-root data-page-content className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  )
}
