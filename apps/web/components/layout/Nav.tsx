'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MenuIcon, XIcon } from '@/components/ui/Icons'

const SERVICE_LABELS: Record<string, string> = {
  development:  'Development',
  marketing:    'Marketing',
  branding:     'Branding',
  ai_analytics: 'AI & Analytics',
  ecommerce:    'E-commerce',
  consulting:   'Consulting',
  technical:    'Technical',
  publishing:   'Publishing',
  premium:      'Premium',
}

const RESOURCE_LABELS: Record<string, string> = {
  design_asset: 'Themes',
  template:     'Templates',
  guide:        'Guides',
  tool:         'Tools',
  starter_kit:  'Starter Kits',
  plugin:       'Plugins',
  course:       'Courses',
  font:         'Fonts',
}

interface NavProps {
  serviceCategories: string[]
  resourceCategories: string[]
}

function Wordmark() {
  return (
    <Link href="/">
      <div className="flex flex-col leading-none gap-0.5">
        <span className="text-[15px] font-black tracking-tight text-ink uppercase">E-TECH</span>
        <span className="text-[7.5px] font-semibold tracking-[0.18em] text-brand uppercase">Systems &amp; Solutions</span>
      </div>
    </Link>
  )
}

function NavDropdown({
  label,
  href,
  items,
  allLabel,
  active,
}: {
  label: string
  href: string
  items: { label: string; href: string }[]
  allLabel: string
  active: boolean
}) {
  return (
    <div className="relative group">
      <Link
        href={href}
        className={[
          'flex items-center gap-0.5 text-sm transition-[color] duration-150',
          active ? 'text-ink font-medium' : 'text-muted hover:text-ink',
        ].join(' ')}
      >
        {label}
        <svg className="h-3.5 w-3.5 opacity-50 mt-px shrink-0" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      {items.length > 0 && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 hidden group-hover:block z-50">
          <div className="min-w-[190px] bg-white border border-border rounded-xl shadow-xl shadow-black/[0.06] py-1.5 overflow-hidden">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2.5 text-sm text-muted hover:text-ink hover:bg-surface transition-colors duration-100"
              >
                {item.label}
              </Link>
            ))}
            <div className="h-px bg-border my-1.5" />
            <Link
              href={href}
              className="block px-4 py-2.5 text-sm font-semibold text-brand hover:text-brand-deep hover:bg-brand-dim transition-colors duration-100"
            >
              {allLabel} →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

const FLAT_LINKS = [
  { label: 'Work', href: '/work' },
  { label: 'Articles', href: '/articles' },
  { label: 'Contact', href: '/contact' },
]

export function Nav({ serviceCategories, resourceCategories }: NavProps) {
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

  const serviceItems = serviceCategories.map((cat) => ({
    label: SERVICE_LABELS[cat] ?? cat,
    href: `/services#${cat}`,
  }))

  const resourceItems = resourceCategories.map((cat) => ({
    label: RESOURCE_LABELS[cat] ?? cat,
    href: `/resources#${cat}`,
  }))

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between h-14 md:h-16 px-5 md:px-12 lg:px-20 max-w-7xl mx-auto">
          <Wordmark />

          <nav className="hidden md:flex items-center gap-7">
            <NavDropdown
              label="Services"
              href="/services"
              items={serviceItems}
              allLabel="All Services"
              active={pathname.startsWith('/services')}
            />
            <NavDropdown
              label="Resources"
              href="/resources"
              items={resourceItems}
              allLabel="All Resources"
              active={pathname.startsWith('/resources')}
            />
            {FLAT_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={[
                  'text-sm transition-[color] duration-150',
                  pathname === href || pathname.startsWith(href + '/')
                    ? 'text-ink font-medium'
                    : 'text-muted hover:text-ink',
                ].join(' ')}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden md:inline-flex items-center text-xs text-muted hover:text-ink transition-[color] duration-150"
            >
              Sign in
            </Link>
            <a
              href="https://wa.me/447478034171"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 bg-ink text-white text-xs font-medium px-4 py-2 rounded-md hover:bg-[#222] transition-[background-color] duration-150"
            >
              Start a conversation
            </a>
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

          <nav className="flex-1 overflow-y-auto px-5 py-6">
            <Link
              href="/services"
              className="flex items-center py-3 text-base font-semibold text-ink border-b border-border/50"
            >
              Services
            </Link>
            {serviceItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center py-2.5 pl-4 text-sm text-muted hover:text-ink transition-[color] duration-150"
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/resources"
              className="flex items-center py-3 mt-2 text-base font-semibold text-ink border-b border-border/50 border-t border-border/50"
            >
              Resources
            </Link>
            {resourceItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center py-2.5 pl-4 text-sm text-muted hover:text-ink transition-[color] duration-150"
              >
                {item.label}
              </Link>
            ))}

            {FLAT_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center py-3 text-base font-semibold text-ink/70 hover:text-ink transition-[color] duration-150 border-b border-border/50"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="shrink-0 px-5 pb-10 pt-4 space-y-3 border-t border-border">
            <a
              href="https://wa.me/447478034171"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full bg-ink text-white text-sm font-medium py-3 rounded-md hover:bg-[#222] transition-[background-color] duration-150"
            >
              Start a conversation
            </a>
            <Link
              href="/login"
              className="flex items-center justify-center w-full border border-border text-ink text-sm font-medium py-3 rounded-md hover:bg-surface transition-[background-color] duration-150"
            >
              Client portal
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
