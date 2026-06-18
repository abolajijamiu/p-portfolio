'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MenuIcon, XIcon, ChevronDownIcon } from '@/components/ui/Icons'

const SERVICES_LINKS = [
  { label: 'Development', href: '/services#development', desc: 'Web, mobile & custom builds' },
  { label: 'Marketing', href: '/services#marketing', desc: 'Growth, SEO & paid channels' },
  { label: 'Branding', href: '/services#branding', desc: 'Identity, design & messaging' },
  { label: 'AI & Analytics', href: '/services#ai_analytics', desc: 'Data, reporting & AI systems' },
  { label: 'E-commerce', href: '/services#ecommerce', desc: 'Shopify, WooCommerce & more' },
  { label: 'All Services', href: '/services', desc: 'Browse the full catalogue' },
]

const RESOURCES_LINKS = [
  { label: 'Themes', href: '/themes', desc: 'Premium Shopify & WP themes' },
  { label: 'Templates', href: '/resources#template', desc: 'Ready-to-use design kits' },
  { label: 'Prompt Packs', href: '/resources', desc: 'AI prompts for every use case' },
  { label: 'All Resources', href: '/resources', desc: 'Browse everything' },
]

const NAV_LINKS = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'Work', href: '/work' },
  { label: 'Articles', href: '/articles' },
  { label: 'Contact', href: '/contact' },
]

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0">
      <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
        <span className="text-white text-xs font-bold tracking-tight">E</span>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[13px] font-bold tracking-tight text-ink">E-Tech OS</span>
        <span className="text-[9px] font-medium tracking-[0.12em] text-muted uppercase">by DeEmpireTech</span>
      </div>
    </Link>
  )
}

function DropdownMenu({ items }: { items: typeof SERVICES_LINKS }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[280px] bg-white border border-border rounded-xl shadow-lg shadow-ink/[0.06] py-1.5 animate-dropdown z-50">
      {items.map(({ label, href, desc }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-col px-4 py-2.5 hover:bg-surface transition-colors duration-100 group"
        >
          <span className="text-sm font-medium text-ink group-hover:text-brand transition-colors duration-100">{label}</span>
          <span className="text-xs text-muted mt-0.5">{desc}</span>
        </Link>
      ))}
    </div>
  )
}

export function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [dropdown, setDropdown] = useState<'services' | 'resources' | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setOpen(false); setDropdown(null) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  function openDropdown(name: 'services' | 'resources') {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setDropdown(name)
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setDropdown(null), 120)
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between h-14 md:h-16 px-5 md:px-10 lg:px-16 max-w-7xl mx-auto">
          <Wordmark />

          <nav className="hidden md:flex items-center gap-1">
            {/* Services dropdown */}
            <div
              className="relative"
              onMouseEnter={() => openDropdown('services')}
              onMouseLeave={scheduleClose}
            >
              <button
                className={[
                  'flex items-center gap-1 text-sm px-3 py-2 rounded-md transition-colors duration-150',
                  dropdown === 'services' || isActive('/services')
                    ? 'text-ink bg-surface'
                    : 'text-muted hover:text-ink hover:bg-surface',
                ].join(' ')}
              >
                Services
                <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-150 ${dropdown === 'services' ? 'rotate-180' : ''}`} />
              </button>
              {dropdown === 'services' && (
                <div onMouseEnter={() => openDropdown('services')} onMouseLeave={scheduleClose}>
                  <DropdownMenu items={SERVICES_LINKS} />
                </div>
              )}
            </div>

            {/* Resources dropdown */}
            <div
              className="relative"
              onMouseEnter={() => openDropdown('resources')}
              onMouseLeave={scheduleClose}
            >
              <button
                className={[
                  'flex items-center gap-1 text-sm px-3 py-2 rounded-md transition-colors duration-150',
                  dropdown === 'resources' || isActive('/themes') || isActive('/resources')
                    ? 'text-ink bg-surface'
                    : 'text-muted hover:text-ink hover:bg-surface',
                ].join(' ')}
              >
                Resources
                <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-150 ${dropdown === 'resources' ? 'rotate-180' : ''}`} />
              </button>
              {dropdown === 'resources' && (
                <div onMouseEnter={() => openDropdown('resources')} onMouseLeave={scheduleClose}>
                  <DropdownMenu items={RESOURCES_LINKS} />
                </div>
              )}
            </div>

            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={[
                  'text-sm px-3 py-2 rounded-md transition-colors duration-150',
                  isActive(href) ? 'text-ink bg-surface font-medium' : 'text-muted hover:text-ink hover:bg-surface',
                ].join(' ')}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden md:inline-flex items-center text-sm text-muted hover:text-ink transition-colors duration-150 px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/services"
              className="hidden md:inline-flex items-center gap-1.5 bg-brand text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-deep transition-colors duration-150"
            >
              Hire Experts
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg text-ink hover:bg-surface transition-colors duration-150"
            >
              {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-40 bg-white md:hidden flex flex-col animate-fade-up">
          <div className="flex items-center justify-between h-14 px-5 border-b border-border shrink-0">
            <Wordmark />
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="h-9 w-9 flex items-center justify-center rounded-lg text-ink hover:bg-surface transition-colors duration-150"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-5 py-6 space-y-1">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3 px-3">Services</p>
            {SERVICES_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center py-2.5 px-3 rounded-lg text-base font-medium text-ink/70 hover:text-ink hover:bg-surface transition-colors duration-150"
              >
                {label}
              </Link>
            ))}

            <div className="border-t border-border my-4" />
            <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3 px-3">Resources</p>
            {RESOURCES_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center py-2.5 px-3 rounded-lg text-base font-medium text-ink/70 hover:text-ink hover:bg-surface transition-colors duration-150"
              >
                {label}
              </Link>
            ))}

            <div className="border-t border-border my-4" />
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center py-2.5 px-3 rounded-lg text-base font-medium text-ink/70 hover:text-ink hover:bg-surface transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="shrink-0 px-5 pb-10 pt-4 space-y-3 border-t border-border">
            <Link
              href="/services"
              className="flex items-center justify-center w-full bg-brand text-white text-sm font-medium py-3 rounded-lg hover:bg-brand-deep transition-colors duration-150"
            >
              Hire Experts
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center w-full bg-surface text-ink text-sm font-medium py-3 rounded-lg hover:bg-border transition-colors duration-150"
            >
              Client Portal
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
