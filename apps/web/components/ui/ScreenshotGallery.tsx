'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

export type ScreenshotDevice = 'desktop' | 'tablet' | 'mobile'

export type Screenshot = {
  url: string
  caption?: string
  device?: ScreenshotDevice
  alt?: string
}

export type BeforeAfter = {
  before: Screenshot
  after: Screenshot
  label?: string
}

type Props = {
  screenshots?: Screenshot[]
  beforeAfter?: BeforeAfter[]
  defaultDevice?: ScreenshotDevice
  showDeviceTabs?: boolean
  className?: string
}

const DEVICE_LABEL: Record<ScreenshotDevice, string> = {
  desktop: 'Desktop',
  tablet: 'Tablet',
  mobile: 'Mobile',
}

const DEVICE_ASPECT: Record<ScreenshotDevice, string> = {
  desktop: 'aspect-[16/9]',
  tablet: 'aspect-[3/4]',
  mobile: 'aspect-[9/19.5]',
}

const DEVICE_MAX: Record<ScreenshotDevice, string> = {
  desktop: 'max-w-full',
  tablet: 'max-w-sm',
  mobile: 'max-w-[220px]',
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: { url: string; caption?: string; alt?: string }[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const current = images[index]

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, onPrev, onNext])

  if (!current) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors text-sm flex items-center gap-1.5"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Close
        </button>

        {/* Image */}
        <div className="relative w-full max-h-[80vh] overflow-hidden rounded-xl">
          <Image
            src={current.url}
            alt={current.alt ?? current.caption ?? ''}
            width={1400}
            height={900}
            className="object-contain w-full h-auto max-h-[80vh]"
            priority
          />
        </div>

        {/* Caption + nav */}
        <div className="mt-4 flex items-center justify-between w-full gap-4">
          <button
            onClick={onPrev}
            disabled={images.length <= 1}
            className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm disabled:opacity-0"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Prev
          </button>
          <div className="text-center">
            {current.caption && <p className="text-white/80 text-sm">{current.caption}</p>}
            {images.length > 1 && (
              <p className="text-white/30 text-xs mt-1">{index + 1} / {images.length}</p>
            )}
          </div>
          <button
            onClick={onNext}
            disabled={images.length <= 1}
            className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm disabled:opacity-0"
          >
            Next
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Before / After card ──────────────────────────────────────────────────────

function BeforeAfterCard({ pair, onOpenBefore, onOpenAfter }: {
  pair: BeforeAfter
  onOpenBefore: () => void
  onOpenAfter: () => void
}) {
  return (
    <div className="space-y-2">
      {pair.label && <p className="text-xs font-semibold text-muted uppercase tracking-wider">{pair.label}</p>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <button
            onClick={onOpenBefore}
            className="w-full group relative block overflow-hidden rounded-xl border border-border bg-surface hover:border-muted/40 transition-[border-color] duration-150"
          >
            <div className="absolute top-2 left-2 z-10 text-[10px] font-bold text-white bg-rose-500 px-2 py-0.5 rounded-full">Before</div>
            <Image
              src={pair.before.url}
              alt={pair.before.alt ?? 'Before'}
              width={600}
              height={400}
              className="w-full object-cover group-hover:scale-[1.01] transition-transform duration-200"
            />
            {pair.before.caption && (
              <p className="px-3 py-2 text-xs text-muted">{pair.before.caption}</p>
            )}
          </button>
        </div>
        <div>
          <button
            onClick={onOpenAfter}
            className="w-full group relative block overflow-hidden rounded-xl border border-border bg-surface hover:border-brand/30 transition-[border-color] duration-150"
          >
            <div className="absolute top-2 left-2 z-10 text-[10px] font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full">After</div>
            <Image
              src={pair.after.url}
              alt={pair.after.alt ?? 'After'}
              width={600}
              height={400}
              className="w-full object-cover group-hover:scale-[1.01] transition-transform duration-200"
            />
            {pair.after.caption && (
              <p className="px-3 py-2 text-xs text-muted">{pair.after.caption}</p>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ScreenshotGallery({
  screenshots = [],
  beforeAfter = [],
  defaultDevice,
  showDeviceTabs = true,
  className = '',
}: Props) {
  const hasDevices = screenshots.some((s) => s.device)
  const availableDevices = hasDevices
    ? (['desktop', 'tablet', 'mobile'] as ScreenshotDevice[]).filter((d) =>
        screenshots.some((s) => s.device === d || !s.device)
      )
    : []

  const [activeDevice, setActiveDevice] = useState<ScreenshotDevice | null>(
    defaultDevice ?? (availableDevices[0] ?? null)
  )
  const [lightboxImages, setLightboxImages] = useState<{ url: string; caption?: string; alt?: string }[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const visibleScreenshots = activeDevice && hasDevices
    ? screenshots.filter((s) => !s.device || s.device === activeDevice)
    : screenshots

  function openLightbox(images: { url: string; caption?: string; alt?: string }[], index: number) {
    setLightboxImages(images)
    setLightboxIndex(index)
  }

  const closeLightbox = useCallback(() => setLightboxImages([]), [])
  const prevImage = useCallback(() => setLightboxIndex((i) => (i - 1 + lightboxImages.length) % lightboxImages.length), [lightboxImages.length])
  const nextImage = useCallback(() => setLightboxIndex((i) => (i + 1) % lightboxImages.length), [lightboxImages.length])

  // Build flat lightbox list for before/after pairs
  const beforeAfterFlat = beforeAfter.flatMap((p) => [p.before, p.after])

  const hasContent = visibleScreenshots.length > 0 || beforeAfter.length > 0
  if (!hasContent) return null

  const inferDevice = (s: Screenshot): ScreenshotDevice => s.device ?? 'desktop'

  return (
    <div className={className}>
      {/* Device tabs */}
      {showDeviceTabs && hasDevices && availableDevices.length > 1 && (
        <div className="flex items-center gap-1 mb-5 border border-border rounded-lg bg-surface p-1 w-fit">
          {availableDevices.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDevice(d)}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-[background-color,color] duration-150 ${
                activeDevice === d ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              {DEVICE_LABEL[d]}
            </button>
          ))}
        </div>
      )}

      {/* Before / After pairs */}
      {beforeAfter.length > 0 && (
        <div className="space-y-6 mb-6">
          {beforeAfter.map((pair, pi) => (
            <BeforeAfterCard
              key={pi}
              pair={pair}
              onOpenBefore={() => openLightbox(beforeAfterFlat, pi * 2)}
              onOpenAfter={() => openLightbox(beforeAfterFlat, pi * 2 + 1)}
            />
          ))}
        </div>
      )}

      {/* Screenshot grid */}
      {visibleScreenshots.length > 0 && (
        <div
          className={`grid gap-4 ${
            visibleScreenshots.length === 1
              ? 'grid-cols-1'
              : visibleScreenshots.length === 2
              ? 'grid-cols-2'
              : 'grid-cols-2 md:grid-cols-3'
          }`}
        >
          {visibleScreenshots.map((s, i) => {
            const device = inferDevice(s)
            return (
              <button
                key={i}
                onClick={() => openLightbox(visibleScreenshots, i)}
                className="group block overflow-hidden rounded-xl border border-border bg-surface hover:border-brand/30 hover:shadow-sm transition-[border-color,box-shadow] duration-150 text-left"
              >
                <div className={`mx-auto ${DEVICE_MAX[device]}`}>
                  <div className={`relative ${DEVICE_ASPECT[device]} overflow-hidden`}>
                    <Image
                      src={s.url}
                      alt={s.alt ?? s.caption ?? ''}
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-200"
                    />
                  </div>
                </div>
                {s.caption && (
                  <p className="px-3 py-2 text-xs text-muted">{s.caption}</p>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightboxImages.length > 0 && (
        <Lightbox
          images={lightboxImages}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}
    </div>
  )
}
