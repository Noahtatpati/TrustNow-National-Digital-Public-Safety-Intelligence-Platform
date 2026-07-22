import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Separator = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('h-px w-full bg-et-divider', className)}
      {...props}
    />
  )
)
Separator.displayName = 'Separator'

export { Separator }
