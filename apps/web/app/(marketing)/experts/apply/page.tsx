'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CheckIcon } from '@/components/ui/Icons'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const SPECIALISATIONS = [
  'Shopify Development',
  'Web Development (React / Next.js)',
  'UI / UX Design',
  'Brand Identity',
  'SEO & Content',
  'Paid Advertising',
  'Email Marketing',
  'Analytics & Data',
  'AI & Automation',
  'E-commerce Strategy',
  'Copywriting',
  'Video & Motion',
  'Other',
]

const PERKS = [
  'Work on high-calibre client projects',
  'Flexible, async-first collaboration',
  'Competitive per-project compensation',
  'Full brief and asset support from the ops team',
  'No client chasing — we handle all account management',
  'Ongoing opportunities across a wide brief variety',
]

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export default function ExpertApplyPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    specialisation: '',
    portfolioUrl: '',
    tools: '',
    message: '',
  })
  const [errors, setErrors] = useState<Partial<typeof form>>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const e: Partial<typeof form> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!validateEmail(form.email)) e.email = 'Valid email is required'
    if (!form.specialisation) e.specialisation = 'Please select a specialisation'
    if (!form.message.trim() || form.message.trim().length < 40)
      e.message = 'Please tell us a bit more (at least 40 characters)'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    setServerError(null)
    try {
      const body = JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.specialisation,
        budget: '',
        message: [
          form.message.trim(),
          form.portfolioUrl ? `Portfolio / Website: ${form.portfolioUrl.trim()}` : '',
          form.tools ? `Tools & stack: ${form.tools.trim()}` : '',
        ].filter(Boolean).join('\n\n'),
        inquiryType: 'expert-application',
      })
      const res = await fetch(`${API_URL}/api/v1/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? 'Something went wrong.')
      }
      setDone(true)
    } catch (err: unknown) {
      setServerError((err as Error).message ?? 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-5">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckIcon className="h-7 w-7 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight mb-3">
            Application received
          </h1>
          <p className="text-sm text-muted leading-relaxed mb-8">
            Thank you for applying to join the E-Tech expert network. We review every application
            carefully and will be in touch within 5 business days if your profile is a strong match.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-ink text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-[#222] transition-[background-color] duration-150"
          >
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 md:px-12 lg:px-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pt-12 pb-10 md:pt-20 md:pb-16">
        <p className="text-[11px] font-medium text-muted uppercase tracking-[0.2em] mb-4 md:mb-5">
          Expert network
        </p>
        <h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-normal tracking-tight text-ink leading-tight max-w-2xl">
          Join the team.
        </h1>
        <p className="text-muted text-[15px] mt-4 md:mt-5 max-w-lg leading-relaxed">
          We work with a curated group of specialists — developers, designers, marketers, and
          analysts — on client projects delivered through the E-Tech OS platform.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-20 border-t border-border pt-10 md:pt-14">
        {/* Left — context */}
        <div className="lg:col-span-4">
          <h2 className="text-sm font-semibold text-ink tracking-tight mb-5">What to expect</h2>
          <ul className="space-y-3">
            {PERKS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-muted leading-relaxed">
                <span className="mt-[3px] h-4 w-4 shrink-0 rounded-full bg-brand/10 flex items-center justify-center">
                  <CheckIcon className="h-2.5 w-2.5 text-brand" />
                </span>
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-10 pt-8 border-t border-border">
            <p className="text-xs text-muted leading-relaxed">
              We are a small, high-output team. We take on a limited number of expert partners at
              any given time — quality over volume, always.
            </p>
            <p className="text-xs text-muted leading-relaxed mt-3">
              Questions?{' '}
              <Link href="/contact" className="text-brand hover:underline">
                Contact us directly.
              </Link>
            </p>
          </div>
        </div>

        {/* Right — form */}
        <div className="lg:col-span-7 lg:col-start-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-ink mb-1.5">
                  Full name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Your name"
                  className={`w-full px-3.5 py-2.5 text-sm text-ink border rounded-lg bg-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors ${
                    errors.name ? 'border-rose-400' : 'border-border'
                  }`}
                />
                {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-ink mb-1.5">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full px-3.5 py-2.5 text-sm text-ink border rounded-lg bg-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors ${
                    errors.email ? 'border-rose-400' : 'border-border'
                  }`}
                />
                {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Specialisation */}
            <div>
              <label className="block text-xs font-medium text-ink mb-1.5">
                Primary specialisation <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.specialisation}
                onChange={(e) => set('specialisation', e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm text-ink border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors ${
                  errors.specialisation ? 'border-rose-400' : 'border-border'
                }`}
              >
                <option value="">Select your main area</option>
                {SPECIALISATIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.specialisation && (
                <p className="text-xs text-rose-500 mt-1">{errors.specialisation}</p>
              )}
            </div>

            {/* Portfolio + Tools */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-ink mb-1.5">
                  Portfolio or website
                </label>
                <input
                  type="url"
                  value={form.portfolioUrl}
                  onChange={(e) => set('portfolioUrl', e.target.value)}
                  placeholder="https://yoursite.com"
                  className="w-full px-3.5 py-2.5 text-sm text-ink border border-border rounded-lg bg-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink mb-1.5">
                  Key tools &amp; stack
                </label>
                <input
                  type="text"
                  value={form.tools}
                  onChange={(e) => set('tools', e.target.value)}
                  placeholder="e.g. Shopify, Figma, React"
                  className="w-full px-3.5 py-2.5 text-sm text-ink border border-border rounded-lg bg-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                />
              </div>
            </div>

            {/* About */}
            <div>
              <label className="block text-xs font-medium text-ink mb-1.5">
                Tell us about yourself <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={form.message}
                onChange={(e) => set('message', e.target.value)}
                rows={5}
                placeholder="What you've built, what kinds of projects excite you, what you're looking for in a working relationship..."
                className={`w-full px-3.5 py-2.5 text-sm text-ink border rounded-lg bg-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none transition-colors ${
                  errors.message ? 'border-rose-400' : 'border-border'
                }`}
              />
              {errors.message && <p className="text-xs text-rose-500 mt-1">{errors.message}</p>}
            </div>

            {serverError && (
              <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-4 py-3">
                {serverError}
              </p>
            )}

            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-ink text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-[#222] disabled:opacity-60 transition-[background-color] duration-150"
              >
                {submitting ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : (
                  'Submit application'
                )}
              </button>
              <p className="text-[11px] text-muted">We review every application personally.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
