import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { EditorialImage } from './editorial-image'

type InvestigationCardProps = {
  id: string
  headline: string
  summary: string
  category: string
  date: string
  status: string
  imageSrc: string
  imageAlt: string
  caption?: string
  location?: string
  risk?: string
  className?: string
}

export function InvestigationCard({
  id,
  headline,
  summary,
  category,
  date,
  status,
  imageSrc,
  imageAlt,
  caption,
  location,
  risk,
  className,
}: InvestigationCardProps) {
  const badgeVariant = status === 'active' ? 'risk' : 'default'
  const riskColor = risk === 'high' ? 'bg-risk-high' : risk === 'medium' ? 'bg-risk-medium' : 'bg-risk-low'

  return (
    <Link
      to={`/investigations/${id}`}
      className={cn(
        'group block border border-et-divider rounded-sm overflow-hidden transition-all duration-150 hover:border-et-text',
        className
      )}
    >
      <EditorialImage
        src={imageSrc}
        alt={imageAlt}
        aspectRatio="16/9"
        caption={caption}
      />
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={badgeVariant} className="text-[10px]">
            {status === 'active' ? 'Active' : 'Closed'}
          </Badge>
          <span className="text-[10px] text-et-secondary uppercase tracking-wider">{category}</span>
          {risk && (
            <span className={cn('ml-auto w-2 h-2 rounded-full', riskColor)} title={`${risk} risk`} />
          )}
        </div>
        <h3 className="font-serif font-semibold text-lg text-et-text group-hover:text-et-red transition-colors duration-150 leading-snug mb-2">
          {headline}
        </h3>
        {location && (
          <p className="text-xs text-et-secondary mb-2">{location}</p>
        )}
        <p className="text-sm text-et-secondary leading-relaxed line-clamp-2">
          {summary}
        </p>
        <p className="text-[10px] text-et-border uppercase tracking-wider mt-3">{date}</p>
      </div>
    </Link>
  )
}
