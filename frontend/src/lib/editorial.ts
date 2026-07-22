import { assetUrl } from './assets'

type EditorialImageProps = {
  src: string
  alt: string
  caption?: string
  credit?: string
  className?: string
  width?: number
  height?: number
  lazy?: boolean
  fallback?: string
}

export function editorialImageProps({
  src,
  alt,
  caption,
  credit,
  className,
  width,
  height,
  lazy = true,
  fallback,
}: EditorialImageProps) {
  return {
    src: assetUrl(src),
    alt,
    caption,
    credit,
    className,
    width,
    height,
    lazy,
    fallback,
  }
}

export function riskLabel(severity: string): string {
  switch (severity) {
    case 'high': return 'High Risk'
    case 'medium': return 'Medium Risk'
    case 'low': return 'Low Risk'
    default: return severity
  }
}

export function formatDate(dateStr: string): string {
  return dateStr
}

export function locationLabel(region: string): string {
  return region
}
