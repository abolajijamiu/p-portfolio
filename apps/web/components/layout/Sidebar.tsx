'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { cn, initials } from '@/lib/utils'

const NAV = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Projects', href: '/projects' },
]

const ADMIN_NAV = [
  { label: 'Themes', href: '/admin/themes' },
  { label: 'Work', href: '/admin/work' },
  { label: 'Articles', href: '/admin/articles' },
  { label: 'Media', href: '/admin/media' },
  { label: 'Testimonials', href: '/admin/testimonials' },
  { label: 'Inquiries', href: '/admin/inquiries' },
  { label: 'Campaigns', href: '/admin/campaigns' },
]

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

function NavLink({ href, label, exact = false }: { href: string; label: string; exact?: boolean }) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname.startsWith(href)
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center py-2.5 text-sm border-l-[1.5px]',
        'transition-[color,border-color,background-color] duration-150',
        active
          ? 'pl-[11px] pr-3 text-white font-medium border-brand'
          : 'pl-[11px] pr-3 text-white/50 hover:text-white hover:bg-white/[0.04] border-transparent hover:border-white/15',
      )}
    >
      {label}
    </Link>
  )
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'owner'

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 w-60 bg-sidebar flex flex-col z-20',
        'transition-transform duration-200 ease-out',
        'lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      {/* Brand */}
      <div className="px-5 py-[18px] border-b border-white/[0.08] flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          <span className="text-white">E</span>
          <span className="text-brand">-Tech.</span>
        </Link>
        <button
          onClick={onClose}
          aria-label="Close navigation"
          className="lg:hidden h-7 w-7 flex items-center justify-center rounded text-white/30 hover:text-white transition-[color] duration-150"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav aria-label="Main navigation" className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <NavLink href="/dashboard" label="Dashboard" exact />
        <NavLink href="/projects" label="Projects" />

        {isAdmin && (
          <>
            <div className="pt-4 pb-1.5 pl-3">
              <Link
                href="/admin"
                className="text-[10px] font-medium text-white/25 uppercase tracking-[0.15em] hover:text-white/50 transition-[color] duration-150"
              >
                Content
              </Link>
            </div>
            {ADMIN_NAV.map(({ label, href }) => (
              <NavLink key={href} href={href} label={label} />
            ))}
          </>
        )}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/[0.08] space-y-0.5">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="h-7 w-7 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-semibold text-brand">{initials(user.name)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{user.name}</p>
              <p className="text-white/40 text-[11px] truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2.5 text-sm text-white/40 hover:text-white border-l-[1.5px] border-transparent hover:border-white/15 hover:bg-white/[0.04] transition-[color,border-color,background-color] duration-150"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
