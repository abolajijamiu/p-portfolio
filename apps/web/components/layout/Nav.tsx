'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MenuIcon, XIcon } from '@/components/ui/Icons'

const LINKS = [
  { label: 'Services', href: '/services' },
  { label: 'Themes', href: '/themes' },
  { label: 'Work', href: '/work' },
  { label: 'Articles', href: '/articles' },
  { label: 'Contact', href: '/contact' },
]

function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={className}>
      <div className="flex flex-col leading-none gap-0.5">
        <span className="text-[15px] font-black tracking-tight text-ink uppercase">E-TECH</span>
        <span className="text-[7.5px] font-semibold tracking-[0.18em] text-brand uppercase">Systems &amp; Solutions</span>
      </div>
    </Link>
  )
}

export function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between h-14 md:h-16 px-5 md:px-12 lg:px-20 max-w-7xl mx-auto">
          <Wordmark />

          <nav className="hidden md:flex items-center gap-7">
            {LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={[
                  'text-sm transition-[color] duration-150',
                  pathname === href ? 'text-ink font-medium' : 'text-muted hover:text-ink',
                ].join(' ')}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="hidden md:inline-flex items-center gap-1.5 bg-ink text-white text-xs font-medium px-4 py-2 rounded-md hover:bg-[#222] transition-[background-color] duration-150"
            >
              Start a conversation
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-md text-ink hover:bg-surface transition-[background-color] duration-150 -mr-1"
            >
              {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 bg-white md:hidden flex flex-col animate-fade-up">
          <div className="flex items-center justify-between h-14 px-5 border-b border-border shrink-0">
            <Wordmark />
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="h-9 w-9 flex items-center justify-center rounded-md text-ink hover:bg-surface transition-[background-color] duration-150 -mr-1"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 flex flex-col px-5 pt-8 space-y-1">
            {LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={[
                  'flex items-center py-3.5 text-2xl font-semibold tracking-tight border-b border-border/50 transition-[color] duration-150',
                  pathname === href ? 'text-ink' : 'text-ink/50 hover:text-ink',
                ].join(' ')}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="shrink-0 px-5 pb-10 pt-6">
            <Link
              href="/contact"
              className="flex items-center justify-center w-full bg-ink text-white text-sm font-medium py-3.5 rounded-md hover:bg-[#222] transition-[background-color] duration-150"
            >
              Start a conversation
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
