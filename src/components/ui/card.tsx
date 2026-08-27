import * as React from 'react'
import { cn } from '@/lib/utils'

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-[28px] border border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(18,48,46,0.08)] backdrop-blur-sm',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-2 p-6 sm:p-7', className)} {...props} />
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('font-display text-2xl font-semibold text-ink', className)} {...props} />
}

function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('text-sm leading-6 text-slate-500', className)} {...props} />
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('px-6 pb-6 sm:px-7 sm:pb-7', className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex items-center p-6 pt-0 sm:px-7 sm:pb-7', className)} {...props} />
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
