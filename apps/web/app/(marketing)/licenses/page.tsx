import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Licenses',
  description: 'Licence terms for digital resources purchased from E-Tech OS.',
}

const LICENSES = [
  {
    name: 'Personal Licence',
    slug: 'personal',
    price: 'Lower tier',
    color: 'bg-surface border-border',
    badge: 'text-muted',
    allowed: [
      'Use on a single personal or non-commercial project',
      'Customise and adapt the resource for your own use',
      'Deploy on one domain or application',
    ],
    notAllowed: [
      'Use for a client project or on behalf of a third party',
      'Resell, redistribute, or sublicence the resource',
      'Create derivative products for sale',
      'Use in a SaaS product or subscription offering',
    ],
  },
  {
    name: 'Commercial Licence',
    slug: 'commercial',
    price: 'Higher tier',
    color: 'bg-brand/[0.04] border-brand/20',
    badge: 'text-brand',
    allowed: [
      'Use on client projects and deliver to clients',
      'Deploy across multiple projects for your business',
      'Customise freely for commercial use',
      'Internal business tools and applications',
    ],
    notAllowed: [
      'Resell or redistribute the original resource',
      'Sub-licence to other developers or agencies',
      'Create competing resource products for sale',
    ],
  },
  {
    name: 'Standard Licence',
    slug: 'standard',
    price: 'Single tier',
    color: 'bg-surface border-border',
    badge: 'text-muted',
    allowed: [
      'Use the resource for personal and commercial projects',
      'One end product or application',
      'Modify and adapt as needed',
    ],
    notAllowed: [
      'Resell, redistribute, or sublicence',
      'Use in multiple separate products',
    ],
  },
]

export default function LicensesPage() {
  return (
    <div className="px-5 md:px-10 lg:px-16 max-w-5xl mx-auto py-14 md:py-20">
      <div className="mb-12">
        <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.18em] mb-3">Legal</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink tracking-tight mb-4">Licences</h1>
        <p className="text-base text-muted max-w-2xl leading-relaxed">
          Digital resources sold on E-Tech OS (themes, templates, guides, design assets) are licensed, not sold.
          The licence type is shown on each product page. Here&apos;s what each licence covers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
        {LICENSES.map((lic) => (
          <div key={lic.slug} className={`rounded-xl border p-6 ${lic.color}`}>
            <div className="mb-5">
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${lic.badge}`}>{lic.price}</p>
              <h2 className="text-base font-semibold text-ink">{lic.name}</h2>
            </div>

            <div className="mb-5">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2.5">Allowed</p>
              <ul className="space-y-2">
                {lic.allowed.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-muted">
                    <svg className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2.5">Not allowed</p>
              <ul className="space-y-2">
                {lic.notAllowed.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-muted">
                    <svg className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-10 space-y-5 text-sm text-muted leading-relaxed">
        <p>
          <strong className="text-ink">Extended licences:</strong> If you need to use a resource in a way not covered
          above — for example, in a product sold to multiple end-users, or as part of a SaaS platform — contact us
          to discuss an extended licence agreement.
        </p>
        <p>
          <strong className="text-ink">Attribution:</strong> No public attribution to E-Tech OS is required unless
          stated on the product page.
        </p>
        <p>
          <strong className="text-ink">Third-party components:</strong> Some resources may incorporate third-party
          assets (icon sets, fonts, imagery). Where this is the case, those components remain subject to their
          original licences, which will be documented inside the resource package.
        </p>
        <p>
          <strong className="text-ink">Enforcement:</strong> Licence violations may result in access revocation
          without refund and may be subject to legal action.
        </p>
        <p>
          Questions?{' '}
          <a href="mailto:hello@deempiretech.com" className="text-brand hover:underline">hello@deempiretech.com</a>
          {' '}or via our{' '}
          <Link href="/contact" className="text-brand hover:underline">contact page</Link>.
        </p>
      </div>
    </div>
  )
}
