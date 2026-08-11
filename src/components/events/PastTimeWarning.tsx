import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

type PastTimeWarningProps = {
  message: string
  className?: string
}

export function PastTimeWarning({ message, className }: PastTimeWarningProps) {
  return (
    <p
      className={cn(
        'flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400',
        className,
      )}
      role="alert"
    >
      <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  )
}
