'use client'

import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const BUDGETS = ['< $10k', '$10k – $25k', '$25k – $50k', '$50k – $100k', '$100k+']

export type InquiryType = 'project' | 'theme-purchase' | 'theme-demo' | 'other'

const INQUIRY_TYPES: { id: InquiryType; label: string }[] = [
  { id: 'project', label: 'New project' },
  { id: 'theme-purchase', label: 'Theme purchase' },
  { id: 'theme-demo', label: 'Theme demo' },
  { id: 'other', label: 'Other' },
]

const MESSAGE_PLACEHOLDERS: Record<InquiryType, string> = {
  project: 'Tell us about your project, goals, and timeline...',
  'theme-purchase': 'Which license are you interested in? What is your store URL?',
  'theme-demo': 'What do you sell? Any specific sections or flows you would like to see configured?',
  other: 'Tell us what is on your mind...',
}

const SUBMIT_LABELS: Record<InquiryType, string> = {
  project: 'Send enquiry',
  'theme-purchase': 'Send purchase enquiry',
  'theme-demo': 'Request demo store',
  other: 'Send message',
}

type FormState = {
  name: string
  email: string
  company: string
  budget: string
  message: string
  inquiryType: InquiryType
}

type FormErrors = Partial<Record<keyof FormState, string>>

type Props = {
  initialInquiryType?: InquiryType
  initialTheme?: string
  initialIntent?: string
  initialMessage?: string
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function ContactForm({
  initialInquiryType = 'project',
  initialTheme,
  initialIntent,
  initialMessage = '',
}: Props) {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    company: '',
    budget: '',
    message: initialMessage,
    inquiryType: initialInquiryType,
  })

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validate(): FormErrors {
    const errors: FormErrors = {}
    if (!form.name.trim() || form.name.trim().length < 2) {
      errors.name = 'Please enter your name'
    }
    if (!form.email.trim()) {
      errors.email = 'Please enter your email'
    } else if (!validateEmail(form.email)) {
      errors.email = 'Please enter a valid email address'
    }
    if (!form.message.trim() || form.message.trim().length < 20) {
      errors.message = 'Please describe your enquiry (at least 20 characters)'
    }
    return errors
  }

  const errors: FormErrors = attempted ? validate() : {}
  const isValid = Object.keys(validate()).length === 0

  const showBudget = form.inquiryType === 'project' || form.inquiryType === 'other'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setAttempted(true)
    if (!isValid) return

    setLoading(true)
    setSubmitError(null)
    try {
      const res = await fetch(`${API_URL}/api/v1/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company,
          budget: form.budget || undefined,
          message: form.message,
          inquiryType: form.inquiryType,
          theme: initialTheme || undefined,
          intent: initialIntent || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg =
          res.status === 429
            ? 'Too many submissions. Please wait 15 minutes and try again.'
            : ((data as { error?: string }).error ?? 'Submission failed. Please try again.')
        throw new Error(msg)
      }
      setSent(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center py-12 px-6 animate-fade-up">
        <div className="h-10 w-10 rounded-full bg-ink/[0.06] flex items-center justify-center mx-auto mb-4">
          <svg
            className="h-4 w-4 text-ink"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="2.5 8.5 6.5 12.5 13.5 4.5" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-ink tracking-tight">{"We'll be in touch."}</h3>
        <p className="text-sm text-muted mt-1.5">Expect a response within one business day.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Inquiry type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-ink">Enquiry type</label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Enquiry type">
          {INQUIRY_TYPES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => set('inquiryType', id)}
              aria-pressed={form.inquiryType === id}
              className={[
                'px-3 py-2 md:py-1.5 text-xs rounded-md border',
                'transition-[background-color,color,border-color,transform] duration-150',
                'active:scale-[0.96]',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink',
                form.inquiryType === id
                  ? 'bg-ink text-white border-ink'
                  : 'border-border text-muted hover:border-ink/50 hover:text-ink',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Alex Johnson"
          error={errors.name}
          autoComplete="name"
        />
        <Input
          label="Work email"
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder="alex@company.com"
          error={errors.email}
          autoComplete="email"
        />
      </div>

      <Input
        label="Company"
        value={form.company}
        onChange={(e) => set('company', e.target.value)}
        placeholder="Acme Inc."
        autoComplete="organization"
      />

      {showBudget && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink">Budget range</label>
          <div className="flex flex-wrap gap-2">
            {BUDGETS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => set('budget', b)}
                aria-pressed={form.budget === b}
                className={[
                  'px-3 py-2 md:py-1.5 text-xs rounded-md border',
                  'transition-[background-color,color,border-color,transform] duration-150',
                  'active:scale-[0.96]',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink',
                  form.budget === b
                    ? 'bg-ink text-white border-ink'
                    : 'border-border text-muted hover:border-ink/50 hover:text-ink',
                ].join(' ')}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="message" className="block text-sm font-medium text-ink">
          {form.inquiryType === 'theme-purchase'
            ? 'Purchase details'
            : form.inquiryType === 'theme-demo'
            ? 'Demo request details'
            : 'Project brief'}
        </label>
        <textarea
          id="message"
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          placeholder={MESSAGE_PLACEHOLDERS[form.inquiryType]}
          rows={5}
          className={[
            'w-full px-3 py-2.5 text-sm border rounded-md bg-white text-ink placeholder:text-[#9ca3af]',
            'transition-[border-color,box-shadow] duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-ink focus-visible:border-ink resize-none',
            errors.message ? 'border-red-400' : 'border-border',
          ].join(' ')}
        />
        {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
        {form.message.length > 0 && (
          <p className="text-[11px] text-muted/60 text-right">{form.message.length} characters</p>
        )}
      </div>

      {submitError && (
        <div className="rounded-md bg-red-50 border border-red-100 px-3 py-2.5">
          <p className="text-sm text-red-600">{submitError}</p>
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full">
        {SUBMIT_LABELS[form.inquiryType]}
      </Button>

      {attempted && !isValid && (
        <p className="text-xs text-muted text-center">
          Please fix the fields above before sending.
        </p>
      )}
    </form>
  )
}
