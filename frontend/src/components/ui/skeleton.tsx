import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-sm bg-[#F0EFEA]',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
