import Image from 'next/image'

// Renders a screenshot inside a browser chrome frame.
// Use frame="none" for full-bleed presentation without chrome.

type Props = {
  src: string
  alt: string
  caption?: string
  frame?: 'browser' | 'none'
  width?: number
  height?: number
  priority?: boolean
}

export function ScreenshotFrame({
  src,
  alt,
  caption,
  frame = 'browser',
  width = 1440,
  height = 900,
  priority = false,
}: Props) {
  return (
    <figure>
      {frame === 'browser' ? (
        <div className="rounded-xl overflow-hidden border border-border shadow-sm">
          {/* Browser chrome bar */}
          <div className="h-9 bg-[#e8e8e8] flex items-center px-3 gap-2 border-b border-black/[0.06] shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" aria-hidden="true" />
            </div>
            <div className="flex-1 mx-4">
              <div className="h-5 bg-white/80 rounded-sm max-w-sm mx-auto flex items-center px-3">
                <span className="text-[10px] text-[#9ca3af] truncate">{alt}</span>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden">
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              className="w-full h-auto block"
              priority={priority}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden border border-border">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="w-full h-auto block"
            priority={priority}
          />
        </div>
      )}
      {caption && (
        <figcaption className="text-[11px] text-muted/50 mt-3 text-center leading-relaxed">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
