'use client'

import { useEffect, useRef, useState } from 'react'
import type { Campaign } from '@/types'
import { ArrowRightIcon } from '@/components/ui/Icons'

// ─── Position map ─────────────────────────────────────────────────────────────

const POSITION_CLASS: Record<string, string> = {
  'top':           'top-0 left-0 right-0',
  'bottom-left':   'bottom-6 left-6',
  'bottom-right':  'bottom-6 right-6',
  'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
}

// ─── Announcement bar ─────────────────────────────────────────────────────────

function AnnouncementBar({
  campaign,
  onDismiss,
  onClick,
}: {
  campaign: Campaign
  onDismiss: () => void
  onClick: () => void
}) {
  const bg   = campaign.bgColor   || '#111111'
  const fg   = campaign.textColor || '#ffffff'

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60]"
      style={{ background: bg, color: fg }}
    >
      <div className="flex items-center justify-between gap-4 px-5 py-2.5 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 min-w-0">
          {campaign.heading && (
            <p className="text-sm font-medium truncate">{campaign.heading}</p>
          )}
          {campaign.body && (
            <p className="text-sm truncate hidden md:block" style={{ color: fg + 'bb' }}>{campaign.body}</p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {campaign.ctaLabel && campaign.ctaUrl && (
            <a
              href={campaign.ctaUrl}
              target={campaign.ctaNewTab ? '_blank' : undefined}
              rel={campaign.ctaNewTab ? 'noopener noreferrer' : undefined}
              onClick={onClick}
              className="text-xs font-medium underline underline-offset-2 hover:no-underline transition-all duration-150"
              style={{ color: fg }}
            >
              {campaign.ctaLabel}
            </a>
          )}
          {campaign.dismissible && (
            <button
              onClick={onDismiss}
              aria-label="Dismiss"
              className="h-6 w-6 flex items-center justify-center transition-opacity duration-150 opacity-50 hover:opacity-100"
              style={{ color: fg }}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Floating card ────────────────────────────────────────────────────────────

function FloatingCard({
  campaign,
  onDismiss,
  onClick,
  onConvert,
}: {
  campaign: Campaign
  onDismiss: () => void
  onClick: () => void
  onConvert: () => void
}) {
  const [collapsed, setCollapsed]   = useState(false)
  const [progress, setProgress]     = useState(100)
  const [visible, setVisible]       = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  // Progress bar
  useEffect(() => {
    if (!campaign.duration) return
    const tick = 100 / (campaign.duration * 10)
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p - tick
        if (next <= 0) {
          clearInterval(timerRef.current!)
          if (campaign.collapseToWidget) setCollapsed(true)
          return 0
        }
        return next
      })
    }, 100)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [campaign.duration, campaign.collapseToWidget])

  const posClass = POSITION_CLASS[campaign.position] ?? POSITION_CLASS['bottom-right']
  const bg  = campaign.bgColor   || '#111111'
  const fg  = campaign.textColor || '#ffffff'

  // ── Collapsed pill ────────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <div className={`fixed z-[60] ${posClass}`}>
        <button
          onClick={() => {
            setCollapsed(false)
            setProgress(0)
          }}
          className="flex items-center gap-2.5 rounded-full pl-3 pr-4 py-2 text-xs font-medium shadow-lg transition-opacity duration-150 hover:opacity-90"
          style={{ background: bg, color: fg }}
        >
          <span
            className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
            style={{ background: fg + '22', color: fg }}
          >
            ET
          </span>
          {campaign.ctaLabel ?? campaign.heading ?? 'View offer'}
          <ArrowRightIcon className="h-3 w-3 opacity-60" />
        </button>
      </div>
    )
  }

  // ── Full card ─────────────────────────────────────────────────────────────
  return (
    <div
      className={`fixed z-[60] ${posClass} transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
    >
      <div className="w-[300px] bg-white border border-[#e8e8e8] rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-4 pb-0 gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="h-7 w-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: bg }}
            >
              <span className="text-[9px] font-bold" style={{ color: fg }}>ET</span>
            </span>
            {campaign.heading && (
              <p className="text-[13px] font-semibold text-ink leading-snug">{campaign.heading}</p>
            )}
          </div>
          {campaign.dismissible && (
            <button
              onClick={onDismiss}
              aria-label="Dismiss"
              className="h-6 w-6 flex items-center justify-center text-muted/40 hover:text-ink transition-[color] duration-150 shrink-0 mt-0.5"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Body */}
        {campaign.body && (
          <p className="px-4 pt-2.5 pb-0 text-[13px] text-muted leading-relaxed">{campaign.body}</p>
        )}

        {/* Actions */}
        {(campaign.ctaLabel || campaign.secondaryCtaLabel) && (
          <div className="px-4 pt-3.5 pb-4 flex items-center gap-2.5">
            {campaign.ctaLabel && campaign.ctaUrl && (
              <a
                href={campaign.ctaUrl}
                target={campaign.ctaNewTab ? '_blank' : undefined}
                rel={campaign.ctaNewTab ? 'noopener noreferrer' : undefined}
                onClick={() => { onClick(); onConvert() }}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-lg transition-opacity duration-150 hover:opacity-90"
                style={{ background: bg, color: fg }}
              >
                {campaign.ctaLabel}
                <ArrowRightIcon className="h-3 w-3" />
              </a>
            )}
            {campaign.secondaryCtaLabel && campaign.secondaryCtaUrl && (
              <a
                href={campaign.secondaryCtaUrl}
                onClick={onClick}
                className="text-xs text-muted hover:text-ink transition-[color] duration-150 underline underline-offset-2"
              >
                {campaign.secondaryCtaLabel}
              </a>
            )}
            {!campaign.secondaryCtaUrl && campaign.dismissible && (
              <button
                onClick={onDismiss}
                className="text-xs text-muted hover:text-ink transition-[color] duration-150"
              >
                Not now
              </button>
            )}
          </div>
        )}

        {/* Timer bar */}
        {campaign.duration && progress > 0 && (
          <div className="h-[2px] bg-surface">
            <div
              className="h-full transition-none"
              style={{ width: `${progress}%`, background: bg + '55' }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Public export ────────────────────────────────────────────────────────────

export function CampaignWidget({
  campaign,
  onDismiss,
  onClick,
  onConvert,
}: {
  campaign: Campaign
  onDismiss: () => void
  onClick:   () => void
  onConvert: () => void
}) {
  if (campaign.placement === 'announcement_bar' || campaign.placement === 'sticky_footer') {
    return <AnnouncementBar campaign={campaign} onDismiss={onDismiss} onClick={onClick} />
  }
  return (
    <FloatingCard
      campaign={campaign}
      onDismiss={onDismiss}
      onClick={onClick}
      onConvert={onConvert}
    />
  )
}
