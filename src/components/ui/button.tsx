import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-4 focus-visible:ring-ink/10',
  {
    variants: {
      variant: {
        default:
          'bg-ink text-paper shadow-[0_14px_32px_rgba(18,48,46,0.22)] hover:bg-ink-light hover:shadow-[0_18px_36px_rgba(18,48,46,0.26)]',
        secondary:
          'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50',
        ghost: 'text-paper/70 hover:bg-paper/8 hover:text-paper',
        outline: 'border border-ink/10 bg-paper text-ink hover:bg-white',
      },
      size: {
        default: 'h-11 px-4 py-2.5',
        sm: 'h-9 rounded-xl px-3',
        lg: 'h-12 px-5 py-3',
        icon: 'h-11 w-11 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  },
)
Button.displayName = 'Button'

export { Button }
