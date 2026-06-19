import Link from 'next/link'

const SERVICES = [
  { label: 'Development', href: '/services#development' },
  { label: 'Marketing', href: '/services#marketing' },
  { label: 'Branding', href: '/services#branding' },
  { label: 'AI & Analytics', href: '/services#ai_analytics' },
  { label: 'E-commerce', href: '/services#ecommerce' },
  { label: 'All Services', href: '/services' },
]

const RESOURCES = [
  { label: 'Themes', href: '/themes' },
  { label: 'Templates', href: '/resources#template' },
  { label: 'Prompt Packs', href: '/resources' },
  { label: 'All Resources', href: '/resources' },
]

const COMPANY = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'Work', href: '/work' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'Articles', href: '/articles' },
  { label: 'Contact', href: '/contact' },
]

const PLATFORM = [
  { label: 'Client Portal', href: '/login' },
  { label: 'Book a Strategy Call', href: '/book' },
  { label: 'For Experts', href: '/experts/apply' },
  { label: 'Help & Support', href: '/contact' },
]

export function Footer() {
  return (
    <footer className="bg-sidebar border-t border-white/[0.06]">
      <div className="px-5 md:px-10 lg:px-16 pt-14 md:pt-20 pb-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-8 mb-14 md:mb-16">
          {/* Brand column */}
          <div className="md:col-span-2 max-w-sm">
            <div className="mb-5">
              <Link href="/" className="inline-flex flex-col leading-none gap-0.5">
                <span className="text-[15px] font-black tracking-tight text-white uppercase">E-TECH</span>
                <span className="text-[7.5px] font-semibold tracking-[0.18em] text-brand uppercase">Systems &amp; Solutions</span>
              </Link>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              A senior team for companies that need the work to be right, not just finished. Development, marketing, branding, and e-commerce — done properly.
            </p>
            <div className="flex gap-3">
              <a
                href="https://wa.me/447478034171"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white text-xs font-medium transition-colors duration-150 border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-md"
              >
                WhatsApp
              </a>
              <a
                href="mailto:hello@deempiretech.com"
                className="text-white/40 hover:text-white text-xs font-medium transition-colors duration-150 border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-md"
              >
                Email Us
              </a>
            </div>
          </div>

          {/* Links grid */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
            <div>
              <p className="text-white/25 text-[10px] font-semibold uppercase tracking-widest mb-4">Services</p>
              <ul className="space-y-2.5">
                {SERVICES.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-white/50 hover:text-white transition-colors duration-150 text-[13px]">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white/25 text-[10px] font-semibold uppercase tracking-widest mb-4">Resources</p>
              <ul className="space-y-2.5">
                {RESOURCES.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-white/50 hover:text-white transition-colors duration-150 text-[13px]">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white/25 text-[10px] font-semibold uppercase tracking-widest mb-4">Company</p>
              <ul className="space-y-2.5">
                {COMPANY.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-white/50 hover:text-white transition-colors duration-150 text-[13px]">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white/25 text-[10px] font-semibold uppercase tracking-widest mb-4">Platform</p>
              <ul className="space-y-2.5">
                {PLATFORM.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-white/50 hover:text-white transition-colors duration-150 text-[13px]">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-white/25 text-xs">
            © {new Date().getFullYear()} E-Tech. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/25">
            <Link href="/legal" className="hover:text-white/60 transition-colors duration-150">Legal</Link>
            <Link href="/privacy" className="hover:text-white/60 transition-colors duration-150">Privacy</Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors duration-150">Terms</Link>
            <Link href="/refund" className="hover:text-white/60 transition-colors duration-150">Refunds</Link>
            <Link href="/cookies" className="hover:text-white/60 transition-colors duration-150">Cookies</Link>
            <Link href="/licenses" className="hover:text-white/60 transition-colors duration-150">Licenses</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
