'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

type RequestInfo = {
  clientName: string
  serviceTitle: string
  isValid: boolean
  reason?: string
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none transition-transform hover:scale-110"
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          <svg
            className={`h-9 w-9 transition-colors ${
              star <= (hovered || value) ? 'text-amber-400' : 'text-[#E2E8F0]'
            }`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354l-4.543 2.826c-.998.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433L10.788 3.21z" />
          </svg>
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm font-medium text-[#64748B]">
          {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][value]}
        </span>
      )}
    </div>
  )
}

export default function TestimonialSubmitPage() {
  const { token } = useParams<{ token: string }>()
  const [info, setInfo] = useState<RequestInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const [rating, setRating] = useState(0)
  const [quote, setQuote] = useState('')
  const [role, setRole] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<RequestInfo>(`/testimonials/request/${token}`)
      .then(setInfo)
      .catch(() => setInfo({ clientName: '', serviceTitle: '', isValid: false, reason: 'not_found' }))
      .finally(() => setLoading(false))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (rating === 0) { setError('Please select a star rating.'); return }
    if (!quote.trim()) { setError('Please share a few words about your experience.'); return }

    setSubmitting(true)
    try {
      await api.post(`/testimonials/request/${token}`, { rating, quote: quote.trim(), role: role.trim() || undefined })
      setSubmitted(true)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message
      setError(msg ?? 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#1E3A8A]/30 border-t-[#1E3A8A] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Nav */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-4">
        <Link href="/" className="text-base font-bold text-[#0F172A] tracking-tight">
          E<span className="text-[#1E3A8A]">-Tech.</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">

          {/* Invalid / already used / expired states */}
          {info && !info.isValid && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center shadow-sm">
              {info.reason === 'already_used' ? (
                <>
                  <div className="h-14 w-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1 className="text-lg font-semibold text-[#0F172A] mb-2">Already submitted</h1>
                  <p className="text-sm text-[#64748B]">You've already left your review. Thank you for your feedback!</p>
                </>
              ) : info.reason === 'expired' ? (
                <>
                  <div className="h-14 w-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-7 w-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <h1 className="text-lg font-semibold text-[#0F172A] mb-2">Link expired</h1>
                  <p className="text-sm text-[#64748B]">This review link has expired. Please contact us if you'd like to leave feedback.</p>
                </>
              ) : (
                <>
                  <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h1 className="text-lg font-semibold text-[#0F172A] mb-2">Link not found</h1>
                  <p className="text-sm text-[#64748B]">This review link is invalid or has already been used.</p>
                </>
              )}
            </div>
          )}

          {/* Success state */}
          {submitted && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center shadow-sm">
              <div className="h-14 w-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-[#0F172A] mb-2">Thank you{info?.clientName ? `, ${info.clientName.split(' ')[0]}` : ''}!</h1>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Your feedback means a lot to us. We review every submission and use it to keep improving our services.
              </p>
              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-block text-xs font-semibold text-[#1E3A8A] hover:underline"
                >
                  ← Back to E-Tech
                </Link>
              </div>
            </div>
          )}

          {/* The form */}
          {info?.isValid && !submitted && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-8 pt-8 pb-6 border-b border-[#E2E8F0]">
                <p className="text-xs font-semibold text-[#1E3A8A] uppercase tracking-[0.1em] mb-2">Your review</p>
                <h1 className="text-xl font-semibold text-[#0F172A] leading-snug">
                  How was your experience with <span className="text-[#1E3A8A]">{info.serviceTitle}</span>?
                </h1>
                <p className="text-sm text-[#64748B] mt-2">
                  Your honest feedback helps us improve and helps other businesses make the right choice.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
                {/* Star rating */}
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-[0.08em] mb-3">
                    Overall rating <span className="text-red-500">*</span>
                  </label>
                  <StarRating value={rating} onChange={setRating} />
                </div>

                {/* Quote */}
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-[0.08em] mb-2">
                    Your experience <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder="What stood out? What made the difference? Would you recommend us?"
                    rows={4}
                    maxLength={600}
                    className="w-full rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]/40 resize-none transition-colors"
                  />
                  <p className="text-[11px] text-[#94A3B8] mt-1 text-right">{quote.length}/600</p>
                </div>

                {/* Role (optional) */}
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-[0.08em] mb-2">
                    Your role <span className="text-[#94A3B8] font-normal normal-case">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Founder at Acme Co."
                    maxLength={100}
                    className="w-full rounded-xl border border-[#E2E8F0] px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]/40 transition-colors"
                  />
                </div>

                {/* Name display */}
                <div className="bg-[#F8FAFC] rounded-xl px-4 py-3 border border-[#E2E8F0]">
                  <p className="text-xs text-[#64748B]">
                    Your review will be attributed to <span className="font-semibold text-[#0F172A]">{info.clientName}</span>
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2.5 border border-red-100">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#1E3A8A] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#1E3A8A]/90 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Submitting…' : 'Submit review'}
                </button>

                <p className="text-[11px] text-center text-[#94A3B8]">
                  Reviews are moderated before being published on our website.
                </p>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
