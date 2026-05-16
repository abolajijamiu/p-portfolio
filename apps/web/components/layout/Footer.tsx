import Link from 'next/link'

const COMPANY = [
  { label: 'Services', href: '/services' },
  { label: 'Themes', href: '/themes' },
  { label: 'Work', href: '/work' },
  { label: 'Contact', href: '/contact' },
]

const PLATFORM = [{ label: 'Client portal', href: '/login' }]

export function Footer() {
  return (
    <footer className="bg-sidebar border-t border-white/[0.06]">
      <div className="px-5 md:px-12 lg:px-20 pt-12 md:pt-16 pb-8 md:pb-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10 md:gap-12">
          <div className="max-w-xs">
            <Link href="/" className="text-sm font-semibold tracking-tight">
              <span className="text-white">E</span>
              <span className="text-brand">-Tech.</span>
            </Link>
            <p className="text-white/40 text-sm mt-3 leading-relaxed">
              We work with people who care about the quality of the outcome.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 md:gap-12 text-sm">
            <div>
              <p className="text-white/25 text-[11px] uppercase tracking-widest mb-4">Company</p>
              <ul className="space-y-3">
                {COMPANY.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-white/50 hover:text-white transition-[color] duration-150">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white/25 text-[11px] uppercase tracking-widest mb-4">Platform</p>
              <ul className="space-y-3">
                {PLATFORM.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-white/50 hover:text-white transition-[color] duration-150">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06] mt-12 md:mt-16 pt-8">
          <p className="text-white/25 text-xs">
            © {new Date().getFullYear()} E-Tech. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
