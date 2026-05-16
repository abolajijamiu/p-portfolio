'use client'

import { useState } from 'react'

type Platform = 'youtube' | 'loom' | 'vimeo'

type Props = {
  id: string
  platform: Platform
  title?: string
  caption?: string
  /** Shown under the play button before the user clicks */
  posterText?: string
}

function embedUrl(platform: Platform, id: string): string {
  switch (platform) {
    case 'youtube':
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&color=white`
    case 'loom':
      return `https://www.loom.com/embed/${id}?autoplay=1&hide_share=1&hide_title=1`
    case 'vimeo':
      return `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1&title=0&byline=0&portrait=0`
  }
}

const PLATFORM_LABEL: Record<Platform, string> = {
  youtube: 'YouTube',
  loom: 'Loom',
  vimeo: 'Vimeo',
}

export function VideoEmbed({ id, platform, title, caption, posterText }: Props) {
  const [playing, setPlaying] = useState(false)

  return (
    <figure>
      <div className="relative aspect-video rounded-xl overflow-hidden bg-[#0a0a0a]">
        {playing ? (
          <iframe
            src={embedUrl(platform, id)}
            title={title ?? 'Video walkthrough'}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center group cursor-pointer"
            aria-label={`Play ${title ?? 'video'}`}
          >
            {/* Subtle grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage:
                  'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            {/* Play button */}
            <div className="relative flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/50 group-hover:bg-white/[0.06] transition-all duration-200">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 ml-1"
                  fill="white"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              {title && (
                <div className="flex flex-col items-center gap-1.5">
                  <p className="text-white/60 text-[11px] font-medium uppercase tracking-[0.2em]">
                    {title}
                  </p>
                  {posterText && (
                    <p className="text-white/25 text-xs max-w-xs text-center leading-relaxed">
                      {posterText}
                    </p>
                  )}
                </div>
              )}
            </div>
            {/* Platform label — bottom right */}
            <span className="absolute bottom-3 right-4 text-[10px] text-white/20 font-medium tracking-wide">
              {PLATFORM_LABEL[platform]}
            </span>
          </button>
        )}
      </div>
      {caption && (
        <figcaption className="text-[11px] text-muted/50 mt-3 text-center leading-relaxed">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
