import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

type EditorialImageProps = {
  src: string
  alt: string
  caption?: string
  credit?: string
  className?: string
  wrapperClassName?: string
  aspectRatio?: string
  lazy?: boolean
  fallback?: string
}

export function EditorialImage({
  src,
  alt,
  caption,
  credit,
  className,
  wrapperClassName,
  aspectRatio = '16/9',
  lazy = true,
  fallback,
}: EditorialImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const [visible, setVisible] = useState(!lazy)

  useEffect(() => {
    if (!lazy || !imgRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(imgRef.current)
    return () => observer.disconnect()
  }, [lazy])

  const displaySrc = error && fallback ? fallback : src

  return (
    <figure ref={imgRef} className={cn('overflow-hidden', wrapperClassName)}>
      <div
        className={cn(
          'relative overflow-hidden bg-[#F0EFEA]',
          !loaded && 'animate-pulse',
          className
        )}
        style={{ aspectRatio }}
      >
        {visible && (
          <img
            src={displaySrc}
            alt={alt}
            loading={lazy ? 'lazy' : 'eager'}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-500',
              loaded ? 'opacity-100' : 'opacity-0'
            )}
          />
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-xs text-et-secondary leading-relaxed">
          {caption}
          {credit && (
            <span className="text-[10px] text-et-border ml-1 uppercase tracking-wider">
              &mdash; {credit}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  )
}
