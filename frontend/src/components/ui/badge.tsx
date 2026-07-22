import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-medium transition-colors duration-150',
  {
    variants: {
      variant: {
        default: 'bg-et-divider text-et-text',
        risk: 'bg-risk-high/10 text-risk-high',
        warning: 'bg-risk-medium/10 text-risk-medium',
        safe: 'bg-risk-low/10 text-risk-low',
        outline: 'border border-et-border text-et-secondary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
