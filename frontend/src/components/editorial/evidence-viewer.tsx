import { useState } from 'react'
import { cn } from '@/lib/utils'
import { EditorialImage } from './editorial-image'

type EvidenceItem = {
  id: string
  type: 'document' | 'image' | 'video' | 'audio'
  title: string
  date: string
  caption?: string
  src?: string
  duration?: string
  transcript?: string
}

type EvidenceViewerProps = {
  items: EvidenceItem[]
  className?: string
}

export function EvidenceViewer({ items, className }: EvidenceViewerProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveId(item.id === activeId ? null : item.id)}
          className={cn(
            'text-left border border-et-divider rounded-sm overflow-hidden transition-all duration-150 cursor-pointer',
            activeId === item.id ? 'border-et-red ring-1 ring-et-red' : 'hover:border-et-text'
          )}
        >
          {item.type === 'image' && item.src && (
            <EditorialImage
              src={item.src}
              alt={item.title}
              aspectRatio="16/10"
              wrapperClassName="[&_figcaption]:px-4 [&_figcaption]:pb-3"
              caption={item.caption}
            />
          )}
          {item.type === 'video' && (
            <div className="relative">
              <div className="aspect-[16/10] bg-[#F0EFEA] flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-et-border">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              {item.caption && (
                <p className="px-4 py-2 text-xs text-et-secondary">{item.caption}</p>
              )}
            </div>
          )}
          {item.type === 'audio' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-et-red">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
                <div className="flex-1">
                  <div className="h-8 bg-[#F0EFEA] rounded-sm flex items-center px-3">
                    <div className="flex items-center gap-0.5 w-full">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-et-red/30 rounded-full"
                          style={{
                            height: `${Math.sin(i * 0.5) * 12 + 6}px`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-et-secondary font-mono">{item.duration || '0:00'}</span>
              </div>
              {item.transcript && (
                <p className="text-xs text-et-secondary leading-relaxed line-clamp-2">
                  {item.transcript}
                </p>
              )}
              <button className="text-xs text-et-red underline-offset-2 hover:underline cursor-pointer">
                Download
              </button>
            </div>
          )}
          {item.type === 'document' && (
            <div className="p-4">
              <div className="flex items-start gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-et-red mt-0.5 shrink-0">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <div className="min-w-0">
                  <p className="text-sm text-et-text font-medium truncate">{item.title}</p>
                  {item.caption && (
                    <p className="text-xs text-et-secondary mt-0.5">{item.caption}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="px-4 py-2 border-t border-et-divider">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-et-secondary uppercase tracking-wider font-medium">
                {item.type}
              </span>
              <span className="text-[10px] text-et-secondary">{item.date}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
