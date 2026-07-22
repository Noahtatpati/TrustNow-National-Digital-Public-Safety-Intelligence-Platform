import { cn } from '@/lib/utils'
import { Button } from './button'
import { Skeleton } from './skeleton'

type StateWrapperProps = {
  isLoading: boolean
  isEmpty: boolean
  isError: boolean
  loadingComponent?: React.ReactNode
  emptyComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  onRetry?: () => void
  children: React.ReactNode
  className?: string
}

export function StateWrapper({
  isLoading,
  isEmpty,
  isError,
  loadingComponent,
  emptyComponent,
  errorComponent,
  onRetry,
  children,
  className,
}: StateWrapperProps) {
  if (isLoading) {
    return (
      <div className={cn('transition-opacity duration-200', className)}>
        {loadingComponent || (
          <div className="space-y-3">
            <SkeletonLine />
            <SkeletonLine />
            <SkeletonLine className="w-3/4" />
          </div>
        )}
      </div>
    )
  }

  if (isError) {
    return (
      <div className={cn('border-l-2 border-risk-high pl-4 py-2', className)}>
        {errorComponent || (
          <div className="space-y-2">
            <p className="text-sm text-et-secondary">Failed to load. Click to retry.</p>
            {onRetry && (
              <Button variant="link" size="sm" onClick={onRetry}>
                Retry
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className={cn('py-8 text-center', className)}>
        {emptyComponent || (
          <p className="text-sm text-et-secondary">No data available</p>
        )}
      </div>
    )
  }

  return <div className={cn(className)}>{children}</div>
}

function SkeletonLine({ className }: { className?: string }) {
  return (
    <Skeleton className={cn('h-4 w-full', className)} />
  )
}
